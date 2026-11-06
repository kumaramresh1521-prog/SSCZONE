import os
import sys
import re
import requests

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
HEADERS = {
    'apikey': SUPABASE_KEY,
    'Authorization': f'Bearer {SUPABASE_KEY}',
    'Content-Type': 'application/json'
}

# Fetch all questions across all 32 papers
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

print(f"Total questions fetched: {len(all_qs)}")

# Check for image references in question_text and options
missing_images = []
broken_img_syntax = []
reasoning_garbled = []

for q in all_qs:
    texts = [
        ("q", q['question_text']),
        ("a", q['option_a']),
        ("b", q['option_b']),
        ("c", q['option_c']),
        ("d", q['option_d']),
    ]
    for field, t in texts:
        if not t:
            continue
        
        # Check if contains /images/
        # Check if markdown image tag is broken
        # E.g. ! [ or ![] with devanagari in url
        if '![' in t or '/images/' in t:
            # find all image paths
            matches = re.findall(r'!\[.*?\]\((.*?)\)', t)
            # also find any loose /images/
            loose = re.findall(r'/images/[^\s\)\"\'>]+', t)
            all_found = set(matches + loose)
            for path in all_found:
                clean_path = path.strip()
                # Local check
                local_file = os.path.join(r"c:\ssczone\public", clean_path.lstrip("/\\").replace("/", os.sep))
                if not os.path.exists(local_file):
                    missing_images.append((q['paper_id'], q['question_number'], q['id'], field, clean_path))

            # Check if there's Devanagari inside an image URL or markdown
            if re.search(r'/images/[^\)]*[\u0900-\u097F]', t):
                broken_img_syntax.append((q['paper_id'], q['question_number'], q['id'], field, t))

print(f"Total missing image references: {len(missing_images)}")
if missing_images:
    print("Sample missing images (up to 20):")
    for m in missing_images[:20]:
        print(f"  Paper {m[0]} Q.{m[1]} (ID {m[2]}) field '{m[3]}': {m[4]}")

print(f"\nTotal broken image syntax with Hindi in URL: {len(broken_img_syntax)}")
if broken_img_syntax:
    print("Sample broken image syntax (up to 10):")
    for b in broken_img_syntax[:10]:
        print(f"  Paper {b[0]} Q.{b[1]} (ID {b[2]}) field '{b[3]}': {b[4][:100]}")
