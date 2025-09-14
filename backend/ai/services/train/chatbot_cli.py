# --- Make 'services' importable even when running this file directly ---
import os, sys
_THIS = os.path.dirname(__file__)                        # .../backend/ai/services/train
_AI_DIR = os.path.abspath(os.path.join(_THIS, "..", ".."))  # .../backend/ai
if _AI_DIR not in sys.path:
    sys.path.insert(0, _AI_DIR)
# ----------------------------------------------------------------------

import re, json, hashlib, datetime as dt
from typing import Dict, Optional
import difflib
from infer_doc_sem import predict as clf_predict
from typing import Optional
import requests

API_BASE = "http://127.0.0.1:8000/api"   # <--- change to your backend base
ACCESS_TOKEN = None
STUDENT_ID = None   # will be fetched from backend via access token

def login(email: str, password: str, role: Optional[str] = None) -> Optional[dict]:
    try:
        payload = {"email": email, "password": password}
        if role:
            payload["role"] = role  # include role if provided

        r = requests.post(
            f"{API_BASE}/auth/login/",
            json=payload,
            timeout=10
        )

        if r.status_code != 200:
            print(f"⚠️ Login failed: {r.status_code} {r.text}")
            return None

        data = r.json()
        print("🔍 Login response:", data)

        if "access" not in data:
            print("❌ Login succeeded but no access token returned")
            return None

        # Return full response including token
        return data

    except Exception as e:
        print("⚠️ login() error:", e)
        return None

def get_current_user(token: str) -> dict | None:
    """Verify token with backend and return user info dict (must include student_id or id)."""
    global STUDENT_ID
    if not token:
        return None
    headers = {"Authorization": f"Bearer {token}"}
    try:
        resp = requests.get(f"{API_BASE}/auth/me/", headers=headers, timeout=5)
        if resp.status_code == 200:
            data = resp.json()
            # Expect backend to include student_id or fallback to numeric id
            STUDENT_ID = data.get("student_id") or str(data.get("id"))
            return data
        else:
            print(f"⚠️ get_current_user: backend returned {resp.status_code}: {resp.text}")
            return None
    except Exception as e:
        print("⚠️ get_current_user error:", e)
        return None

def submit_document_request(token: str, doc_type, semester=None, school_year=None, purpose=None, other_doc_name=None, payment_method=None):
    headers = {"Authorization": f"Bearer {token}"}
    data = {
        "doc_type": doc_type,
        "semester": semester,
        "school_year": school_year,
        "purpose": purpose,
        "other_doc_name": other_doc_name,
        "payment_method": payment_method,
    }
    resp = requests.post(f"{API_BASE}/document-requests/create/", json=data, headers=headers)
    if resp.status_code == 201:
        doc = resp.json()
        print(f"✅ Request created: {doc['doc_type']} (Status: {doc['status']})")
        return doc
    else:
        print(f"❌ Failed to create request: {resp.text}")
        return None


def fetch_my_requests(token: str):
    """Fetch current user's document requests from backend."""
    headers = {"Authorization": f"Bearer {token}"}
    try:
        resp = requests.get(f"{API_BASE}/document-requests/", headers=headers, timeout=5)
        if resp.status_code == 200:
            return resp.json()
        else:
            print(f"⚠️ fetch_my_requests failed: {resp.status_code} {resp.text}")
            return []
    except Exception as e:
        print(f"⚠️ fetch_my_requests error: {e}")
        return []



# single source of truth (from backend/ai/services/policy.py)
from services.policy import POLICY_VERSION, DOC_TYPES as POLICY_DOC_TYPES, DOC_REQUIREMENTS
DOC_TYPES = set(POLICY_DOC_TYPES)


HERE = os.path.dirname(__file__)
SESS_DIR = os.path.join(HERE, "sessions")
os.makedirs(SESS_DIR, exist_ok=True)

UNPAID_STATUSES = {"draft", "confirming", "awaiting_payment"}
END_STATUSES = {"cancelled", "rejected", "ready_to_claim"}

# --- Same-day toggle (simulate admin setting for CLI demo) ---
SAME_DAY_ENABLED = False
SAME_DAY_REASON = ""  # e.g., "Classes suspended due to typhoon; cutoff 3PM."

# ---------- small helpers ----------
def now_iso():
    return dt.datetime.now().isoformat(timespec="seconds")

def md5(s: str) -> str:
    return hashlib.md5(s.strip().encode("utf-8")).hexdigest()

def _two_digit_year_to_full(y: int) -> int:
    return 2000 + y if y < 100 else y

def normalize_school_year(text: str) -> Optional[str]:
    s = text.replace("–", "-").replace("—", "-").replace("/", "-").strip().lower()

    m = re.search(r"\b(20\d{2})\s*-\s*(\d{2,4})\b", s)
    if m:
        y1 = int(m.group(1))
        y2_raw = int(m.group(2))
        y2 = _two_digit_year_to_full(y2_raw) if y2_raw < 100 else y2_raw
        if y2 == y1 + 1:
            return f"{y1}-{y2}"
        return None

    m = re.search(r"\b(\d{2})(\d{2})\b", s)
    if m:
        y1 = _two_digit_year_to_full(int(m.group(1)))
        y2 = _two_digit_year_to_full(int(m.group(2)))
        if y2 == y1 + 1:
            return f"{y1}-{y2}"

    return None


def normalize_semester(text: str) -> Optional[int]:
    s = text.lower()
    # direct numbers
    if re.search(r"\b(1|first|1st|sem1|s1)\b", s):
        return 1
    if re.search(r"\b(2|second|2nd|sem2|s2)\b", s):
        return 2
    return None

