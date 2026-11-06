import sys, os, requests, json
sys.stdout.reconfigure(encoding='utf-8')

env = {}
with open(r'c:\ssczone\.env.local', 'r') as f:
    for line in f:
        line = line.strip()
        if '=' in line and not line.startswith('#'):
            k, v = line.split('=', 1)
            env[k.strip()] = v.strip()

SUPABASE_URL = env['NEXT_PUBLIC_SUPABASE_URL']
SUPABASE_KEY = env['SUPABASE_SERVICE_ROLE_KEY']
HEADERS = {
    'apikey': SUPABASE_KEY,
    'Authorization': f'Bearer {SUPABASE_KEY}',
    'Content-Type': 'application/json',
}

# Fetch one row to see column names
resp = requests.get(
    f'{SUPABASE_URL}/rest/v1/questions?limit=1',
    headers=HEADERS
)
print(f"Status: {resp.status_code}")
if resp.status_code == 200:
    rows = resp.json()
    if rows:
        print("Column names:", list(rows[0].keys()))
        print("Sample row:", json.dumps(rows[0], indent=2, ensure_ascii=False)[:500])
else:
    print("Error:", resp.text)
