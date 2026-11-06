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

r = requests.get(f'{SUPABASE_URL}/rest/v1/previous_papers?order=id.asc', headers=HEADERS)
data = r.json()
print("Type:", type(data))
if isinstance(data, dict):
    print("Dict keys/error:", data)
elif isinstance(data, list):
    print(f"Total papers: {len(data)}")
    for p in data:
        print(f"ID: {p.get('id')} | Title: {p.get('title')} | allow_trans: {p.get('allow_translation')}")