def _two_digit_year_to_full(y: int) -> int:
    # heuristic: "25" => 2025, "26" => 2026
    return 2000 + y if y < 100 else y

def normalize_school_year(text: str) -> Optional[str]:
    """
    Accepts formats like:
      - 2025-2026
      - 2025/26  (slash)
      - 2025-26  (short second year)
      - 2526     (two-digit years stuck together)
    Returns normalized "YYYY-YYYY" or None.
    """
    s = text.replace("–", "-").replace("—", "-").replace("/", "-").strip().lower()

    # 2024-2025 or 2024-25
    m = re.search(r"\b(20\d{2})\s*-\s*(\d{2,4})\b", s)
    if m:
        y1 = int(m.group(1))
        y2_raw = int(m.group(2))
        y2 = _two_digit_year_to_full(y2_raw) if y2_raw < 100 else y2_raw
        if y2 == y1 + 1:
            return f"{y1}-{y2}"
        return None

    # Stuck two-digit years like "2526"
    m = re.search(r"\b(\d{2})(\d{2})\b", s)
    if m:
        y1 = _two_digit_year_to_full(int(m.group(1)))
        y2 = _two_digit_year_to_full(int(m.group(2)))
        if y2 == y1 + 1:
            return f"{y1}-{y2}"

    return None


def is_yes(text: str) -> bool:
    return text.strip().lower() in {"yes", "y", "yeah", "yep", "oo", "opo", "sige", "confirm", "ok", "okay"}

def is_no(text: str) -> bool:
    return text.strip().lower() in {"no", "n", "nope", "hindi", "di", "cancel"}

def looks_like_request_intent(text: str) -> bool:
    s = text.lower()
    # covers: request, apply, issue, process, get, need, want, please...
    return bool(re.search(r"\b(request|apply|issue|process|get|need|want|submit|please|gawa|kuha|kailangan)\b", s))

def looks_like_question_permission(text: str) -> bool:
    s = text.lower()
    return ("can i" in s) or ("pwede" in s) or ("puwede" in s) or ("?" in s and "request" in s)

def map_doc_synonyms(text: str) -> str:
    """Normalize user text into one of the known doc types (OTR, COG, COE, OTHERS)."""
    t = text.lower().strip()

    if any(x in t for x in ["otr", "tor", "transcript"]):
        return "OTR"
    if any(x in t for x in ["cog", "grades", "certificate of grades"]):
        return "COG"
    if any(x in t for x in ["coe", "enrollment", "certificate of enrollment"]):
        return "COE"
    if any(x in t for x in ["good moral", "honorable", "dismissal", "clearance", "others"]):
        return "OTHERS"

    return None


def is_howto_question(text: str) -> Optional[str]:
    """Return doc_type if this looks like a 'how to request <doc>' question, else None."""
    s = text.lower().strip()
    if s.startswith("how to ") or s.startswith("how do i ") or s.startswith("how can i "):
        mapped = map_doc_synonyms(s)
        if mapped:
            return mapped
        # try exact keywords too
        for key in ["transcript", "otr", "tor", "cog", "certificate of grades", "coe", "certificate of enrollment", "others"]:
            if key in s:
                return map_doc_synonyms(key) or "OTHERS"
    # also catch “how to request …”
    if "how to request" in s or "how do i request" in s:
        mapped = map_doc_synonyms(s)
        if mapped:
            return mapped
    return None

def doc_from_text(text: str) -> Optional[str]:
    """Return doc_type if text **is** or clearly contains a single doc keyword."""
    mapped = map_doc_synonyms(text)
    if mapped:
        return mapped
    # Exactly one token that matches doc shortcut
    t = text.strip().lower()
    if t in {"otr", "tor", "transcript"}:
        return "OTR"
    if t in {"cog", "grades", "certificate of grades"}:
        return "COG"
    if t in {"coe", "enrollment", "certificate of enrollment"}:
        return "COE"
    if "good moral" in t or "honorable" in t or "others" in t:
        return "OTHERS"
    return None

def provide_howto(doc_type: str) -> str:
    """Informational answer for 'How to request <doc>' (Q&A mode)."""
    base = {
        "OTR":  "For **OTR (Transcript)**: I’ll need your **purpose** (no semester/SY needed). You’ll confirm, then pay, then it goes to faculty for approval. Release is next working day after approval.",
        "COG":  "For **COG (Certificate of Grades)**: I’ll need **semester (1/2)**, **school year** (e.g., 2025-2026), and **purpose**. You confirm, then pay, then it goes to faculty. Release next working day after approval.",
        "COE":  "For **COE (Certificate of Enrollment)**: I’ll need **semester (1/2)**, **school year**, and **purpose**. During confirmation, I’ll ask if your **SIS details** are up to date. After that, payment → faculty approval → release next working day.",
        "OTHERS":"For **other certificates**: please tell me the **document name** and your **purpose**. Then confirm → payment → faculty approval → release.",
    }
    extra = ""
    # Same-day note if enabled
    if SAME_DAY_ENABLED:
        extra = "\n" + sameday_line({"same_day": {"enabled": True, "reason": SAME_DAY_REASON}})
    return base.get(doc_type, base["OTHERS"]) + extra


def summarize_request(session: Dict) -> str:
    doc = session.get("doc_type")
    sem = session.get("semester")
    sy  = session.get("school_year")
    purpose = session.get("purpose")
    parts = [doc]
    if doc in {"COG", "COE"}:
        parts.append(f"Sem {sem}" if sem else "Sem ?")
        parts.append(f"SY {sy}" if sy else "SY ?")
    parts.append(f"Purpose: {purpose or '?'}")
    return ", ".join([p for p in parts if p])

