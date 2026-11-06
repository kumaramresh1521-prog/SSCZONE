import os
import sys
import re
import requests

sys.stdout.reconfigure(encoding='utf-8')

with open(r'c:\ssczone\.env.local', 'r', encoding='utf-8') as f:
    env = dict(l.strip().split('=', 1) for l in f if '=' in l and not l.startswith('#'))

SUPABASE_URL = env['NEXT_PUBLIC_SUPABASE_URL']
SUPABASE_KEY = env['SUPABASE_SERVICE_ROLE_KEY']
HEADERS = {
    'apikey': SUPABASE_KEY,
    'Authorization': f'Bearer {SUPABASE_KEY}',
    'Content-Type': 'application/json'
}

# Fetch reasoning questions (question_number between 1 and 25) with Hindi in options
url = f"{SUPABASE_URL}/rest/v1/paper_questions?question_number=lte.25&select=id,paper_id,question_number,question_text,option_a,option_b,option_c,option_d&order=id.asc&limit=1000"
r = requests.get(url, headers=HEADERS)
data = r.json()
print(f"Total reasoning questions fetched: {len(data)}")

hindi_opts = []
for q in data:
    for f in ['option_a', 'option_b', 'option_c', 'option_d']:
        val = q[f]
        if val and re.search(r'[\u0900-\u097F]', val):
            hindi_opts.append((q['paper_id'], q['question_number'], q['id'], f, val))

print(f"Reasoning options with Hindi: {len(hindi_opts)}")
for h in hindi_opts[:20]:
    print(f"Paper {h[0]} Q.{h[1]} {h[3]}: {h[4]}")
