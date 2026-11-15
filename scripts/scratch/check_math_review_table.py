"""Check if math_review table already exists in Supabase."""
import sys, json
sys.path.insert(0, str(__import__('pathlib').Path(__file__).resolve().parents[1]))
from supabase_env import get_supabase_credentials
import urllib.request, urllib.error

url, key = get_supabase_credentials()
headers = {
    "apikey": key,
    "Authorization": f"Bearer {key}",
    "Accept": "application/json",
}

req = urllib.request.Request(
    f"{url}/rest/v1/math_review?limit=1",
    headers=headers,
)
try:
    with urllib.request.urlopen(req) as res:
        data = json.loads(res.read())
        print("Table EXISTS. Columns:", list(data[0].keys()) if data else "(empty table)")
except urllib.error.HTTPError as e:
    body = e.read().decode()
    print(f"HTTP {e.code}: {body[:300]}")
    if "does not exist" in body or "relation" in body:
        print("\n=> Table does NOT exist yet. Safe to create.")