def push_history(session: Dict, sender: str, text: str):
    session.setdefault("history", []).append({"ts": now_iso(), "sender": sender, "text": text})

def save_session(session: Dict):
    path = os.path.join(SESS_DIR, f"{session['user_id']}.json")
    with open(path, "w", encoding="utf-8") as f:
        json.dump(session, f, indent=2, ensure_ascii=False)

def load_session(user_id: str) -> Optional[Dict]:
    path = os.path.join(SESS_DIR, f"{user_id}.json")
    if os.path.isfile(path):
        with open(path, "r", encoding="utf-8") as f:
            return json.load(f)
    return None

def start_new_session(user_id: str) -> Dict:
    session = {
        "user_id": user_id,
        "mode": "qa",
        "status": "draft",
        "doc_type": None,
        "semester": None,
        "school_year": None,
        "purpose": None,
        "specify": None,          # <— for OTHERS (your policy)
        "other_doc_name": None,   # <— legacy shim; we’ll mirror into specify
        "sis_confirmed": None,    # COE only
        "payment_method": None,
        "receipt_hashes": [],
        "expected": None,
        "same_day": {"enabled": SAME_DAY_ENABLED, "reason": SAME_DAY_REASON},
        "history": [],
        "policy_version": POLICY_VERSION,
    }
    return session


def reset_request_fields(session: Dict):
    """Clear only the current request fields; keep user/session state + history."""
    for k in ["doc_type","semester","school_year","purpose","specify",
          "other_doc_name","sis_confirmed","payment_method"]:
        session[k] = None
    session["receipt_hashes"] = []
    session["status"] = "draft"
    session["expected"] = None
    session["mode"] = "qa"


def next_missing_slot(session: Dict) -> Optional[str]:
    doc = session.get("doc_type")
    if not doc:
        return "doc_type"

    req = DOC_REQUIREMENTS.get(doc, {})
    # 1) required slots first
    for slot in req.get("required", []):
        if slot == "semester":
            if session.get("semester") not in {1, 2}:
                return "semester"
        elif slot == "school_year":
            if not session.get("school_year"):
                return "school_year"
        elif slot == "specify":  # OTHERS
            # allow legacy field to satisfy it
            if not (session.get("specify") or session.get("other_doc_name")):
                return "specify"
        else:
            if not session.get(slot):
                return slot

    # 2) needs_personal_info → sis_confirmed
    if req.get("needs_personal_info"):
        if session.get("sis_confirmed") not in {True, False}:
            return "sis_confirm"

    # 3) optional slots are, well, optional 😊
    return None

def ask_for(slot: str, session: Dict) -> str:
    if slot == "doc_type":
        return "Which document do you need — OTR (Transcript), COG (Certificate of Grades), COE (Certificate of Enrollment), or Others?"
    if slot == "semester":
        return "Which semester is this for? (1 or 2)"
    if slot == "school_year":
        return "What is the school year? e.g., 2025-2026 (you can also type 25/26 or 2526)"
    if slot == "purpose":
        return "What’s the **purpose** of this request? (e.g., Scholarship application, Visa, PRC)"
    if slot == "sis_confirm":
        return "Before we proceed: **Are your SIS details up to date?** (Yes/No)"
    if slot == "specify":
        return "Please **specify** the exact document you need (e.g., Good Moral, Honorable Dismissal, Clearance)."
    return "Please provide the missing information."

def nonrefundable_notice() -> str:
    return ("Note: once paid, your request **cannot be cancelled** and is **non-refundable**.\n"
            "How would you like to pay — **Personal (Finance)** or **Online (GCash)**?")

def sameday_line(session: Dict) -> str:
    sd = session.get("same_day", {})
    if sd.get("enabled"):
        reason = sd.get("reason", "")
        extra = f" Reason: {reason}" if reason else ""
        return f"Same-day release is enabled today.{extra}"
    return "Release is the **next working day** after approval."

# -------- Edit helpers (parse "edit/change/set ...") --------
EDIT_TRIGGERS = ("edit", "change", "set", "update", "fix")

def parse_edit_intent(text: str):
    """
    Returns (field, value) or (None, None).
    Supports:
      - edit sem 2 / change semester to 1 / set s2
      - edit sy 2025-2026 / change school year 25/26 / update sy 2526
      - edit purpose scholarship / set purpose: scholarship
      - edit doc cog / change document to coe / set document otr
      - edit specify good moral / change document name: clearance
    """
    s = text.strip().lower()
    if not any(s.startswith(t) for t in EDIT_TRIGGERS):
        return None, None

    # remove trigger word(s)
    for t in EDIT_TRIGGERS:
        if s.startswith(t):
            s = s[len(t):].strip()
            break

    # optional fillers at the start
    s = re.sub(r"^(the|my|to)\s+", "", s)

    # document type (prefer this if user names a known type)
    if re.search(r"\b(doc|document|type)\b", s) or any(x in s for x in ["otr","cog","coe","enrollment","grades","transcript","others"]):
        mapped = map_doc_synonyms(s)
        if mapped:
            return "doc_type", mapped

    # semester
    if re.search(r"\b(sem|semester|s1|s2|1st|2nd|first|second)\b", s):
        sem = normalize_semester(s)
        if sem in (1, 2):
            return "semester", sem

    # school year
    if re.search(r"\b(sy|school year|2526|20\d{2}\s*[-/]\s*\d{2,4})\b", s):
        sy = normalize_school_year(s)
        if sy:
            return "school_year", sy

    # purpose
    if "purpose" in s or re.search(r"\b(for|para)\b", s):
        m = re.search(r"purpose[:\s]+(.+)$", s)
        val = (m.group(1) if m else s).strip()
        if len(val) >= 3:
            return "purpose", val

    # specify (OTHERS) — document name to request
    # catch phrases like: "specify good moral", "document name: clearance", "name honorable dismissal"
    if re.search(r"\b(specify|document(?:\s*name)?|name)\b", s):
        m = re.search(r"(?:specify|document(?:\s*name)?|name)[:\s]+(.+)$", s)
        val = (m.group(1) if m else s).strip()
        # remove leading fillers again in captured value
        val = re.sub(r"^(the|my|to)\s+", "", val).strip()
        if len(val) >= 3:
            return "specify", val

    return None, None

