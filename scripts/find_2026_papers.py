import json
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
papers = r.json()

p2026 = []
for p in papers:
    pid = p['id']
    title = p.get('title', '')
    yr = p.get('year')
    if yr == 2026 or '2026' in title:
        p2026.append((pid, yr, title, p.get('allow_translation')))

print(f"Total 2026 papers found: {len(p2026)}")
for p in p2026:
    print(f"  ID {p[0]}: Year={p[1]} | AllowTranslation={p[3]} | Title={p[2]}")
