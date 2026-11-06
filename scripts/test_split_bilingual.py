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

r = requests.get(f'{SUPABASE_URL}/rest/v1/paper_questions?paper_id=eq.6&limit=15&order=question_number.asc', headers=HEADERS)
qs = r.json()

def splitBilingual(text):
    if not text:
        return '', '', False
    if not re.search(r'[\u0900-\u097F]', text):
        return text.strip(), '', False
    if ' / ' in text:
        parts = text.split(' / ')
        if len(parts) >= 2:
            en = parts[0].strip()
            hi = ' / '.join(parts[1:]).strip()
            if re.search(r'[\u0900-\u097F]', hi):
                return en, hi, True
    m = re.search(r'[\u0900-\u097F]', text)
    if m:
        idx = m.start()
        prefix = text[:idx]
        lastQ = prefix.rfind('?')
        lastDot = max(prefix.rfind('.\n'), prefix.rfind('. '))
        lastColon = max(prefix.rfind(':\n'), prefix.rfind(': '))
        splitIdx = idx
        if lastQ != -1 and lastQ > 5:
            splitIdx = lastQ + 1
        elif lastColon != -1 and lastColon > 5:
            splitIdx = lastColon + 1
        elif lastDot != -1 and lastDot > 5:
            splitIdx = lastDot + 1
        en = text[:splitIdx].strip()
        hi = text[splitIdx:].strip()
        return en, hi, True
    return text.strip(), text.strip(), False

for q in qs:
    en, hi, isBi = splitBilingual(q['question_text'])
    print(f"\nQ.{q['question_number']}:")
    print("  RAW:", q['question_text'])
    print("  -> EN:", en)
    print("  -> HI:", hi)