def apply_edit(session: Dict, field: str, value):
    """
    Apply a single edit and handle dependent resets.
    """
    if field == "doc_type":
        old = session.get("doc_type")
        new = value
        session["doc_type"] = new
        # reset fields that no longer apply
        if new in {"OTR", "OTHERS"}:
            session["semester"] = None
            session["school_year"] = None
            session["sis_confirmed"] = None
        elif new in {"COG", "COE"}:
            # keep sem/SY if already valid; else will be re-asked
            if session.get("semester") not in {1,2}:
                session["semester"] = None
            if not session.get("school_year"):
                session["school_year"] = None



# ---------- main bot logic ----------
def bot_intro(session: Dict) -> str:
    if session["status"] in {"awaiting_payment"}:
        return ("Welcome back. We’re **waiting for your payment** for this request: "
                f"{summarize_request(session)}.\n" + nonrefundable_notice())
    if session["status"] == "pending":
        return ("Welcome back. Your request is **pending faculty approval**: "
                f"{summarize_request(session)}.\n" + sameday_line(session))
    if session["status"] == "confirming":
        return ("Welcome back. We were confirming this request: "
                f"{summarize_request(session)}.\nType **confirm** to proceed or **edit** to change details.")
    if session["status"] in END_STATUSES:
        return f"Welcome back. Your last request is **{session['status']}**. How can I help you today?"
    return "Welcome! I can help with registrar document requests. Ask a question or say what you want to request."

# ------- Fuzzy doc synonym matcher (no new deps) -------
DOC_SYNONYMS = {
    "OTR": ["otr", "tor", "transcript", "transcript of records", "official transcript"],
    "COG": ["cog", "certificate of grades", "grades", "copy of grades"],
    "COE": ["coe", "certificate of enrollment", "enrollment", "enrolment"],
    "OTHERS": ["others", "good moral", "honorable dismissal", "clearance", "certification"],
}

def guess_doc_with_fuzzy(text: str):
    """
    Try to guess a doc_type from a possibly-typo'd input.
    Returns (doc_type|None, score: float, matched_word|None).
    """
    s = text.lower().strip()
    if not s:
        return None, 0.0, None

    # token candidates + full string
    tokens = re.findall(r"[a-zA-Z]+", s)
    candidates = set(tokens + [s])

    best = (None, 0.0, None)  # (doc_type, score, matched)
    for doc, words in DOC_SYNONYMS.items():
        for w in words:
            for cand in candidates:
                score = difflib.SequenceMatcher(None, cand, w).ratio()
                if score > best[1]:
                    best = (doc, score, w)
    return best  # doc_type, score, matched_word


# ------- Scope guard (off-topic fallback) -------
def scope_guard_message() -> str:
    return ("I’m here for **RegistrarConnect** document requests "
            "(OTR, COG, COE, other certifications).\n"
            "Try: **“Request COG”** or **“How to get OTR?”**")


def log_message(session, sender, text):
    if "history" not in session:
        session["history"] = []
    session["history"].append({"sender": sender, "text": text})
    # Keep only last 10 messages
    session["history"] = session["history"][-10:]




