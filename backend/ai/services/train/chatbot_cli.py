# --- Make 'services' importable even when running this file directly ---
import os, sys
_THIS = os.path.dirname(__file__)                           # .../backend/ai/services/train
_AI_DIR = os.path.abspath(os.path.join(_THIS, "..", ".."))  # .../backend/ai
if _AI_DIR not in sys.path:
    sys.path.insert(0, _AI_DIR)
# ----------------------------------------------------------------------

import re, json, hashlib, datetime as dt
from typing import Dict, Optional
import difflib
import requests
from django.utils.text import slugify

# ----- package-safe imports -----
try:
    from backend.ai.services.train.infer_doc_sem import predict as clf_predict
except Exception:
    from infer_doc_sem import predict as clf_predict

try:
    from backend.ai.services.policy import (
        POLICY_VERSION,
        DOC_TYPES as POLICY_DOC_TYPES,
        DOC_REQUIREMENTS,
    )
except Exception:
    from services.policy import (
        POLICY_VERSION,
        DOC_TYPES as POLICY_DOC_TYPES,
        DOC_REQUIREMENTS,
    )

# ---------- config ----------
API_BASE = os.getenv("RC_API_BASE", "http://127.0.0.1:8000/api")
ACCESS_TOKEN = None
STUDENT_ID = None

def login(email: str, password: str, role: Optional[str] = None) -> Optional[dict]:
    try:
        payload = {"email": email, "password": password}
        if role:
            payload["role"] = role
        r = requests.post(f"{API_BASE}/auth/login/", json=payload, timeout=10)
        if r.status_code != 200:
            print(f"⚠️ Login failed: {r.status_code} {r.text}")
            return None
        data = r.json()
        print("🔍 Login response:", data)
        if "access" not in data:
            print("❌ Login succeeded but no access token returned")
            return None
        return data
    except Exception as e:
        print("⚠️ login() error:", e)
        return None

def get_current_user(token: str) -> dict | None:
    global STUDENT_ID
    if not token:
        return None
    headers = {"Authorization": f"Bearer {token}"}
    try:
        resp = requests.get(f"{API_BASE}/auth/me/", headers=headers, timeout=5)
        if resp.status_code == 200:
            data = resp.json()
            STUDENT_ID = data.get("student_id") or str(data.get("id"))
            return data
        else:
            print(f"⚠️ get_current_user: backend returned {resp.status_code}: {resp.text}")
            return None
    except Exception as e:
        print("⚠️ get_current_user error:", e)
        return None

def submit_document_request(
    token: str,
    doc_type,
    semester=None,
    school_year=None,
    purpose=None,
    other_doc_name=None,
    payment_method=None,
    receipt_reference=None,
    conversation_id: Optional[str] = None,   # NEW
):
    headers = {"Authorization": f"Bearer {token}"}
    data = {
        "document_type": doc_type,
        "semester": semester,
        "school_year": school_year,
        "purpose": purpose,
        "other_doc_name": other_doc_name,
        "payment_method": payment_method,
        "student_id": STUDENT_ID,
        "receipt_reference": receipt_reference,
        "conversation_id": conversation_id,  # NEW: tell backend which chat to link
    }
    data = {k: v for k, v in data.items() if v is not None}
    resp = requests.post(f"{API_BASE}/document-requests/create/", json=data, headers=headers)
    if resp.status_code == 201:
        doc = resp.json()
        print(f"✅ Request created: {doc['document_type']} (Status: {doc['status']})")
        return doc
    else:
        print(f"❌ Failed to create request: {resp.status_code} {resp.text}")
        return None

def fetch_my_requests(token: str):
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

DOC_TYPES = set(POLICY_DOC_TYPES)

HERE = os.path.dirname(__file__)
SESS_DIR = os.path.join(HERE, "sessions")
os.makedirs(SESS_DIR, exist_ok=True)

UNPAID_STATUSES = {"draft", "confirming", "awaiting_payment"}
END_STATUSES = {"cancelled", "rejected", "ready_to_claim"}

SAME_DAY_ENABLED = False
SAME_DAY_REASON = ""

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
    m = re.search(r"\b(\d{2})(\d{2})\b", s)
    if m:
        y1 = _two_digit_year_to_full(int(m.group(1)))
        y2 = _two_digit_year_to_full(int(m.group(2)))
        if y2 == y1 + 1:
            return f"{y1}-{y2}"
    return None

def normalize_semester(text: str) -> Optional[int]:
    s = text.lower()
    if re.search(r"\b(1|first|1st|sem1|s1)\b", s):
        return 1
    if re.search(r"\b(2|second|2nd|sem2|s2)\b", s):
        return 2
    return None

