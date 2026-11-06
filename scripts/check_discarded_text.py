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

for pid in [6, 7, 19]:
    r = requests.get(f'{SUPABASE_URL}/rest/v1/paper_questions?paper_id=eq.{pid}&order=question_number.asc', headers=HEADERS)
    qs = r.json()
    print(f"\n================ Paper {pid} ({len(qs)} questions) ================")
    for q in qs:
        txt = q['question_text'] or ''
        m = re.search(r'[\u0900-\u097F]', txt)
        if m:
            idx = m.start()
            # If the hindi starts with dewanagari, what is right before it?
            prefix = txt[:idx].strip()
            suffix = txt[idx:].strip()
            # check if prefix looks like a complete question or where the real split should be
            # In official SSC papers, how does the transition from English to Hindi happen?
            # Let's check cases where prefix has colons or other punctuation
            last_10_prefix = prefix[-30:] if len(prefix) > 30 else prefix
            first_30_suffix = suffix[:40] if len(suffix) > 40 else suffix
            
            # Check old bad split
            lastQ = prefix.rfind('?')
            lastDot = max(prefix.rfind('.\n'), prefix.rfind('. '))
            lastColon = max(prefix.rfind(':\n'), prefix.rfind(': '))
            bad_split_idx = idx
            if lastQ != -1 and lastQ > 5:
                bad_split_idx = lastQ + 1
            elif lastColon != -1 and lastColon > 5:
                bad_split_idx = lastColon + 1
            elif lastDot != -1 and lastDot > 5:
                bad_split_idx = lastDot + 1
            
            discarded = txt[bad_split_idx:idx].strip()
            if len(discarded) > 10:
                print(f"Q.{q['question_number']} DISCARDED TEXT ({len(discarded)} chars): '{discarded}'")
                print(f"   Prefix end: ...{last_10_prefix}")
                print(f"   Hindi start: {first_30_suffix}...")
