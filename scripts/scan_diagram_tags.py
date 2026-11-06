import glob
import json
import os
import sys

sys.stdout.reconfigure(encoding='utf-8')

backup_dir = r'c:\ssczone\src\data\pyq_backup'
files = sorted(glob.glob(os.path.join(backup_dir, 'ssc-cgl-2026-*.json')))

diagram_tag_found = []

for fpath in files:
    fname = os.path.basename(fpath)
    with open(fpath, 'r', encoding='utf-8') as f:
        data = json.load(f)
    for q in data:
        qn = q['question_number']
        qt = q['question_text']
        if 'DIAGRAM' in qt or 'GEOMETRIC' in qt:
            diagram_tag_found.append((fname, qn, qt))
        for opt in ['option_a', 'option_b', 'option_c', 'option_d']:
            if 'DIAGRAM' in q[opt] or 'GEOMETRIC' in q[opt]:
                diagram_tag_found.append((fname, qn, f"{opt}: {q[opt]}"))

print(f"Total occurrences of DIAGRAM/GEOMETRIC tags: {len(diagram_tag_found)}")
for item in diagram_tag_found:
    print(f"  {item[0]} Q.{item[1]}: {item[2][:80]}")
