import re
from typing import Tuple, List

VALID_YR_MIN, VALID_YR_MAX = 2000, 2026

def normalize_school_year(raw: str | None) -> Tuple[str | None, List[str]]:
    issues = []
    if not raw:
        return None, ["missing_school_year"]
    t = raw.strip().lower()
    t = t.replace("school year","").replace("sy","")
    t = re.sub(r"[^0-9/\-–]", " ", t)
    t = t.replace("–","-").replace("/","-")
    nums = re.findall(r"\d+", t)
    if not nums:
        return None, ["invalid_school_year"]

    def four(y: int) -> int: return 2000 + y if y < 100 else y

    if len(nums) == 1:
        y1 = four(int(nums[0])); y2 = y1 + 1
    else:
        y1 = four(int(nums[0])); y2 = four(int(nums[1]))

    if not (VALID_YR_MIN <= y1 <= VALID_YR_MAX):
        issues.append("school_year_out_of_range")
    if y2 != y1 + 1:
        issues.append("school_year_not_consecutive")

    return f"{y1}-{y2}", issues

def clamp_program(raw: str | None, allowed: set[str]) -> str:
    if not raw: return "unknown"
    v = raw.strip().upper()
    return v if v in allowed else "unknown"
