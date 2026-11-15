import sys
sys.path.insert(0, str(__import__('pathlib').Path(__file__).resolve().parents[1]))
from supabase_env import get_supabase_credentials
import urllib.request, json

u, k = get_supabase_credentials()
req = urllib.request.Request(
    f"{u}/rest/v1/previous_papers?id=eq.66&limit=1",
    headers={"apikey": k, "Authorization": f"Bearer {k}", "Accept": "application/json"}
)
with urllib.request.urlopen(req) as res:
    data = json.loads(res.read())
if data:
    for key, val in data[0].items():
        print(f"  {key}: {val}")
