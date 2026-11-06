import json
import re
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

# Check paper 6, 15, 25, 27 math questions
for pid in [6, 15, 25, 27]:
    r = requests.get(f'{SUPABASE_URL}/rest/v1/paper_questions?paper_id=eq.{pid}&question_number=gte.51&question_number=lte.75&order=question_number.asc', headers=HEADERS)
    qs = r.json()
    print(f"\n=================== PAPER {pid} MATH (Q51-Q75) ===================")
    for q in qs:
        raw = q['question_text'] or ''
        hi_raw = q.get('question_text_hi') or ''
        
        # Test current frontend splitBilingualText logic from take-test/[paperId]/page.tsx:
        devanagariRegex = re.compile(r'[\u0900-\u097F]')
        if not devanagariRegex.search(raw):
            en = raw.strip()
            hi = ''
            isBi = False
        else:
            firstHi = devanagariRegex.search(raw).start()
            prefix = raw[:firstHi]
            m = re.search(r'(\?|\.\s|\.\n|:\s)\s*(["\w\s\d\+\-\=]{1,40})$', prefix)
            if m:
                punctPos = m.start() + len(m.group(1))
                en = raw[:punctPos].strip()
                hi = raw[punctPos:].strip()
                isBi = True
            else:
                en = raw[:firstHi].strip()
                hi = raw[firstHi:].strip()
                isBi = True
                
        # Flag if en or hi looks suspicious (e.g. en ends with ':' or 'Evaluate:' or has less than 15 chars while raw has 40+)
        if (en.endswith(':') and len(raw) > len(en) + 15) or len(en) < 20 or (isBi and not any(c.isdigit() for c in en) and any(c.isdigit() for c in raw)):
            print(f"SUSPICIOUS Q.{q['question_number']}:")
            print(f"  RAW: {raw}")
            print(f"  EN:  {en}")
            print(f"  HI:  {hi}")
            print("--------------------------------------------------")
