POLICY_VERSION = "v1.0"

DOC_TYPES = ["OTR", "COG", "COE", "OTHERS"]

DOC_REQUIREMENTS = {
    "OTR":  {"required": [],                         "optional": ["purpose"], "needs_personal_info": False},
    "COG":  {"required": ["semester", "school_year"],"optional": ["purpose"], "needs_personal_info": False},
    "COE":  {"required": ["semester", "school_year"],"optional": ["purpose"], "needs_personal_info": True},
    "OTHERS":{"required": [],                         "optional": ["specify","purpose"], "needs_personal_info": False},
}

PROGRAMS = {
    "BSIT","BSCE","BSEE","BSME","BSTM","BSHM","BSA","BSBA-FM","BSBA-MM","BSN","BSPSYCH","unknown"
}
