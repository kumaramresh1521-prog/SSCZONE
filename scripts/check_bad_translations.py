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

# Fetch all questions in 2026 papers (paper_id between 25 and 53) and 2025 (6, 7, 19)
paper_ids = list(range(25, 54)) + [6, 7, 19]

bad_options = []

for pid in paper_ids:
    url = f"{SUPABASE_URL}/rest/v1/paper_questions?paper_id=eq.{pid}&order=question_number.asc"
    r = requests.get(url, headers=HEADERS)
    qs = r.json()
    for q in qs:
        # Check if question is English comprehension (76-100) and has Hindi
        if q['question_number'] > 75:
            for f in ['question_text', 'option_a', 'option_b', 'option_c', 'option_d']:
                val = q[f]
                if val and re.search(r'[\u0900-\u097F]', val):
                    bad_options.append((pid, q['question_number'], q['id'], f, "English section has Hindi", val))
        
        # Check if reasoning question (1-25) has letter series/code translated to Hindi
        if q['question_number'] <= 25:
            for f in ['option_a', 'option_b', 'option_c', 'option_d']:
                val = q[f]
                if val and ' / ' in val and re.search(r'[\u0900-\u097F]', val):
                    en_part = val.split(' / ')[0].strip()
                    # If en_part is pure letter code, mixed case like MoNdAy, or letters like BSIhHU
                    if re.match(r'^[A-Za-z]{2,8}$', en_part) and not en_part.lower() in ['both', 'neither', 'only', 'all', 'none', 'east', 'west', 'north', 'south', 'left', 'right', 'male', 'female', 'brother', 'sister', 'father', 'mother', 'uncle', 'aunt', 'son', 'daughter', 'nephew', 'niece', 'cousin', 'circle', 'square', 'red', 'blue', 'green', 'yellow', 'black', 'white']:
                        bad_options.append((pid, q['question_number'], q['id'], f, "Reasoning code translated", val))

print(f"Total bad options found: {len(bad_options)}")
for b in bad_options[:30]:
    print(f"Paper {b[0]} Q.{b[1]} (ID {b[2]}) {b[3]} [{b[4]}]: {b[5]}")