def handle_user_text(session: Dict, text: str, access_token: str) -> str:
    text_lower = text.strip().lower()

    # ---------------- Help ----------------
    if text_lower in {"help", "/help"}:
        return (
            "Commands: help · status · history · cancel (only before payment) · reset\n"
            "Or just type your question or request."
        )

    # ---------------- Status ----------------
    if text_lower in {"status", "/status"}:
        try:
            reqs = fetch_my_requests(access_token)  # pass token
        except Exception as e:
            return f"⚠️ Could not fetch your requests: {e}"

        if not reqs:
            return "You have no recent requests in the system."

        latest = reqs[0]
        print("🔍 Latest request payload:", latest)

        doc_type = latest.get("doc_type") or latest.get("document_type") or "Unknown"
        status = latest.get("status") or "Unknown"
        return f"📄 Latest request: **{doc_type}** | Status: **{status}**"


    # ---------------- History ----------------
    if text_lower in {"history", "/history"}:
        n = min(len(session.get("history", [])), 5)
        tail = session.get("history", [])[-n:]
        if not tail:
            return "No history yet."
        return "Recent messages:\n" + "\n".join(
            [f"- {m['sender']}: {m['text']}" for m in tail]
        )

    # ---------------- Reset ----------------
    if text_lower in {"reset", "/reset"}:
        keep = {"user_id": session.get("user_id"), "same_day": session.get("same_day")}
        session.clear()
        session.update(start_new_session(keep["user_id"]))  # your reset logic
        session["same_day"] = keep["same_day"]
        return "Okay, I’ve reset the conversation. What do you need?"

    # ---------------- New Request ----------------
    if text_lower in {"new", "new request", "another", "start over"}:
        reset_request_fields(session)
        session["step"] = "choose_document"
        return "Starting a new request. Do you need **OTR**, **COG**, **COE**, or **Others**?"

    # ---------------- Cancel ----------------
    if text_lower in {"cancel", "stop"}:
        if session.get("status") in UNPAID_STATUSES:
            session["status"] = "cancelled"
            reset_request_fields(session)
            session["mode"] = "qa"
            return "Your request has been **cancelled**. You can start a new request anytime."
        return "Sorry, the request **cannot be cancelled** after payment."

    # ---------------- Request Flow ----------------
    step = session.get("step")

    if step == "choose_document":
        if text_lower in {"otr", "cog", "coe", "others"}:
            session["document"] = text.upper()
            session["step"] = "provide_purpose"
            return f"You chose **{session['document']}**. Please provide your purpose."
        return "Please choose **OTR**, **COG**, **COE**, or **Others**."

    if step == "provide_purpose":
        session["purpose"] = text
        session["step"] = "completed"
        return f"Got it! Your request for **{session['document']}** with purpose **{text}** has been recorded."

    if step == "completed":
        return "✅ Your request is already recorded. Type **new** to start another."

    # ---------------- Fallback ----------------
    return "I’m not sure how to respond to that. Type **help** to see available commands."
    # ---------------- Expected replies ----------------
    exp = session.get("expected")

    # 1) Consent after a permission question
    if exp == "consent":
        if is_yes(text):
            session["mode"] = "request"
            session["expected"] = None
            slot = next_missing_slot(session)
            return ask_for(slot, session)
        if is_no(text):
            session["mode"] = "qa"
            session["expected"] = None
            return "No problem. Feel free to ask anything about registrar requests."
        return "Please answer **Yes** if you want to proceed, or **No** to stay in Q&A."

    # 2) Confirming a fuzzy document type guess
    if exp == "confirm_doc_guess":
        if is_yes(text):
            guessed = session.get("doc_guess")
            session["doc_type"] = guessed
            session["doc_guess"] = None
            session["expected"] = None
            slot = next_missing_slot(session)
            session["expected"] = slot

            if guessed in {"COG", "COE"} and slot == "semester":
                label = {
                    "OTR": "Official Transcript of Records (OTR)",
                    "COG": "Certificate of Grades (COG)",
                    "COE": "Certificate of Enrollment (COE)",
                    "OTHERS": "Other certificate",
                }.get(guessed, guessed)
                return (f"Got it — **{label}**.\n"
                        "Please provide **Semester (1/2)** and **School Year** (e.g., 2025-2026).\n"
                        "You can type them together, like: `Sem 2 SY 2025-2026`.")
            return ask_for(slot, session)

        if is_no(text):
            session["doc_guess"] = None
            session["expected"] = "doc_type"
            return "No problem — Which document do you need? **OTR / COG / COE / Others**?"

        return "Please answer **Yes** if that’s what you meant, or **No** to choose a different document."

    # ---------------- Default fallback ----------------
    # Here you could add QA or NLP handling for arbitrary text
    return "I’m not sure how to respond to that. You can type **help** to see available commands."
    # Cancel rules
    # Cancel rules
    if low in {"cancel", "stop"}:
        if session["status"] in UNPAID_STATUSES:
            session["status"] = "cancelled"
            session["expected"] = None
            # clear request fields
            session["doc_type"] = None
            session["semester"] = None
            session["school_year"] = None
            session["purpose"] = None
            session["specify"] = None
            session["other_doc_name"] = None
            session["payment_method"] = None
            # important: go back to QA so fuzzy doc guess can trigger next message
            session["mode"] = "qa"
            return "Your request has been **cancelled**. You can start a new request anytime."
        return "Sorry, the request **cannot be cancelled** after payment."


    # If we are expecting a specific reply, try to resolve it first
    exp = session.get("expected")

    # 1) Consent after a permission-style question
    if exp == "consent":
        if is_yes(text):
            session["mode"] = "request"
            session["expected"] = None
            # proceed to infer doc/sem from the original prompt or ask for doc
            slot = next_missing_slot(session)
            return ask_for(slot, session)
        if is_no(text):
            session["mode"] = "qa"
            session["expected"] = None
            return "No problem. Feel free to ask anything about registrar requests."
        return "Please answer **Yes** if you want to proceed, or **No** to stay in Q&A."
    
        # 1b) Confirming a fuzzy guess for doc type
    if exp == "confirm_doc_guess":
        if is_yes(text):
            guessed = session.get("doc_guess")
            session["doc_type"] = guessed
            session["doc_guess"] = None
            session["expected"] = None
            # proceed to next slot
            slot = next_missing_slot(session)
            session["expected"] = slot
            if guessed in {"COG", "COE"} and slot == "semester":
                label = {
                    "OTR": "Official Transcript of Records (OTR)",
                    "COG": "Certificate of Grades (COG)",
                    "COE": "Certificate of Enrollment (COE)",
                    "OTHERS": "Other certificate",
                }[guessed]
                return (f"Got it — **{label}**.\n"
                        "Please provide **Semester (1/2)** and **School Year** (e.g., 2025-2026).\n"
                        "You can type them together, like: `Sem 2 SY 2025-2026`.")
            return ask_for(slot, session)
        if is_no(text):
            session["doc_guess"] = None
            session["expected"] = "doc_type"
            return "No problem — Which document do you need? **OTR / COG / COE / Others**?"
        return "Please answer **Yes** if that’s what you meant, or **No** to choose a different document."


    # 2) Filling slots
    if exp == "semester":
        # Allow inputs like "Sem 2 SY 2025-2026" or "2 2526"
        sem = normalize_semester(text)
        sy  = normalize_school_year(text)

        if sem in (1, 2):
            session["semester"] = sem
            if sy:
                session["school_year"] = sy

            # decide what we still need
            slot = next_missing_slot(session)
            if slot:
                session["expected"] = slot
                return ask_for(slot, session)

            # nothing missing → move to confirmation (and SIS confirm for COE)
            session["status"] = "confirming"
            session["expected"] = "confirm"
            msg = (f"Please review your request: **{summarize_request(session)}**.")
            if session["doc_type"] == "COE" and session.get("sis_confirmed") not in {True, False}:
                msg += "\nBefore we proceed: **Are your SIS personal details up to date?** (Yes/No)"
                session["expected"] = "sis_confirm"
            else:
                msg += "\nType **confirm** to proceed or **edit** to change details."
            return msg

        return "Please answer with **1** or **2** for the semester."

    elif exp == "school_year":
        sy = normalize_school_year(text)
        if sy:
            session["school_year"] = sy
            session["expected"] = None
        else:
            return "Please provide SY like **2025-2026** (you can also type 25/26 or 2526)."
    elif exp == "purpose":
        purpose = text.strip()
        if len(purpose) < 3:
            return "Please provide a short purpose (e.g., Scholarship, Visa, PRC)."
        session["purpose"] = purpose
        session["expected"] = None
    elif exp == "sis_confirm":
        if is_yes(text):
            session["sis_confirmed"] = True
            session["expected"] = None
        elif is_no(text):
            session["sis_confirmed"] = False
            session["expected"] = None
            return ("Please **update your SIS details** first, then come back to continue this request.\n"
                    "Type **confirm** when you’re ready to proceed.")
        else:
            return "Please answer **Yes** or **No**."
    elif exp == "other_doc_name":
        # Backward compatibility: treat "other_doc_name" as the new "specify" slot
        name = text.strip()
        if len(name) < 3:
            return "Please provide the document name."

        # Set both fields so older code still works
        session["specify"] = name
        session["other_doc_name"] = name
        session["expected"] = None

        # If what they typed actually maps to a known doc, upgrade the doc_type
        mapped = map_doc_synonyms(name)
        if mapped and mapped != "OTHERS":
            session["doc_type"] = mapped

        # Continue via policy-driven slot check
        slot = next_missing_slot(session)
        if slot:
            session["expected"] = slot
            return ask_for(slot, session)

        # Otherwise move to confirmation
        session["status"] = "confirming"
        session["expected"] = "confirm"
        msg = f"Please review your request: **{summarize_request(session)}**."
        if session.get("doc_type") == "COE" and session.get("sis_confirmed") not in {True, False}:
            msg += "\nBefore we proceed: **Are your SIS personal details up to date?** (Yes/No)"
            session["expected"] = "sis_confirm"
        else:
            msg += "\nType **confirm** to proceed or **edit** to change details."
        return msg
    

    elif exp == "confirm":
        # For COE, require SIS confirmation first
        if session.get("doc_type") == "COE" and session.get("sis_confirmed") not in {True, False}:
            session["expected"] = "sis_confirm"
            return ("Before we proceed, please confirm: "
                    "**Are your SIS personal details up to date?** (Yes/No)")
        
        if low == "confirm" or is_yes(text):
            try:
                submit_document_request(
                    user_id=session.get("user_id"),
                    doc_type=session.get("doc_type"),
                    semester=session.get("semester"),
                    school_year=session.get("school_year"),
                    purpose=session.get("purpose"),
                    other_doc_name=session.get("other_doc_name"),
                    payment_method=session.get("payment_method")
                )
            except Exception as e:
                return f"⚠️ Failed to submit request: {e}"

            session["status"] = "awaiting_payment"
            session["expected"] = "payment_method"
            msg = (
                "Thanks! Your request is confirmed: "
                f"**{summarize_request(session)}**\n" + nonrefundable_notice()
            )
            if session.get("same_day", {}).get("enabled"):
                msg += "\n" + sameday_line(session)
            return msg




    elif exp == "payment_method":
        s = text.strip().lower()
        if "personal" in s or "finance" in s or "cashier" in s:
            session["payment_method"] = "personal"
        elif "gcash" in s or "online" in s:
            session["payment_method"] = "gcash"
        else:
            return "Please choose **Personal (Finance)** or **Online (GCash)**."
        session["status"] = "awaiting_payment"
        session["expected"] = "receipt"
        if session["payment_method"] == "gcash":
            return ("Great. Please pay using the provided online channel.\n"
                    "After paying, **paste your receipt/reference code** (e.g., `RCPT12345`).")
        return ("Okay. Once you finish payment at the Finance Department, "
                "please **paste your receipt/reference code** (e.g., `RCPT12345`).")

    elif exp == "receipt":
        rid = text.strip()
        if "receipt_hashes" not in session:
            session["receipt_hashes"] = []

        h = md5(rid)
        if h in session["receipt_hashes"]:
            return "This receipt looks **identical** to a previously submitted one. Please upload a **new** receipt."
        
        session["receipt_hashes"].append(h)
        session["status"] = "pending"
        session["expected"] = "another"

        msg = (
            "Thanks, I’ve recorded your receipt.\n"
            "Your request is now **pending faculty approval**.\n"
            + sameday_line(session) +
            "\n\nWould you like to **request another document now**? (Yes/No)"
        )
        return msg

    
    elif exp == "another":
        if is_yes(text):
            reset_request_fields(session)
            session["mode"] = "request"
            session["expected"] = "doc_type"
            return "Great. What document do you need — **OTR**, **COG**, **COE**, or **Others**?"
        if is_no(text):
            session["expected"] = None
            session["mode"] = "qa"
            return "Okay. I’m here if you need anything else."
        return "Please answer **Yes** or **No**."
    
    elif exp == "specify":
        name = text.strip()
        if len(name) < 3:
            return "Please provide the document name."
        # set both for back-compat
        session["specify"] = name
        session["other_doc_name"] = name
        session["expected"] = None

        # if their specify happens to map to a known doc, upgrade the type
        mapped = map_doc_synonyms(name)
        if mapped and mapped != "OTHERS":
            session["doc_type"] = mapped

        # proceed to the next slot (policy-driven)
        slot = next_missing_slot(session)
        if slot:
            session["expected"] = slot
            return ask_for(slot, session)

        # else go to confirmation
        session["status"] = "confirming"
        session["expected"] = "confirm"
        msg = f"Please review your request: **{summarize_request(session)}**."
        if session.get("doc_type") == "COE" and session.get("sis_confirmed") not in {True, False}:
            msg += "\nBefore we proceed: **Are your SIS personal details up to date?** (Yes/No)"
            session["expected"] = "sis_confirm"
        else:
            msg += "\nType **confirm** to proceed or **edit** to change details."
        return msg

    
    elif exp == "edit":
        field, value = parse_edit_intent(text)
        if not field:
            return ("Sorry, I didn’t catch that edit.\n"
                    "Try: `edit sem 2`, `change sy 2025-2026`, `set purpose scholarship`, or `edit doc OTR`.")

        apply_edit(session, field, value)

        # After any edit, either keep asking for missing slots or show the updated review
        missing = next_missing_slot(session)
        if missing:
            session["expected"] = missing
            return ask_for(missing, session)

        # ready for review again
        session["status"] = "confirming"
        session["expected"] = "confirm"
        msg = f"Updated. Please review: **{summarize_request(session)}**."
        if session["doc_type"] == "COE" and session.get("sis_confirmed") not in {True, False}:
            msg += ("\nBefore we proceed: **Are your SIS personal details up to date?** (Yes/No)\n"
                    "If everything looks good, you can also type **confirm** to proceed.")
            session["expected"] = "sis_confirm"
        else:
            msg += "\nType **confirm** to proceed or **edit** to change details."
        return msg


    # 3) If we are not expecting a specific field, decide behavior
