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

# Fetch reasoning questions with letters or symbols in options where Hindi exists
url = f"{SUPABASE_URL}/rest/v1/paper_questions?question_number=lte.25&select=id,paper_id,question_number,question_text,option_a,option_b,option_c,option_d&order=id.asc&limit=1000"
r = requests.get(url, headers=HEADERS)
data = r.json()

suspicious = []
for q in data:
    for f in ['option_a', 'option_b', 'option_c', 'option_d']:
        val = q[f]
        if not val:
            continue
        # If it has Hindi, check if English side looks like a letter cluster/code
        if ' / ' in val and re.search(r'[\u0900-\u097F]', val):
            en_side = val.split(' / ')[0].strip()
            # If en_side is short uppercase letters or code like "BD", "LOM", "MoNdAy", "TiIoGt", "A-B-C", "23"
            if re.match(r'^[A-Za-z0-9\s,:\-_+*]+$', en_side):
                # Is it an acronym or letter cluster or code?
                words = en_side.split()
                if any(w.isupper() and len(w) > 1 and not w in ['A', 'THE', 'AND', 'OR', 'NOT', 'BOTH', 'NEITHER'] for w in words):
                    suspicious.append((q['paper_id'], q['question_number'], q['id'], f, val))
                elif any(re.match(r'^[A-Z][a-z]+[A-Z]', w) for w in words): # like MoNdAy, TiIoGt
                    suspicious.append((q['paper_id'], q['question_number'], q['id'], f, val))

print(f"Suspicious letter-cluster/code options with Hindi: {len(suspicious)}")
for s in suspicious[:20]:
    print(f"Paper {s[0]} Q.{s[1]} {s[3]}: {s[4]}")