def is_yes(text: str) -> bool:
    return text.strip().lower() in {"yes", "y", "yeah", "yep", "oo", "opo", "sige", "confirm", "ok", "okay"}

def is_no(text: str) -> bool:
    return text.strip().lower() in {"no", "n", "nope", "hindi", "di", "cancel"}

def looks_like_request_intent(text: str) -> bool:
    s = text.lower()
    return bool(re.search(r"\b(request|apply|issue|process|get|need|want|submit|please|gawa|kuha|kailangan)\b", s))

def looks_like_question_permission(text: str) -> bool:
    s = text.lower()
    return ("can i" in s) or ("pwede" in s) or ("puwede" in s) or ("?" in s and "request" in s)

def map_doc_synonyms(text: str) -> str:
    t = text.lower().strip()
    if any(x in t for x in ["otr", "tor", "transcript"]):
        return "OTR"
    if any(x in t for x in ["cog", "grades", "certificate of grades", "copy of grades"]):
        return "COG"
    if any(x in t for x in ["coe", "enrollment", "certificate of enrollment"]):
        return "COE"
    if any(x in t for x in ["good moral", "honorable", "dismissal", "clearance", "others"]):
        return "OTHERS"
    return None

def is_howto_question(text: str) -> Optional[str]:
    s = text.lower().strip()
    if s.startswith("how to ") or s.startswith("how do i ") or s.startswith("how can i "):
        mapped = map_doc_synonyms(s)
        if mapped:
            return mapped
        for key in ["transcript", "otr", "tor", "cog", "certificate of grades", "coe", "certificate of enrollment", "others"]:
            if key in s:
                return map_doc_synonyms(key) or "OTHERS"
    if "how to request" in s or "how do i request" in s:
        mapped = map_doc_synonyms(s)
        if mapped:
            return mapped
    return None

def doc_from_text(text: str) -> Optional[str]:
    mapped = map_doc_synonyms(text)
    if mapped:
        return mapped
    t = text.strip().lower()
    if t in {"otr", "tor", "transcript"}:
        return "OTR"
    if t in {"cog", "grades", "certificate of grades", "copy of grades"}:
        return "COG"
    if t in {"coe", "enrollment", "certificate of enrollment"}:
        return "COE"
    if "good moral" in t or "honorable" in t or "others" in t:
        return "OTHERS"
    return None

def provide_howto(doc_type: str) -> str:
    base = {
        "OTR":  "For **OTR (Transcript)**: I’ll need your **purpose** (no semester/SY needed). You’ll confirm, then pay, then it goes to faculty for approval. Release is next working day after approval.",
        "COG":  "For **COG (Certificate of Grades)**: I’ll need **semester (1/2)**, **school year** (e.g., 2025-2026), and **purpose**. You confirm, then pay, then it goes to faculty. Release next working day after approval.",
        "COE":  "For **COE (Certificate of Enrollment)**: I’ll need **semester (1/2)**, **school year**, and **purpose**. During confirmation, I’ll ask if your **SIS details** are up to date. After that, payment → faculty approval → release next working day.",
        "OTHERS":"For **other certificates**: please tell me the **document name** and your **purpose**. Then confirm → payment → faculty approval → release.",
    }
    extra = ""
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
        "specify": None,
        "other_doc_name": None,
        "sis_confirmed": None,
        "payment_method": None,
        "receipt_hashes": [],
        "expected": None,
        "same_day": {"enabled": SAME_DAY_ENABLED, "reason": SAME_DAY_REASON},
        "history": [],
        "policy_version": POLICY_VERSION,
    }
    return session

def reset_request_fields(session: Dict):
    for k in ["doc_type", "semester", "school_year", "purpose", "specify",
              "other_doc_name", "sis_confirmed", "payment_method"]:
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
    for slot in req.get("required", []):
        if slot == "semester":
            if session.get("semester") not in {1, 2}:
                return "semester"
        elif slot == "school_year":
            if not session.get("school_year"):
                return "school_year"
        elif slot == "specify":
            if not (session.get("specify") or session.get("other_doc_name")):
                return "specify"
        else:
            if not session.get(slot):
                return slot
    if req.get("needs_personal_info"):
        if session.get("sis_confirmed") not in {True, False}:
            return "sis_confirm"
    return None

