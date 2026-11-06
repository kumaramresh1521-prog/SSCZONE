import glob
import json
import os
import re
import sys

sys.stdout.reconfigure(encoding='utf-8')

backup_dir = r'c:\ssczone\src\data\pyq_backup'
files = glob.glob(os.path.join(backup_dir, 'ssc-cgl-2026-*.json'))

stray_headers = []
image_only_counts = {}
truncated_dashes = []

for fpath in files:
    fname = os.path.basename(fpath)
    with open(fpath, 'r', encoding='utf-8') as f:
        data = json.load(f)

    for q in data:
        qn = q['question_number']
        qt = q['question_text'].strip()

        if re.fullmatch(r'!\[Figure\]\([^\)]+\)', qt):
            image_only_counts[fname] = image_only_counts.get(fname, 0) + 1

        for opt in ['option_a', 'option_b', 'option_c', 'option_d']:
            val = q[opt].strip()
            for kw in ['GENERAL', 'QUANTITATIVE', 'BASIC ARITHMETIC', 'ENGLISH LANGUAGE', 'BASIC KNOWLEDGE']:
                if kw in val:
                    stray_headers.append((fname, qn, opt, val))
            if val.endswith('-') and not val.endswith(' -'):
                truncated_dashes.append((fname, qn, opt, val))

print(f"Total papers with stray section headers in options: {len(stray_headers)}")
for h in stray_headers[:15]:
    print(f"  {h[0]} Q.{h[1]} [{h[2]}]: {h[3]}")

print(f"\nTotal image-only question_text count across all papers: {sum(image_only_counts.values())}")
print(f"Papers affected: {len(image_only_counts)} / 29")
