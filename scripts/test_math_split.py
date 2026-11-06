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

devanagariRegex = re.compile(r'[\u0900-\u097F]')

def splitBilingualText(text):
    if not text:
        return "", "", False
    if not devanagariRegex.search(text):
        return text.strip(), "", False

    firstHi = devanagariRegex.search(text).start()
    prefix = text[:firstHi]

    m = re.search(r'(\?|\.\s|\.\n|:\s)\s*(["\w\s\d\+\-\=]{1,40})$', prefix)
    if m:
        punctPos = m.start(1) + len(m.group(1))
        en = text[:punctPos].strip()
        hi = text[punctPos:].strip()
        return en, hi, True

    en = text[:firstHi].strip()
    hi = text[firstHi:].strip()
    return en, hi, True

for pid in [6, 7]:
    r = requests.get(f'{SUPABASE_URL}/rest/v1/paper_questions?paper_id=eq.{pid}&question_number=gte.51&question_number=lte.75&order=question_number.asc', headers=HEADERS)
    qs = r.json()
    print(f"\n=== Paper {pid} Math Questions ===")
    for q in qs:
        en, hi, is_bi = splitBilingualText(q['question_text'])
        print(f"\n[Q.{q['question_number']}] (is_bi={is_bi})")
        print("  RAW: ", q['question_text'][:100], "...")
        print("  EN:  ", en)
        print("  HI:  ", hi[:80])