def ask_for(slot: str, session: Dict) -> str:
    if slot == "doc_type":
        return "Which document do you need — OTR (Transcript), COG (Certificate of Grades), COE (Certificate of Enrollment), or Others?"
    if slot == "semester":
        return "Which semester is this for? (1 or 2)"
    if slot == "school_year":
        return "What is the school year? e.g., 2025-2026 (you can also type 25/26 or 2526)"
    if slot == "purpose":
        return "What’s the **purpose** of this request? (e.g., Scholarship, Visa, PRC)"
    if slot == "sis_confirm":
        return "Before we proceed: **Are your SIS personal details up to date?** (Yes/No)"
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

EDIT_TRIGGERS = ("edit", "change", "set", "update", "fix")

def parse_edit_intent(text: str):
    s = text.strip().lower()
    if not any(s.startswith(t) for t in EDIT_TRIGGERS):
        return None, None
    for t in EDIT_TRIGGERS:
        if s.startswith(t):
            s = s[len(t):].strip()
            break
    s = re.sub(r"^(the|my|to)\s+", "", s)
    if re.search(r"\b(doc|document|type)\b", s) or any(x in s for x in ["otr","cog","coe","enrollment","grades","transcript","others"]):
        mapped = map_doc_synonyms(s)
        if mapped:
            return "doc_type", mapped
    if re.search(r"\b(sem|semester|s1|s2|1st|2nd|first|second)\b", s):
        sem = normalize_semester(s)
        if sem in (1, 2):
            return "semester", sem
    if re.search(r"\b(sy|school year|2526|20\d{2}\s*[-/]\s*\d{2,4})\b", s):
        sy = normalize_school_year(s)
        if sy:
            return "school_year", sy
    if "purpose" in s or re.search(r"\b(for|para)\b", s):
        m = re.search(r"purpose[:\s]+(.+)$", s)
        val = (m.group(1) if m else s).strip()
        if len(val) >= 3:
            return "purpose", val
    if re.search(r"\b(specify|document(?:\s*name)?|name)\b", s):
        m = re.search(r"(?:specify|document(?:\s*name)?|name)[:\s]+(.+)$", s)
        val = (m.group(1) if m else s).strip()
        val = re.sub(r"^(the|my|to)\s+", "", val).strip()
        if len(val) >= 3:
            return "specify", val
    return None, None

def apply_edit(session: Dict, field: str, value):
    if field == "doc_type":
        new = value
        session["doc_type"] = new
        if new in {"OTR", "OTHERS"}:
            session["semester"] = None
            session["school_year"] = None
            session["sis_confirmed"] = None
        elif new in {"COG", "COE"}:
            if session.get("semester") not in {1,2}:
                session["semester"] = None
            if not session.get("school_year"):
                session["school_year"] = None

def bot_intro(session: Dict) -> str:
    if session["status"] == "awaiting_payment":
        return ("Welcome back. We’re **waiting for your payment** for this request: "
                f"{summarize_request(session)}.\n" + nonrefundable_notice())
    if session["status"] == "on_process":
        return ("Welcome back. Your request is **on process** after payment: "
                f"{summarize_request(session)}.\n" + sameday_line(session))
    if session["status"] == "pending":
        return ("Welcome back. Your request is **pending faculty approval**: "
                f"{summarize_request(session)}.\n" + sameday_line(session))
    if session["status"] == "confirming":
        return ("Welcome back. We were confirming this request: "
                f"{summarize_request(session)}.\nType **confirm** to proceed, **edit** to change, or **cancel** to abort.")
    if session["status"] in END_STATUSES:
        return f"Welcome back. Your last request is **{session['status']}**. How can I help you today?"
    return "Welcome! I can help with registrar document requests. Ask a question or say what you want to request."

DOC_SYNONYMS = {
    "OTR": ["otr", "tor", "transcript", "transcript of records", "official transcript"],
    "COG": ["cog", "certificate of grades", "grades", "copy of grades"],
    "COE": ["coe", "certificate of enrollment", "enrollment", "enrolment"],
    "OTHERS": ["others", "good moral", "honorable dismissal", "clearance", "certification"],
}

def guess_doc_with_fuzzy(text: str):
    s = text.lower().strip()
    if not s:
        return None, 0.0, None
    tokens = re.findall(r"[a-zA-Z]+", s)
    candidates = set(tokens + [s])
    best = (None, 0.0, None)
    for doc, words in DOC_SYNONYMS.items():
        for w in words:
            for cand in candidates:
                score = difflib.SequenceMatcher(None, cand, w).ratio()
                if score > best[1]:
                    best = (doc, score, w)
    return best

def scope_guard_message() -> str:
    return ("I’m here for **RegistrarConnect** document requests "
            "(OTR, COG, COE, other certifications).\n"
            "Try: **“Request COG”** or **“How to get OTR?”**")

