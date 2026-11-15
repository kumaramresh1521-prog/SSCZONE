import sys
sys.path.insert(0, str(__import__('pathlib').Path(__file__).resolve().parents[1]))
from supabase_env import get_supabase_credentials
import urllib.request, json

u, k = get_supabase_credentials()

sample_table = """Match the concepts in column A with their respective descriptions in column B:

| Column A | Column B |
| :--- | :--- |
| a. Devaluation | 1. decline in the market rate of exchange |
| b. Depreciation | 2. contraction of home currency |
| c. Deflation | 3. foreign exchange rationing |
| d. Exchange control | 4. contraction of imports |
| | 5. official reduction in external value of the currency |"""

req = urllib.request.Request(
    f"{u}/rest/v1/math_review?question_id=eq.18541",
    data=json.dumps({"suggested_latex": sample_table}).encode(),
    headers={
        "apikey": k,
        "Authorization": f"Bearer {k}",
        "Content-Type": "application/json",
        "Prefer": "return=minimal"
    },
    method="PATCH"
)
with urllib.request.urlopen(req) as res:
    print("Updated Q#18541 in math_review table. Status:", res.status)
