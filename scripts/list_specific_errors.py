import glob
import json
import os
import re
import sys

sys.stdout.reconfigure(encoding='utf-8')

backup_dir = r'c:\ssczone\src\data\pyq_backup'
files = sorted(glob.glob(os.path.join(backup_dir, 'ssc-cgl-2026-*.json')))

all_broken_fractions = []
all_truncated_dashes = []
all_stray_headers = []

for fpath in files:
    fname = os.path.basename(fpath)
    with open(fpath, 'r', encoding='utf-8') as f:
        data = json.load(f)
    for q in data:
        qn = q['question_number']
        for opt in ['option_a', 'option_b', 'option_c', 'option_d']:
            v = q[opt].strip()
            # 1. Stray header
            for kw in ['GENERAL', 'QUANTITATIVE', 'BASIC ARITHMETIC', 'ENGLISH LANGUAGE', 'BASIC KNOWLEDGE']:
                if kw in v:
                    all_stray_headers.append((fname, qn, opt, v))
                    break
            # 2. Garbled fraction (e.g. 3 numbers with spaces)
            if re.search(r'^\d+\s+\d+\s+\d+$', v):
                all_broken_fractions.append((fname, qn, opt, v))
            # 3. Truncated dash (excluding rupee price like 400/-)
            elif v.endswith('-') and not v.endswith('/-'):
                all_truncated_dashes.append((fname, qn, opt, v))

print(f"1. Stray Headers: {len(all_stray_headers)}")
for h in all_stray_headers:
    print(f"   {h[0]} Q.{h[1]} [{h[2]}]: {h[3]}")

print(f"\n2. Truncated dashes: {len(all_truncated_dashes)}")
for d in all_truncated_dashes:
    print(f"   {d[0]} Q.{d[1]} [{d[2]}]: {d[3]}")

print(f"\n3. Garbled fractions: {len(all_broken_fractions)}")
for f in all_broken_fractions:
    print(f"   {f[0]} Q.{f[1]} [{f[2]}]: {f[3]}")
