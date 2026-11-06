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

# Check several papers: e.g. Paper 6, 7, 19, 25, 26, 27, 28, 30
for pid in [6, 7, 25, 27, 28, 30]:
    r = requests.get(f'{SUPABASE_URL}/rest/v1/paper_questions?paper_id=eq.{pid}&question_number=gte.51&question_number=lte.75&order=question_number.asc', headers=HEADERS)
    qs = r.json()
    print(f"\n================ Paper {pid} (Math Q.51-Q.75: {len(qs)} Qs) ================")
    for q in qs:
        txt = q['question_text'] or ""
        # Check if text is very short, or has odd characters, or missing
        if len(txt.strip()) < 20:
            print(f"SHORT/SUSPICIOUS Q.{q['question_number']}: '{txt}'")
        # Check if contains HTML or LaTeX or images
        has_img = '![' in txt or '<img' in txt or '/images/' in txt
        has_latex = '$' in txt or '\\' in txt
        has_tags = '<' in txt and '>' in txt
        if has_tags:
            print(f"TAGS in Q.{q['question_number']}: '{txt[:100]}...'")
        if not txt.strip():
            print(f"EMPTY Q.{q['question_number']}!")