#    (Q&A vs Request initiation / continue filling)
        # 3) If we are not expecting a specific field, decide behavior (Q&A vs Request)
    if session["mode"] == "qa":
        # (a) “How to request … ?” → informational answer (do NOT start flow)
        how_doc = is_howto_question(text)
        if how_doc:
            return provide_howto(how_doc)

        # (b) Single-word or obvious doc keyword → treat as request shortcut
        shortcut_doc = doc_from_text(text)
        if shortcut_doc:
            session["mode"] = "request"
            session["doc_type"] = shortcut_doc
            label = {
                "OTR": "Official Transcript of Records (OTR)",
                "COG": "Certificate of Grades (COG)",
                "COE": "Certificate of Enrollment (COE)",
                "OTHERS": "Other certificate",
            }[shortcut_doc]
            slot = next_missing_slot(session)
            session["expected"] = slot
            if shortcut_doc in {"COG", "COE"} and slot == "semester":
                return (f"Got it — **{label}**.\n"
                        "Please provide **Semester (1/2)** and **School Year** (e.g., 2025-2026).\n"
                        "You can type them together, like: `Sem 2 SY 2025-2026`.")
            return f"Got it — **{label}**.\n{ask_for(slot, session)}"

        # (c) Fuzzy guess: typo tolerance (e.g., "colg" ≈ COG)
        guess_doc, score, _match = guess_doc_with_fuzzy(text)
        if guess_doc:
            if score >= 0.65:  # anything reasonably close → ask first
                session["expected"] = "confirm_doc_guess"
                session["doc_guess"] = guess_doc
                pretty = {
                    "OTR": "OTR (Official Transcript of Records)",
                    "COG": "COG (Certificate of Grades)",
                    "COE": "COE (Certificate of Enrollment)",
                    "OTHERS": "Other certificate",
                }[guess_doc]
                return f"Just to confirm — did you mean **{pretty}**? (Yes/No)"
            elif score >= 0.65:
                # ambiguous → confirm with user
                session["expected"] = "confirm_doc_guess"
                session["doc_guess"] = guess_doc
                pretty = {
                    "OTR": "OTR (Official Transcript of Records)",
                    "COG": "COG (Certificate of Grades)",
                    "COE": "COE (Certificate of Enrollment)",
                    "OTHERS": "Other certificate",
                }[guess_doc]
                return f"Just to confirm — did you mean **{pretty}**? (Yes/No)"


        # (d) Permission-style question → ask consent to proceed
        if looks_like_question_permission(text):
            session["expected"] = "consent"
            return ("Yes, you can request that. Would you like to **proceed now** "
                    "and provide the requirements? (Yes/No)")

        # (e) Generic request intent → switch to request and parse
        if looks_like_request_intent(text):
            session["mode"] = "request"
            return init_or_fill_from_text(session, text)

        # (f) Strict scope fallback
        return scope_guard_message()

    
    # If we're in request mode but not expecting a specific field, try to parse/fill
    if session.get("mode") == "request":
        return init_or_fill_from_text(session, text)

    # final fallback (QA/help)
    return ("I can help with registrar document requests (OTR, COG, COE, others). "
            "Ask a question like “How to request COG?” or say “COG” / “Request my OTR”.")



