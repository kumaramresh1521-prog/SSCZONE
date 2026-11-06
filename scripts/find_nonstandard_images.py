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

all_qs = []
limit = 1000
offset = 0
while True:
    url = f"{SUPABASE_URL}/rest/v1/paper_questions?select=id,paper_id,question_number,question_text,option_a,option_b,option_c,option_d&order=id.asc&limit={limit}&offset={offset}"
    r = requests.get(url, headers=HEADERS)
    data = r.json()
    if not data:
        break
    all_qs.extend(data)
    offset += limit
    if len(data) < limit:
        break

patterns = [
    ('markdown', re.compile(r'!\[.*?\]\((.*?)\)')),
    ('loose_img', re.compile(r'/images/[^\s\)\"\'>]+')),
    ('image_word', re.compile(r'\[Image:.*?\]')),
]

all_images = []
for q in all_qs:
    for f in ['question_text', 'option_a', 'option_b', 'option_c', 'option_d']:
        val = q[f]
        if not val:
            continue
        if '![' in val or '/images/' in val or '[Image:' in val:
            all_images.append((q['paper_id'], q['question_number'], q['id'], f, val))

print(f"Total question fields containing image references: {len(all_images)}")
# Check for any unexpected patterns
for p, qnum, qid, field, val in all_images:
    # Does MathText properly handle this?
    # Test if ![] matches
    m = re.findall(r'!\[(.*?)\]\(([^\s)]+)\)', val)
    if not m and '/images/' in val:
        print(f"NON-STANDARD IMAGE SYNTAX: Paper {p} Q.{qnum} (ID {qid}) in {field}:")
        print(f"  Value: {val}")
