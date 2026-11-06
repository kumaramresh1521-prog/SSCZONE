import requests
import json
import os
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
HEADERS = {
    'apikey': SUPABASE_KEY,
    'Authorization': f'Bearer {SUPABASE_KEY}',
    'Content-Type': 'application/json'
}

# Fetch all papers
r = requests.get(f"{SUPABASE_URL}/rest/v1/previous_papers?select=id,title,year,shift,allow_translation&order=id.asc", headers=HEADERS)
papers = r.json()
print(f"Total previous papers in DB: {len(papers)}")

for p in papers:
    # Count how many questions have Hindi in question_text
    r_q = requests.get(f"{SUPABASE_URL}/rest/v1/paper_questions?paper_id=eq.{p['id']}&select=id,question_text&limit=100", headers=HEADERS)
    qs = r_q.json()
    hi_count = sum(1 for q in qs if any('\u0900' <= ch <= '\u097f' for ch in (q.get('question_text') or '')))
    print(f"Paper ID {p['id']}: {p['title']} ({p.get('year')}) | Total Qs: {len(qs)} | Qs with Hindi: {hi_count}")
