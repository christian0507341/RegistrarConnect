from typing import Any, Dict
from .policy import DOC_REQUIREMENTS, POLICY_VERSION, PROGRAMS
from .synonyms import map_doc_type, map_semester
from .normalizers import normalize_school_year, clamp_program

def normalize_inputs(payload: Dict[str, Any], profile: Dict[str, Any] | None = None) -> Dict[str, Any]:
    issues, hints = [], []
    # Doc type
    doc_raw = (payload.get("doc_type_raw") or "").strip()
    doc_canon = map_doc_type(doc_raw.lower()) or ("OTHERS" if doc_raw else None)
    if not doc_canon:
        issues.append("missing_doc_type")
        hints.append("Please specify the document type (OTR, COG, COE, or Others).")

    # Semester
    sem_raw = (payload.get("semester_raw") or "").strip()
    sem_val = map_semester(sem_raw.lower()) if sem_raw else None

    # School Year
    sy_raw = (payload.get("school_year_raw") or "").strip()
    sy_norm, sy_issues = (normalize_school_year(sy_raw) if sy_raw else (None, ["missing_school_year"]))
    # Only require SY if policy says so
    if doc_canon in ("COG","COE"):
        issues.extend([i for i in sy_issues if i != "missing_school_year"])
        if sy_norm is None:
            issues.append("missing_school_year")

    # Program (from profile preferred)
    profile = profile or {}
    program_src = profile.get("program") or payload.get("program_raw")
    program_norm = clamp_program(program_src, PROGRAMS)

    # Personal info (for COE). Pull from profile when available.
    pi = {**{"full_name": None,"birthdate": None,"exact_address": None,"place_of_birth": None},
          **(payload.get("personal_info") or {})}
    for k in pi:
        if not pi[k] and profile.get(k):
            pi[k] = profile[k]

    # Apply policy requirements
    if doc_canon:
        req = DOC_REQUIREMENTS[doc_canon]
        if "semester" in req["required"] and sem_val is None:
            issues.append("missing_semester")
        if req.get("needs_personal_info"):
            missing_pi = [k for k,v in pi.items() if not v]
            if missing_pi:
                issues.append("requires_personal_info_for_coe")

    # Hints
    if "missing_semester" in issues or "missing_school_year" in issues:
        hints.append("Please provide both: Semester: 1 or 2, and School Year: YYYY-YYYY (e.g., Semester: 2, School Year: 2024-2025).")
    if "school_year_not_consecutive" in issues:
        hints.append("Use School Year: 2025-2026 (second year must be first + 1).")
    if "requires_personal_info_for_coe" in issues:
        hints.append("For COE, add: Full Name, Birthdate (MM-DD-YYYY), Exact Address, Place of Birth.")

    return {
        "normalized": {
            "doc_type": doc_canon,
            "semester": sem_val if sem_val is not None else "unknown",
            "school_year": sy_norm,
            "program": program_norm,
        },
        "issues": sorted(set(issues)),
        "hints": sorted(set(hints)),
        "confidences": {  # placeholders until BERT is wired
            "doc_type": 1.0 if doc_canon else 0.0,
            "semester": 1.0 if sem_val is not None else 0.0,
            "program": 1.0 if program_norm != "unknown" else 0.0,
        },
        "policy_version": POLICY_VERSION,
        "model_version": "ic-en-v1-synmap",
    }