def log_message(session, sender, text):
    if "history" not in session:
        session["history"] = []
    session["history"].append({"sender": sender, "text": text})
    session["history"] = session["history"][-10:]

def save_to_db(session, access_token):
    headers = {"Authorization": f"Bearer {access_token}"}
    # Reuse existing conversation_id or generate a new one for the first save
    conversation_id = session.get("conversation_id", slugify(f"{session['user_id']}_{now_iso()}"))
    if "conversation_id" not in session:
        session["conversation_id"] = conversation_id
    
    data = {
        "conversation_id": conversation_id,
        "session": session,
        "history": session.get("history", []),
        "status": session["status"]
    }
    
    resp = requests.post(f"{API_BASE}/ai/chat/", json=data, headers=headers)
    if resp.status_code != 200:
        print(f"⚠️ Failed to save chat history: {resp.text}")

def handle_user_text(session: Dict, text: str, access_token: str) -> str:
    text_lower = text.strip().lower()
    if text_lower in {"help", "/help"}:
        save_to_db(session, access_token)
        return (
            "Commands: help · status · history · cancel (only in Confirming) · reset\n"
            "Or just type your question or request."
        )

    if text_lower in {"status", "/status"}:
        try:
            reqs = fetch_my_requests(access_token)
        except Exception as e:
            return f"⚠️ Could not fetch your requests: {e}"
        if not reqs:
            return "You have no recent requests in the system."
        latest = reqs[0]
        doc_type = latest.get("doc_type") or latest.get("document_type") or "Unknown"
        status = latest.get("status") or "Unknown"
        save_to_db(session, access_token)
        return f"📄 Latest request: **{doc_type}** | Status: **{status}**"

    if text_lower in {"history", "/history"}:
        n = min(len(session.get("history", [])), 5)
        tail = session.get("history", [])[-n:]
        if not tail:
            return "No history yet."
        save_to_db(session, access_token)
        return "Recent messages:\n" + "\n".join([f"- {m['sender']}: {m['text']}" for m in tail])

    if text_lower in {"reset", "/reset"}:
        keep = {"user_id": session.get("user_id"), "same_day": session.get("same_day")}
        session.clear()
        session.update(start_new_session(keep["user_id"]))
        session["same_day"] = keep["same_day"]
        # NEW: rotate conversation id on hard reset
        session["conversation_id"] = slugify(f"{session['user_id']}_{now_iso()}")
        save_to_db(session, access_token)
        return "Okay, I’ve reset the conversation. What do you need?"

    if text_lower in {"new", "new request", "another", "start over"}:
        reset_request_fields(session)
        session["mode"] = "request"
        session["expected"] = "doc_type"
        # NEW: rotate conversation id when starting a new request
        session["conversation_id"] = slugify(f"{session['user_id']}_{now_iso()}")
        save_to_db(session, access_token)
        return "Starting a new request. What document do you need — **OTR**, **COG**, **COE**, or **Others**?"

    if text_lower in {"cancel", "stop"}:
        if session.get("status") == "confirming":
            session["status"] = "cancelled"
            reset_request_fields(session)
            session["mode"] = "qa"
            save_to_db(session, access_token)
            return "Your request has been **cancelled**. You can start a new request anytime."
        return "Sorry, the request **cannot be cancelled** after payment."

    exp = session.get("expected")

    if exp == "consent":
        if is_yes(text):
            session["mode"] = "request"; session["expected"] = None
            slot = next_missing_slot(session)
            save_to_db(session, access_token)
            return ask_for(slot, session)
        if is_no(text):
            session["mode"] = "qa"; session["expected"] = None
            save_to_db(session, access_token)
            return "No problem. Feel free to ask anything about registrar requests."
        return "Please answer **Yes** if you want to proceed, or **No** to stay in Q&A."

    if exp == "confirm_doc_guess":
        if is_yes(text):
            guessed = session.get("doc_guess")
            session["doc_type"] = guessed
            session["doc_guess"] = None
            session["expected"] = None
            slot = next_missing_slot(session); session["expected"] = slot
            save_to_db(session, access_token)
            if guessed in {"COG", "COE"} and slot == "semester":
                label = {"OTR": "Official Transcript of Records (OTR)", "COG": "Certificate of Grades (COG)", "COE": "Certificate of Enrollment (COE)", "OTHERS": "Other certificate"}[guessed]
                return (f"Got it — **{label}**.\n"
                        "Please provide **Semester (1/2)** and **School Year** (e.g., 2025-2026).\n"
                        "You can type them together, like: `Sem 2 SY 2025-2026`.")
            return ask_for(slot, session)
        if is_no(text):
            session["doc_guess"] = None; session["expected"] = "doc_type"
            save_to_db(session, access_token)
            return "No problem — Which document do you need? **OTR / COG / COE / Others**?"
        return "Please answer **Yes** if that’s what you meant, or **No** to choose a different document."

    if exp == "semester":
        sem = normalize_semester(text)
        sy = normalize_school_year(text)
        if sem in (1, 2):
            session["semester"] = sem
            if sy: session["school_year"] = sy
            purpose_match = re.search(r"purpose[:\s]+(.+)", text.lower())
            if purpose_match:
                session["purpose"] = purpose_match.group(1).strip()
            slot = next_missing_slot(session)
            if slot:
                session["expected"] = slot
                save_to_db(session, access_token)
                return ask_for(slot, session)
            session["status"] = "confirming"; session["expected"] = "confirm"
            msg = f"Please review your request: **{summarize_request(session)}**."
            if session["doc_type"] == "COE" and session.get("sis_confirmed") not in {True, False}:
                msg += "\nBefore we proceed: **Are your SIS personal details up to date?** (Yes/No)"
                session["expected"] = "sis_confirm"
            else:
                msg += "\nType **confirm** to proceed, **edit** to change, or **cancel** to abort."
            save_to_db(session, access_token)
            return msg
        return "Please answer with **1** or **2** for the semester."

    elif exp == "school_year":
        sy = normalize_school_year(text)
        if sy:
            session["school_year"] = sy
            purpose_match = re.search(r"purpose[:\s]+(.+)", text.lower())
            if purpose_match:
                session["purpose"] = purpose_match.group(1).strip()
            slot = next_missing_slot(session)
            if slot:
                session["expected"] = slot
                save_to_db(session, access_token)
                return ask_for(slot, session)
            session["status"] = "confirming"; session["expected"] = "confirm"
            msg = f"Please review your request: **{summarize_request(session)}**."
            if session["doc_type"] == "COE" and session.get("sis_confirmed") not in {True, False}:
                msg += "\nBefore we proceed: **Are your SIS personal details up to date?** (Yes/No)"
                session["expected"] = "sis_confirm"
            else:
                msg += "\nType **confirm** to proceed, **edit** to change, or **cancel** to abort."
            save_to_db(session, access_token)
            return msg
        return "Please provide SY like **2025-2026** (you can also type 25/26 or 2526)."

    elif exp == "purpose":
        purpose = text.strip()
        if len(purpose) < 3:
            return "Please provide a short purpose (e.g., Scholarship, Visa, PRC)."
        session["purpose"] = purpose; session["expected"] = None
        slot = next_missing_slot(session)
        if slot:
            session["expected"] = slot
            save_to_db(session, access_token)
            return ask_for(slot, session)
        session["status"] = "confirming"; session["expected"] = "confirm"
        msg = f"Please review your request: **{summarize_request(session)}**."
        if session["doc_type"] == "COE" and session.get("sis_confirmed") not in {True, False}:
            msg += "\nBefore we proceed: **Are your SIS personal details up to date?** (Yes/No)"
            session["expected"] = "sis_confirm"
        else:
            msg += "\nType **confirm** to proceed, **edit** to change, or **cancel** to abort."
        save_to_db(session, access_token)
        return msg

    elif exp == "sis_confirm":
        if is_yes(text):
            session["sis_confirmed"] = True; session["expected"] = None
            save_to_db(session, access_token)
        elif is_no(text):
            session["sis_confirmed"] = False; session["expected"] = None
            save_to_db(session, access_token)
            return ("Please **update your SIS details** first, then come back to continue this request.\n"
                    "Type **confirm** when you’re ready to proceed.")
        else:
            return "Please answer **Yes** or **No**."

    elif exp == "other_doc_name":
        name = text.strip()
        if len(name) < 3:
            return "Please provide the document name."
        session["specify"] = name; session["other_doc_name"] = name; session["expected"] = None
        mapped = map_doc_synonyms(name)
        if mapped and mapped != "OTHERS":
            session["doc_type"] = mapped
        slot = next_missing_slot(session)
        if slot:
            session["expected"] = slot
            save_to_db(session, access_token)
            return ask_for(slot, session)
        session["status"] = "confirming"; session["expected"] = "confirm"
        msg = f"Please review your request: **{summarize_request(session)}**."
        if session.get("doc_type") == "COE" and session.get("sis_confirmed") not in {True, False}:
            msg += "\nBefore we proceed: **Are your SIS personal details up to date?** (Yes/No)"
            session["expected"] = "sis_confirm"
        else:
            msg += "\nType **confirm** to proceed, **edit** to change, or **cancel** to abort."
        save_to_db(session, access_token)
        return msg

    elif exp == "confirm":
        if session.get("doc_type") == "COE" and session.get("sis_confirmed") not in {True, False}:
            session["expected"] = "sis_confirm"
            save_to_db(session, access_token)
            return ("Before we proceed, please confirm: "
                    "**Are your SIS personal details up to date?** (Yes/No)")
        if text_lower == "confirm" or is_yes(text):
            if not session.get("purpose"):
                session["expected"] = "purpose"
                save_to_db(session, access_token)
                return "Oh, it looks like you missed the purpose for your request. Please provide it (e.g., Scholarship, Visa, PRC)."
            session["status"] = "awaiting_payment"
            session["expected"] = "payment_method"
            msg = ("Thanks! Your request is confirmed: "
                   f"**{summarize_request(session)}**\n" + nonrefundable_notice())
            if session.get("same_day", {}).get("enabled"):
                msg += "\n" + sameday_line(session)
            save_to_db(session, access_token)
            return msg
        if text_lower == "edit":
            session["expected"] = "edit"
            save_to_db(session, access_token)
            return ("Okay, let’s edit. Try: `edit sem 2`, `change sy 2025-2026`, "
                    "`set purpose scholarship`, or `edit doc OTR`.")
        if text_lower in {"cancel", "stop"}:
            if session.get("status") == "confirming":
                session["status"] = "cancelled"
                reset_request_fields(session)
                session["mode"] = "qa"
                save_to_db(session, access_token)
                return "Your request has been **cancelled**. You can start a new request anytime."
            return "Sorry, the request **cannot be cancelled** after payment."
        return "Please type **confirm** to proceed, **edit** to change, or **cancel** to abort."

    elif exp == "payment_method":
        s = text.strip().lower()
        if "personal" in s or "finance" in s or "cashier" in s:
            session["payment_method"] = "personal"
        elif "gcash" in s or "online" in s:
            session["payment_method"] = "gcash"
        else:
            return "Please choose **Personal (Finance)** or **Online (GCash)**."
        session["status"] = "awaiting_payment"; session["expected"] = "receipt"
        save_to_db(session, access_token)
        if session["payment_method"] == "gcash":
            return ("Great. Please pay using the provided online channel.\n"
                    "After paying, **paste your receipt/reference code** (e.g., `RCPT12345`).")
        return ("Okay. Once you finish payment at the Finance Department, "
                "please **paste your receipt/reference code** (e.g., `RCPT12345`).")

    elif exp == "receipt":
        # --- Early guard: once submitted, do not accept more receipts
        if session.get("status") in {"pending", "on_process", "ready_to_claim"}:
            return (
                "Your request is already **submitted** and awaiting processing. "
                "If you want to start a new request, please answer **Yes** to request another, "
                "or type **new**."
            )

        rid = text.strip()
        if not rid:
            return "Oops, it seems you didn’t provide a receipt/reference code. Please enter it."

        if "receipt_hashes" not in session:
            session["receipt_hashes"] = []

        h = md5(rid)
        if h in session["receipt_hashes"]:
            return (
                "This receipt looks **identical** to a previously submitted one. "
                "Please enter a **new** receipt code."
            )
        session["receipt_hashes"].append(h)

        # 1) Fetch existing requests to decide create/update and avoid duplicates
        reqs = fetch_my_requests(access_token) or []

        def is_same_request(r):
            return (
                (r.get("document_type") or r.get("doc_type")) == session.get("doc_type")
                and (r.get("semester") == session.get("semester"))
                and (r.get("school_year") == session.get("school_year"))
                and (r.get("purpose") == session.get("purpose"))
            )

        # If there is already a submitted/processing/ready match, do NOT submit again
        already_submitted = next(
            (r for r in reqs if is_same_request(r)
             and r.get("status") in ["pending", "on_process", "ready_to_claim"]),
            None
        )
        if already_submitted:
            session["status"] = already_submitted.get("status") or "pending"
            session["expected"] = "another"
            session["mode"] = "qa"
            save_to_db(session, access_token)
            return (
                "We already have your request on file for this document. "
                "Would you like to **request another document now**? (Yes/No)"
            )

        # Otherwise: create/update the *current* in-progress request
        resp = submit_document_request(
            access_token,
            doc_type=session.get("doc_type"),
            semester=session.get("semester"),
            school_year=session.get("school_year"),
            purpose=session.get("purpose"),
            other_doc_name=session.get("other_doc_name"),
            payment_method=session.get("payment_method"),
            receipt_reference=rid,
            conversation_id=session.get("conversation_id"),  # NEW
        )

        if resp:
            # Success path: flip state and route to "another" prompt
            session["status"] = "pending"
            session["expected"] = "another"
            session["mode"] = "qa"
            save_to_db(session, access_token)
            msg = (
                "Thanks, I’ve recorded your receipt.\n"
                f"✅ Request created: {resp['document_type']} (Status: {resp['status']})\n"
                + sameday_line(session)
                + "\n\nWould you like to **request another document now**? (Yes/No)"
            )
            return msg

        # If the backend rejected the submit (e.g., validation), keep user in the receipt step
        return "⚠️ Failed to submit request after receipt. Please try again or contact support."

    elif exp == "another":
        if is_yes(text):
            reset_request_fields(session)
            session["mode"] = "request"
            session["expected"] = "doc_type"
            # NEW: rotate conversation id when starting another request
            session["conversation_id"] = slugify(f"{session['user_id']}_{now_iso()}")
            save_to_db(session, access_token)
            return "Great. What document do you need — **OTR**, **COG**, **COE**, or **Others**?"
        if is_no(text):
            session["expected"] = None
            session["mode"] = "qa"
            save_to_db(session, access_token)
            return "Okay. I’m here if you need anything else."
        return "Please answer **Yes** or **No**."

    elif exp == "specify":
        name = text.strip()
        if len(name) < 3:
            return "Please provide the document name."
        session["specify"] = name; session["other_doc_name"] = name; session["expected"] = None
        mapped = map_doc_synonyms(name)
        if mapped and mapped != "OTHERS":
            session["doc_type"] = mapped
        slot = next_missing_slot(session)
        if slot:
            session["expected"] = slot
            save_to_db(session, access_token)
            return ask_for(slot, session)
        session["status"] = "confirming"; session["expected"] = "confirm"
        msg = f"Please review your request: **{summarize_request(session)}**."
        if session.get("doc_type") == "COE" and session.get("sis_confirmed") not in {True, False}:
            msg += "\nBefore we proceed: **Are your SIS personal details up to date?** (Yes/No)"
            session["expected"] = "sis_confirm"
        else:
            msg += "\nType **confirm** to proceed, **edit** to change, or **cancel** to abort."
        save_to_db(session, access_token)
        return msg

    # 3) Decide behavior when not expecting a field
    if session["mode"] == "qa":
        how_doc = is_howto_question(text)
        if how_doc:
            save_to_db(session, access_token)
            return provide_howto(how_doc)
        shortcut_doc = doc_from_text(text)
        if shortcut_doc:
            session["mode"] = "request"
            session["doc_type"] = shortcut_doc
            label = {"OTR": "Official Transcript of Records (OTR)", "COG": "Certificate of Grades (COG)", "COE": "Certificate of Enrollment (COE)", "OTHERS": "Other certificate"}[shortcut_doc]
            slot = next_missing_slot(session)
            session["expected"] = slot
            save_to_db(session, access_token)
            if shortcut_doc in {"COG", "COE"} and slot == "semester":
                return (f"Got it — **{label}**.\n"
                        "Please provide **Semester (1/2)** and **School Year** (e.g., 2025-2026).\n"
                        "You can type them together, like: `Sem 1 SY 2025-2026`.")
            return f"Got it — **{label}**.\n{ask_for(slot, session)}"
        guess_doc, score, _match = guess_doc_with_fuzzy(text)
        if guess_doc and score >= 0.65:
            session["expected"] = "confirm_doc_guess"
            session["doc_guess"] = guess_doc
            pretty = {"OTR": "OTR (Official Transcript of Records)",
                      "COG": "COG (Certificate of Grades)",
                      "COE": "COE (Certificate of Enrollment)",
                      "OTHERS": "Other certificate"}[guess_doc]
            save_to_db(session, access_token)
            return f"Just to confirm — did you mean **{pretty}**? (Yes/No)"
        if looks_like_question_permission(text):
            session["expected"] = "consent"
            save_to_db(session, access_token)
            return ("Yes, you can request that. Would you like to **proceed now** "
                    "and provide the requirements? (Yes/No)")
        if looks_like_request_intent(text):
            session["mode"] = "request"
            save_to_db(session, access_token)
            return init_or_fill_from_text(session, text, access_token)

        if session.get("mode") == "request":
            save_to_db(session, access_token)
            return init_or_fill_from_text(session, text, access_token)
        return scope_guard_message()

    if session.get("mode") == "request":
        save_to_db(session, access_token)
        return init_or_fill_from_text(session, text, access_token)

    save_to_db(session, access_token)
    return ("I can help with registrar document requests (OTR, COG, COE, others). "
            "Ask a question like “How to request COG?” or say “COG” / “Request my OTR”.")

