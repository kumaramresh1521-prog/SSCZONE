import sys
sys.path.insert(0, str(__import__('pathlib').Path(__file__).resolve().parents[1]))
import urllib.request, json
from supabase_env import get_supabase_credentials

url, key = get_supabase_credentials()
headers = {'apikey': key, 'Authorization': f'Bearer {key}', 'Accept': 'application/json'}

# Check distribution of [IMG: across subjects
# Q.1-25: Reasoning
# Q.26-50: GK
# Q.51-75: Math
# Q.76-100: English

ranges = [
    ("Reasoning (1-25)", 1, 25),
    ("GK (26-50)", 26, 50),
    ("Math (51-75)", 51, 75),
    ("English (76-100)", 76, 100),
]

for name, start, end in ranges:
    # in question_text
    req = urllib.request.Request(
        f"{url}/rest/v1/paper_questions?question_text=like.*IMG*&question_number=gte.{start}&question_number=lte.{end}&select=id",
        headers={**headers, "Prefer": "count=exact"}
    )
    # let's just count
    with urllib.request.urlopen(req) as res:
        count_header = res.headers.get("content-range", "")
        print(f"{name} with [IMG in text]: {count_header}")

# Check options with [IMG:
for name, start, end in ranges:
    req = urllib.request.Request(
        f"{url}/rest/v1/paper_questions?option_a=like.*IMG*&question_number=gte.{start}&question_number=lte.{end}&select=id",
        headers={**headers, "Prefer": "count=exact"}
    )
    with urllib.request.urlopen(req) as res:
        count_header = res.headers.get("content-range", "")
        print(f"{name} with [IMG in Option A]: {count_header}")
