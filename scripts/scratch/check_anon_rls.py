import sys
sys.path.insert(0, 'c:/ssczone/scripts')
from supabase_env import get_supabase_credentials
import urllib.request, json

u, k = get_supabase_credentials()

# Let's inspect if test_attempts has RLS enabled by querying pg_tables if possible
# Or check if inserting with anon key is allowed or requires auth
anon_key = ""
with open("c:/ssczone/.env.local", encoding="utf-8") as f:
    for line in f:
        if line.startswith("NEXT_PUBLIC_SUPABASE_ANON_KEY="):
            anon_key = line.split("=", 1)[1].strip().strip('"').strip("'")

print(f"Anon key length: {len(anon_key)}")

# Try select with anon key
req = urllib.request.Request(
    f'{u}/rest/v1/test_attempts?select=id&limit=1',
    headers={'apikey': anon_key, 'Authorization': f'Bearer {anon_key}'}
)
try:
    with urllib.request.urlopen(req) as resp:
        print("Anon SELECT on test_attempts:", resp.status)
except urllib.error.HTTPError as e:
    print("Anon SELECT on test_attempts failed (RLS active):", e.code, e.read().decode())
