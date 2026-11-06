import json
import glob
import os
import re
import sys

sys.stdout.reconfigure(encoding='utf-8')

backup_dir = r"c:\ssczone\src\data\pyq_backup"
files = sorted(glob.glob(os.path.join(backup_dir, "*2026*.json")))

matches = []
for fpath in files:
    fname = os.path.basename(fpath)
    with open(fpath, "r", encoding="utf-8") as f:
        questions = json.load(f)
    for q in questions:
        qn = q["question_number"]
        comb = f"{q.get('question_text','')} {q.get('option_a','')} {q.get('option_b','')} {q.get('option_c','')} {q.get('option_d','')}"
        m = re.findall(r'[A-Z0-9_]{5,}(?:DIAGRAM|GEOMETRIC|IMAGE|FIGURE|PICTURE|GRAPH|CHART)[A-Z0-9_]*|\b(?:DIAGRAM|GEOMETRIC|PLACEHOLDER)\b', comb)
        if m:
            matches.append((fname, qn, m, q['question_text']))

print(f"Total questions with DIAGRAM/GEOMETRIC placeholders: {len(matches)}")
for item in matches:
    print(f"{item[0]} | Q.{item[1]} -> {item[2]}")
    print(f"   Text: {repr(item[3])}")
    print()
