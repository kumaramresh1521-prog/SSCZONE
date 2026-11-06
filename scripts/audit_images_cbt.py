import glob
import json
import os
import re
import sys

sys.stdout.reconfigure(encoding='utf-8')

all_images = {}
backup_dir = 'src/data/pyq_backup'
for f in glob.glob(f'{backup_dir}/*.json'):
    base = os.path.basename(f)
    data = json.load(open(f, encoding='utf-8'))
    for q in data:
        qn = q.get('question_number')
        for opt_k, text in [('Q', q.get('question_text','')), ('A', q.get('option_a','')), ('B', q.get('option_b','')), ('C', q.get('option_c','')), ('D', q.get('option_d',''))]:
            matches = re.findall(r'!\[.*?\]\((.*?)\)', str(text))
            for m in matches:
                all_images[m] = (base, qn, opt_k)
            src_matches = re.findall(r'src=["\'](.*?)["\']', str(text))
            for m in src_matches:
                all_images[m] = (base, qn, opt_k)

print(f"Total unique images referenced in PYQ backups: {len(all_images)}")

missing = []
found = []
external = []
for img, loc in all_images.items():
    if img.startswith('http://') or img.startswith('https://'):
        external.append((img, loc))
        continue
    clean = img.split('?')[0].lstrip('/')
    local_path = os.path.join('public', clean.replace('/', os.sep))
    if os.path.exists(local_path):
        found.append((img, loc, local_path))
    else:
        # Also check without 'public/' prefix if clean already has it
        if clean.startswith('public'):
            p2 = clean
        else:
            p2 = os.path.join('public', clean)
        if os.path.exists(p2):
            found.append((img, loc, p2))
        else:
            missing.append((img, loc, local_path))

print(f"Found on disk in public/: {len(found)}")
print(f"External URLs: {len(external)}")
print(f"Missing on disk in public/: {len(missing)}")

if missing:
    print(f"\nListing first 25 missing images:")
    for img, (b, qn, opt_k), loc in missing[:25]:
        print(f"  [{b} Q.{qn} {opt_k}] -> {img}")