def init_or_fill_from_text(session: Dict, text: str) -> str:
    # If doc_type already set, try to fill missing slots from text only (no reclassification)
    if session.get("doc_type"):
        # fill semester and SY if present
        sem = normalize_semester(text)
        if sem in (1, 2):
            session["semester"] = sem
        sy = normalize_school_year(text)
        if sy:
            session["school_year"] = sy
        # if we were specifically asking purpose, accept as purpose
        if session.get("expected") == "purpose":
            if len(text.strip()) >= 3:
                session["purpose"] = text.strip()
                session["expected"] = None
        # If still missing anything, ask the next one
        slot = next_missing_slot(session)
        if slot:
            session["expected"] = slot
            return ask_for(slot, session)
        # else go to confirmation
        session["status"] = "confirming"
        session["expected"] = "confirm"
        msg = (f"Please review your request: **{summarize_request(session)}**.")
        if session["doc_type"] == "COE" and session.get("sis_confirmed") not in {True, False}:
            msg += ("\nBefore we proceed: **Are your SIS personal details up to date?** (Yes/No)\n"
                    "If everything looks good, you can also type **confirm** to proceed.")
        else:
            msg += "\nType **confirm** to proceed or **edit** to change details."
        return msg


    # doc_type not set → try explicit mapping, then FUZZY, then classifier
    mapped = map_doc_synonyms(text)
    doc_type = mapped
    sem = normalize_semester(text)
    sy  = normalize_school_year(text)

    if not doc_type:
        guess_doc, score, _match = guess_doc_with_fuzzy(text)
        if guess_doc and score >= 0.65:
            session["expected"] = "confirm_doc_guess"
            session["doc_guess"] = guess_doc
            pretty = {
                "OTR": "OTR (Official Transcript of Records)",
                "COG": "COG (Certificate of Grades)",
                "COE": "COE (Certificate of Enrollment)",
                "OTHERS": "Other certificate",
            }[guess_doc]
            return f"Just to confirm — did you mean **{pretty}**? (Yes/No)"




    # fallback to classifier
    if not doc_type:
        out = clf_predict(text)
        if out:
            doc_type = out.get("doc_type")
            sem = sem or out.get("semester")


    if doc_type not in DOC_TYPES:
        session["expected"] = "doc_type"
        return ask_for("doc_type", session)

    session["doc_type"] = doc_type
    if doc_type in {"COG", "COE"} and sem in (1, 2):
        session["semester"] = sem
    if sy:
        session["school_year"] = sy

    label = {
        "OTR": "Official Transcript of Records (OTR)",
        "COG": "Certificate of Grades (COG)",
        "COE": "Certificate of Enrollment (COE)",
        "OTHERS": "Other certificate",
    }[doc_type]

    slot = next_missing_slot(session)
    session["expected"] = slot
    if doc_type in {"COG", "COE"} and slot == "semester":
        return (f"That’s **{label}**.\n"
                "Please provide **Semester (1/2)** and **School Year** (e.g., 2025-2026).\n"
                "You can type them together, like: `Sem 1 SY 2025-2026`.")
    return f"That’s **{label}**.\n{ask_for(slot, session)}"


