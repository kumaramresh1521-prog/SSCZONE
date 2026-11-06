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

devanagari = re.compile(r'[\u0900-\u097F]')

def split_question_text(text):
    if not text:
        return "", "", False
    if not devanagari.search(text):
        return text.strip(), "", False

    first_hi = devanagari.search(text).start()
    prefix = text[:first_hi]
    
    m = re.search(r'(\?|\.\s|\.\n|:\s)\s*(["\w\s\d\+\-\=]{1,40})$', prefix)
    if m:
        punct_pos = m.start(1) + len(m.group(1))
        en_part = text[:punct_pos].strip()
        hi_part = text[punct_pos:].strip()
        return en_part, hi_part, True

    en_part = text[:first_hi].strip()
    hi_part = text[first_hi:].strip()
    return en_part, hi_part, True

r = requests.get(f'{SUPABASE_URL}/rest/v1/paper_questions?paper_id=eq.27&order=question_number.asc', headers=HEADERS)
qs = r.json()

print(f"Paper 27 (1 Oct 2026 Shift 1): Total {len(qs)} questions")
for q in qs[:10]:
    en, hi, is_bi = split_question_text(q['question_text'])
    print(f"\n[Q.{q['question_number']}] (is_bi={is_bi})")
    print(f"  EN: {en}")
    print(f"  HI: {hi}")
    print(f"  OptA: {q['option_a']}")
