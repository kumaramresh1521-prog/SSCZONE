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

# Get list of exact filenames on disk
disk_files = {}
public_dir = r"c:\ssczone\public"
for root, dirs, files in os.walk(public_dir):
    for f in files:
        rel = os.path.relpath(os.path.join(root, f), public_dir).replace('\\', '/')
        disk_files[rel.lower()] = rel

print(f"Total disk files in public: {len(disk_files)}")

# Fetch all paper questions
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

print(f"Total questions: {len(all_qs)}")

case_mismatches = []
missing_completely = []
img_pattern = re.compile(r'/images/[^\s\)\"\']+')

for q in all_qs:
    for field in ['question_text', 'option_a', 'option_b', 'option_c', 'option_d']:
        val = q[field]
        if not val:
            continue
        found = img_pattern.findall(val)
        for p in found:
            clean = p.lstrip('/')
            clean_lower = clean.lower()
            if clean_lower not in disk_files:
                missing_completely.append((q['paper_id'], q['question_number'], q['id'], field, p))
            else:
                exact = disk_files[clean_lower]
                if exact != clean:
                    case_mismatches.append((q['paper_id'], q['question_number'], q['id'], field, p, exact))

print(f"Missing completely: {len(missing_completely)}")
for m in missing_completely[:10]:
    print("  Missing:", m)

print(f"Case mismatches: {len(case_mismatches)}")
for c in case_mismatches[:10]:
    print(f"  Mismatch in P{c[0]} Q.{c[1]} (ID {c[2]}) {c[3]}: '{c[4]}' vs exact disk '{c[5]}'")
