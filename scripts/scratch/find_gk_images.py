import sys
sys.path.insert(0, str(__import__('pathlib').Path(__file__).resolve().parents[1]))
import urllib.request, json
from supabase_env import get_supabase_credentials

url, key = get_supabase_credentials()
headers = {'apikey': key, 'Authorization': f'Bearer {key}', 'Accept': 'application/json'}

# Fetch GK questions (question_number 26 to 50) that have image links in question_text
req = urllib.request.Request(
    f"{url}/rest/v1/paper_questions?question_number=gte.26&question_number=lte.50&question_text=ilike.*images*&limit=20",
    headers=headers
)
with urllib.request.urlopen(req) as res:
    rows = json.loads(res.read())

print(f"Found {len(rows)} sample GK questions with images in question_text:")
for r in rows:
    print(f"Q#{r['id']} Paper:{r['paper_id']} Q.{r['question_number']}:")
    print("  " + r['question_text'].replace('\n', '\n  '))
    print("  Opts:", r['option_a'], "|", r['option_b'])
    print("-" * 60)

# Total count of such questions across all 39 papers:
count_req = urllib.request.Request(
    f"{url}/rest/v1/paper_questions?question_number=gte.26&question_number=lte.50&question_text=ilike.*images*&select=id",
    headers={**headers, "Prefer": "count=exact"}
)
with urllib.request.urlopen(count_req) as res:
    print("Total GK questions with images across all papers:", res.headers.get("content-range"))
