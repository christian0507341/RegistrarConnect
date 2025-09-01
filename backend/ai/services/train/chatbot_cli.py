import os, re, json, hashlib, datetime as dt
from typing import Dict, List, Optional
from infer_doc_sem import predict as clf_predict

HERE = os.path.dirname(__file__)
SESS_DIR = os.path.join(HERE, "sessions")
os.makedirs(SESS_DIR, exist_ok=True)

DOC_TYPES = {"OTR", "COG", "COE", "OTHERS"}
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
    s = text.replace("–", "-").replace("—", "-").replace("/", "-").strip()
    # 2024-2025 or 2024-25
    m = re.search(r"\b(20\d{2})\s*[-]\s*(\d{2,4})\b", s)
    if m:
        y1 = int(m.group(1))
        y2_raw = int(m.group(2))
        y2 = _two_digit_year_to_full(y2_raw) if y2_raw < 100 else y2_raw
        if y2 == y1 + 1:
            return f"{y1}-{y2}"
    # 2526 pattern (two digits stuck)
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
        "status": "draft",  # draft → confirming → awaiting_payment → pending → on_process → ready_to_claim
        "doc_type": None,
        "semester": None,
        "school_year": None,
        "purpose": None,
        "sis_confirmed": None,  # COE only
        "payment_method": None,
        "receipt_hashes": [],
        "expected": None,       # what the bot expects next
        "same_day": {"enabled": SAME_DAY_ENABLED, "reason": SAME_DAY_REASON},
        "history": [],
    }
    return session

def reset_request_fields(session: Dict):
    """Clear only the current request fields; keep user/session state + history."""
    for k in ["doc_type", "semester", "school_year", "purpose",
              "sis_confirmed", "payment_method"]:
        session[k] = None
    session["receipt_hashes"] = []
    session["status"] = "draft"
    session["expected"] = None
    session["mode"] = "qa"


def next_missing_slot(session: Dict) -> Optional[str]:
    doc = session.get("doc_type")
    if not doc:
        return "doc_type"
    # universal purpose for all docs
    if doc in {"COG", "COE"}:
        if session.get("semester") not in {1, 2}:
            return "semester"
        if not session.get("school_year"):
            return "school_year"
        if not session.get("purpose"):
            return "purpose"
        if doc == "COE" and session.get("sis_confirmed") not in {True, False}:
            return "sis_confirm"
        return None
    else:
        # OTR / OTHERS
        if doc == "OTHERS" and not session.get("other_doc_name"):
            return "other_doc_name"
        if not session.get("purpose"):
            return "purpose"
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
        return "Before we proceed: **Are your personal details in SIS correct and up to date?** (Yes/No)"
    if slot == "other_doc_name":
        return "Please tell me the name of the document you need."
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

def handle_user_text(session: Dict, text: str) -> str:
    # Commands
    low = text.strip().lower()
    if low in {"help", "/help"}:
        return ("Commands: help · status · history · cancel (only before payment) · reset\n"
                "Or just type your question or request.")
    if low in {"status", "/status"}:
        return f"Status: **{session['status']}** | {summarize_request(session)}"
    if low in {"history", "/history"}:
        n = min(len(session.get("history", [])), 5)
        tail = session["history"][-n:]
        return "Recent messages:\n" + "\n".join([f"- {m['sender']}: {m['text']}" for m in tail])
    if low in {"reset", "/reset"}:
        # keep user_id and same_day, reset rest
        keep = {"user_id": session["user_id"], "same_day": session.get("same_day")}
        session.clear()
        session.update(start_new_session(keep["user_id"]))
        session["same_day"] = keep["same_day"]
        return "Okay, I’ve reset the conversation. What do you need?"
    
    if low in {"new", "new request", "another", "start over"}:
        reset_request_fields(session)
        session["mode"] = "request"
        session["expected"] = "doc_type"
        return "Starting a new request. Do you need **OTR**, **COG**, **COE**, or **Others**?"


    # Cancel rules
    if low in {"cancel", "stop"}:
        if session["status"] in UNPAID_STATUSES:
            session["status"] = "cancelled"
            session["expected"] = None
            session["doc_type"] = session["semester"] = session["school_year"] = session["purpose"] = None
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
        name = text.strip()
        if len(name) < 3:
            return "Please provide the document name."
        session["other_doc_name"] = name
        session["expected"] = None
        # Map known names to official types if possible
        mapped = map_doc_synonyms(name)
        if mapped and mapped != "OTHERS":
            session["doc_type"] = mapped

    elif exp == "confirm":
        # For COE, require SIS confirmation first
        if session.get("doc_type") == "COE" and session.get("sis_confirmed") not in {True, False}:
            session["expected"] = "sis_confirm"
            return ("Before we proceed, please confirm: "
                    "**Are your SIS personal details up to date?** (Yes/No)")
        
        if low == "confirm" or is_yes(text):
            session["status"] = "awaiting_payment"
            session["expected"] = "payment_method"
            msg = (
                "Thanks! Your request is confirmed: "
                f"**{summarize_request(session)}**\n" + nonrefundable_notice()
            )
            # show same-day note (if toggle enabled)
            if session.get("same_day", {}).get("enabled"):
                msg += "\n" + sameday_line(session)
            return msg
        elif low == "edit" or is_no(text):
            session["expected"] = None
            return "Okay, tell me what to change."
        else:
            return "Please type **confirm** to proceed or **edit** to change details."


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
        h = md5(rid)
        if h in session["receipt_hashes"]:
            return ("This receipt looks **identical** to a previously submitted one and can’t be used.\n"
                    "Please upload/paste a **new** receipt reference.")
        session["receipt_hashes"].append(h)
        session["status"] = "pending"
        session["expected"] = "another"

        msg = ("Thanks, I’ve recorded your receipt.\n"
            "Your request is now **pending faculty approval**.\n" + sameday_line(session) +
            "\n\nWould you like to **request another document now**? (Yes/No)")
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

    # 3) If we are not expecting a specific field, decide behavior
#    (Q&A vs Request initiation / continue filling)
    if session["mode"] == "qa":
        # (a) “How to request … ?” → informational answer (do NOT start request flow)
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

        # (c) Permission-style question → ask consent to proceed
        if looks_like_question_permission(text):
            session["expected"] = "consent"
            return ("Yes, you can request that. Would you like to **proceed now** "
                    "and provide the requirements? (Yes/No)")

        # (d) Explicit request phrasing → switch to request and parse
        if looks_like_request_intent(text):
            session["mode"] = "request"
            return init_or_fill_from_text(session, text)

        # (e) informational fallback (QA mode)
        return ("I can help with registrar document requests (OTR, COG, COE, others). "
                "Ask a question like “How to request COG?” or say “COG” / “Request my OTR”.")
    
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


    # doc_type not set → try explicit mapping first, then classifier
    mapped = map_doc_synonyms(text)
    doc_type = mapped
    sem = normalize_semester(text)
    sy = normalize_school_year(text)

    if not doc_type:
        # Classifier to initialize
        out = clf_predict(text)
        doc_type = out.get("doc_type") if out else None
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
    user_id = input("Enter your Student ID or email to load your session: ").strip()
    session = load_session(user_id) or start_new_session(user_id)

    # greet / resume
    greet = bot_intro(session)
    print(greet); push_history(session, "bot", greet); save_session(session)

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

if __name__ == "__main__":
    main()
