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

# List all tables via information_schema or by trying known table names
# Try common table names for PYQ data
table_names = ['pyq_questions', 'paper_questions', 'exam_questions', 'papers', 'pyq_papers', 
               'ssc_questions', 'past_questions', 'previous_questions']

for table in table_names:
    resp = requests.get(
        f'{SUPABASE_URL}/rest/v1/{table}?limit=1',
        headers=HEADERS
    )
    if resp.status_code == 200:
        rows = resp.json()
        cols = list(rows[0].keys()) if rows else []
        print(f"TABLE '{table}': EXISTS, columns={cols[:5]}...")
    elif resp.status_code == 404:
        print(f"TABLE '{table}': NOT FOUND (404)")
    else:
        print(f"TABLE '{table}': {resp.status_code} - {resp.text[:100]}")
