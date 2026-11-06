import requests
import re
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

r = requests.get(f'{SUPABASE_URL}/rest/v1/paper_questions?paper_id=eq.6&order=question_number.asc', headers=HEADERS)
qs = r.json()

devanagari = re.compile(r'[\u0900-\u097F]')

for q in qs:
    txt = q['question_text'] or ''
    m = devanagari.search(txt)
    if m:
        idx = m.start()
        # Look 40 chars before idx and 40 chars after idx
        start = max(0, idx - 40)
        end = min(len(txt), idx + 40)
        junction = txt[start:end]
        print(f"Q.{q['question_number']} | ...{repr(junction)}...")
    else:
        print(f"Q.{q['question_number']} | NO HINDI")