# ---------- CLI runner ----------
def main():
    print("📚 RegistrarConnect Chatbot (type 'help' for help, 'quit' to exit)")

    from getpass import getpass
    email = input("Enter your email: ").strip()
    password = getpass("Enter your password: ").strip()

    # Login
    auth_data = login(email, password, role="student")
    if not auth_data:
        print("❌ Could not log in. Exiting.")
        return

    # Dynamic token
    ACCESS_TOKEN = auth_data["access"]  # dynamic for this session
    user_id = auth_data.get("email")    # use email as user identifier
    print(f"✅ Logged in as {auth_data.get('name')} ({auth_data.get('role')})")

    # start session
    session = load_session(user_id) or start_new_session(user_id)

    # Chatbot loop
    while True:
        user = input("> ").strip()
        if user.lower() in {"quit", "exit"}:
            print("Bye!")
            break
        response = handle_user_text(session, user, ACCESS_TOKEN)
        print(response)



    # --- Load session with backend sync ---
    try:
        reqs = fetch_my_requests()
        if reqs:
            latest = reqs[0]
            session = load_session(user_id) or start_new_session(user_id)
            session["doc_type"] = latest.get("doc_type")
            session["semester"] = latest.get("semester")
            session["school_year"] = latest.get("school_year")
            session["purpose"] = latest.get("purpose")
            session["status"] = latest.get("status")
        else:
            session = load_session(user_id) or start_new_session(user_id)
    except Exception as e:
        print(f"(warn) Could not sync with backend: {e}")
        session = load_session(user_id) or start_new_session(user_id)

    # greet / resume
    greet = bot_intro(session)
    print(greet)
    push_history(session, "bot", greet)
    save_session(session)


    while True:
        try:
            msg = input("> ").strip()
        except (EOFError, KeyboardInterrupt):
            print("\nBye!")
            break
        if msg.lower() in {"quit", "exit"}:
            print("Bye!")
            break

        push_history(session, "user", msg)
        reply = handle_user_text(session, msg)
        push_history(session, "bot", reply)
        print(reply)
        save_session(session)

        # 🔥 Optional: sync chat history to backend after each exchange
        try:
            api_client.save_chat_history(STUDENT_ID, session.get("history", []))
        except Exception as e:
            print(f"(warn) Could not sync chat history: {e}")
if __name__ == "__main__":
    main()
