import requests
import sys

sys.stdout.reconfigure(encoding='utf-8')

env = {}
with open(r'c:\ssczone\.env.local', 'r', encoding='utf-8') as f:
    for line in f:
        line = line.strip()
        if '=' in line and not line.startswith('#'):
            k, v = line.split('=', 1)
            env[k.strip()] = v.strip().strip('"\'')

SUPABASE_URL = env['NEXT_PUBLIC_SUPABASE_URL']
SUPABASE_KEY = env['SUPABASE_SERVICE_ROLE_KEY']
HEADERS = {'apikey': SUPABASE_KEY, 'Authorization': f'Bearer {SUPABASE_KEY}'}

# Check user_test_attempts or similar tables
for table in ['user_test_attempts', 'test_results', 'user_answers', 'reports']:
    r = requests.get(f'{SUPABASE_URL}/rest/v1/{table}?order=created_at.desc&limit=5', headers=HEADERS)
    print(f"=== Table: {table} (Status {r.status_code}) ===")
    if r.status_code == 200:
        data = r.json()
        print(f"Rows: {len(data)}")
        for row in data:
            print(" ", row)
