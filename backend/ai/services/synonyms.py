DOC_TYPE_SYNONYMS = {
    "otr": "OTR","tor": "OTR","transcript": "OTR","transcript of records": "OTR",
    "cog": "COG","copy of grades": "COG","grades": "COG","copy grades": "COG",
    "coe": "COE","certificate of enrollment": "COE","cert of enrollment": "COE",
}
SEMESTER_SYNONYMS = {
    "1": 1,"1st": 1,"first": 1,"sem 1": 1,"semester 1": 1,
    "2": 2,"2nd": 2,"second": 2,"sem 2": 2,"semester 2": 2,
}
def map_doc_type(text: str) -> str | None:
    t = (text or "").strip().lower()
    return DOC_TYPE_SYNONYMS.get(t)
def map_semester(text: str) -> int | None:
    t = (text or "").strip().lower()
    return SEMESTER_SYNONYMS.get(t)
