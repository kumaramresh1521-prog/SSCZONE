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
    
    # Check if a punctuation boundary exists right before first_hi
    # e.g., 'consonant? "SIGNATURE" में...' -> English ends at 'consonant?'
    # e.g., 'formed? GARDEN शब्द...' -> English ends at 'formed?'
    m = re.search(r'(\?|\.\s|\.\n|:\s)\s*(["\w\s\d\+\-\=]{1,40})$', prefix)
    if m:
        punct_pos = m.start(1) + len(m.group(1))
        en_part = text[:punct_pos].strip()
        hi_part = text[punct_pos:].strip()
        return en_part, hi_part, True

    en_part = text[:first_hi].strip()
    hi_part = text[first_hi:].strip()
    return en_part, hi_part, True

def split_option_text(text):
    if not text:
        return "", "", False
    if not devanagari.search(text):
        return text.strip(), "", False
        
    if " / " in text:
        parts = text.split(" / ")
        if len(parts) >= 2:
            en = parts[0].strip()
            hi = " / ".join(parts[1:]).strip()
            if devanagari.search(hi):
                return en, hi, True
                
    first_hi = devanagari.search(text).start()
    en_part = text[:first_hi].strip()
    hi_part = text[first_hi:].strip()
    return en_part, hi_part, True

for pid in [6, 7, 19]:
    r = requests.get(f'{SUPABASE_URL}/rest/v1/paper_questions?paper_id=eq.{pid}&order=question_number.asc', headers=HEADERS)
    qs = r.json()
    print(f"\n================ Paper {pid} ================")
    problem_count = 0
    for q in qs:
        en, hi, is_bi = split_question_text(q['question_text'])
        if is_bi:
            # check if EN still contains devanagari or if HI is empty or if EN is suspiciously short (< 10 chars when total > 40)
            if devanagari.search(en) or len(hi) == 0 or (len(en) < 15 and len(q['question_text']) > 40):
                print(f"SUSPICIOUS Q.{q['question_number']}:")
                print(f"  RAW: {q['question_text'][:80]}")
                print(f"  EN:  {en}")
                print(f"  HI:  {hi[:50]}")
                problem_count += 1
    print(f"Paper {pid} Done. Suspicious/Problem splits: {problem_count} / {len(qs)}")
