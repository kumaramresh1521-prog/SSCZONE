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

def smart_split(text):
    if not text:
        return "", "", False
    devanagari = re.search(r'[\u0900-\u097F]', text)
    if not devanagari:
        return text.strip(), "", False
        
    first_hi = devanagari.start()
    prefix = text[:first_hi]
    
    # Never split on colon ':' - colons introduce statements, ratios, or code words!
    # Valid English sentence endings right before Hindi starts:
    # 1. Question mark: e.g. "What is X? निम्नलिखित..." or "What is X? 'CODE' ..."
    # 2. Period followed by space/newline: e.g. "Find X. दिए गए..."
    # 3. If there is a trailing quote or token right before Hindi (e.g. '? "SIGNATURE" ...' or '? [Image: ...] ...')
    
    # Check for sentence ending punctuation in prefix:
    # Look for last '?' or last '.' that is followed by space/newline or end of prefix
    m = re.search(r'(\?|\.\s|\.\n)\s*(["\w\s\d\+\-\=\/\^\{\}\(\)\[\]]{0,60})$', prefix)
    if m:
        # Check that this isn't just an abbreviation like "i.e." or "e.g." or decimal number "2.5"
        punct_pos = m.start() + len(m.group(1))
        # Ensure we don't cut in the middle of decimal like 3.5 cm
        if not (m.group(1).startswith('.') and m.start() > 0 and prefix[m.start()-1].isdigit()):
            en = text[:punct_pos].strip()
            hi = text[punct_pos:].strip()
            return en, hi, True
            
    en = text[:first_hi].strip()
    hi = text[first_hi:].strip()
    return en, hi, True

# Audit all papers for split quality
r = requests.get(f'{SUPABASE_URL}/rest/v1/previous_papers?order=id.asc', headers=HEADERS)
papers = r.json()

issues = []
for p in papers:
    pid = p['id']
    qr = requests.get(f'{SUPABASE_URL}/rest/v1/paper_questions?paper_id=eq.{pid}', headers=HEADERS)
    for q in qr.json():
        raw = q['question_text'] or ""
        en, hi, is_bi = smart_split(raw)
        if is_bi:
            # Check if en ends with colon or is suspiciously short
            if en.endswith(':') or len(en) < 15:
                issues.append((pid, q['question_number'], en, hi[:40], raw[:60]))

print(f"Total split issues found across all papers: {len(issues)}")
for iss in issues[:20]:
    print(f"Paper {iss[0]} Q.{iss[1]}:")
    print(f"  EN: '{iss[2]}'")
    print(f"  HI: '{iss[3]}'")
    print(f"  RAW: '{iss[4]}'")