def init_or_fill_from_text(session: Dict, text: str, access_token: str) -> str:
    if session.get("doc_type"):
        sem = normalize_semester(text)
        if sem in (1, 2):
            session["semester"] = sem
        sy = normalize_school_year(text)
        if sy:
            session["school_year"] = sy
        purpose_match = re.search(r"purpose[:\s]+(.+)", text.lower())
        if purpose_match:
            session["purpose"] = purpose_match.group(1).strip()
        slot = next_missing_slot(session)
        if slot:
            session["expected"] = slot
            save_to_db(session, access_token)
            return ask_for(slot, session)
        session["status"] = "confirming"; session["expected"] = "confirm"
        msg = f"Please review your request: **{summarize_request(session)}**."
        if session["doc_type"] == "COE" and session.get("sis_confirmed") not in {True, False}:
            msg += ("\nBefore we proceed: **Are your SIS personal details up to date?** (Yes/No)\n"
                    "If everything looks good, you can also type **confirm** to proceed.")
            session["expected"] = "sis_confirm"
        else:
            msg += "\nType **confirm** to proceed, **edit** to change, or **cancel** to abort."
        save_to_db(session, access_token)
        return msg

    mapped = map_doc_synonyms(text)
    doc_type = mapped
    sem = normalize_semester(text)
    sy = normalize_school_year(text)

    if not doc_type:
        guess_doc, score, _match = guess_doc_with_fuzzy(text)
        if guess_doc and score >= 0.65:
            session["expected"] = "confirm_doc_guess"; session["doc_guess"] = guess_doc
            pretty = {"OTR": "OTR (Official Transcript of Records)",
                      "COG": "COG (Certificate of Grades)",
                      "COE": "COE (Certificate of Enrollment)",
                      "OTHERS": "Other certificate"}[guess_doc]
            save_to_db(session, access_token)
            return f"Just to confirm — did you mean **{pretty}**? (Yes/No)"

    if not doc_type:
        out = clf_predict(text)
        if out:
            doc_type = out.get("doc_type")
            sem = sem or out.get("semester")

    if doc_type not in DOC_TYPES:
        session["expected"] = "doc_type"
        save_to_db(session, access_token)
        return ask_for("doc_type", session)

    session["doc_type"] = doc_type
    if doc_type in {"COG", "COE"} and sem in (1, 2):
        session["semester"] = sem
    if sy:
        session["school_year"] = sy
    purpose_match = re.search(r"purpose[:\s]+(.+)", text.lower())
    if purpose_match:
        session["purpose"] = purpose_match.group(1).strip()

    label = {"OTR": "Official Transcript of Records (OTR)",
             "COG": "Certificate of Grades (COG)",
             "COE": "Certificate of Enrollment (COE)",
             "OTHERS": "Other certificate"}[doc_type]

    slot = next_missing_slot(session)
    session["expected"] = slot
    save_to_db(session, access_token)
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

    auth_data = login(email, password, role="student")
    if not auth_data:
        print("❌ Could not log in. Exiting.")
        return

    access_token = auth_data["access"]
    user_id = auth_data.get("email")
    print(f"✅ Logged in as {auth_data.get('name')} ({auth_data.get('role')})")

    get_current_user(access_token)

    try:
        reqs = fetch_my_requests(access_token)
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

    # Sanitize stale local state
    if session.get("expected") == "receipt" and session.get("status") in {"pending", "on_process", "ready_to_claim"}:
        session["expected"] = None
        session["mode"] = "qa"

    greet = bot_intro(session)
    print(greet)
    push_history(session, "bot", greet)
    save_session(session)
    save_to_db(session, access_token)

    while True:
        try:
            msg = input("> ").strip()
        except (EOFError, KeyboardInterrupt):
            print("\nBye!")
            break
        if msg.lower() in {"quit", "exit"}:
            try:
                fetch_my_requests(access_token)
            except Exception as e:
                print(f"(warn) Could not sync with backend: {e}")
            print("Bye!")
            break

        push_history(session, "user", msg)
        reply = handle_user_text(session, msg, access_token)
        push_history(session, "bot", reply)
        print(reply)
        save_session(session)
        save_to_db(session, access_token)

if __name__ == "__main__":
    main()
