"""Check paper_questions table columns and a sample row."""
import sys, json
sys.path.insert(0, str(__import__('pathlib').Path(__file__).resolve().parents[1]))
from supabase_env import get_supabase_credentials
import urllib.request

url, key = get_supabase_credentials()
headers = {
    "apikey": key,
    "Authorization": f"Bearer {key}",
    "Content-Type": "application/json",
}

# Fetch one sample row to see column names
req = urllib.request.Request(
    f"{url}/rest/v1/paper_questions?limit=1",
    headers={**headers, "Accept": "application/json"},
)
with urllib.request.urlopen(req) as res:
    rows = json.loads(res.read())

if rows:
    print("Columns:", list(rows[0].keys()))
    print("\nSample row (first 5 fields):")
    for k, v in list(rows[0].items())[:8]:
        val = str(v)[:120] if v else "(null)"
        print(f"  {k}: {val}")
else:
    print("No rows found.")
