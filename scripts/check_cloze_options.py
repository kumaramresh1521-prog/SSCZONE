import json
import glob
import os
import re
import sys

sys.stdout.reconfigure(encoding='utf-8')

backup_dir = r"c:\ssczone\src\data\pyq_backup"
files = glob.glob(os.path.join(backup_dir, "*2026*.json"))

print("=== CHECKING Q.95 OPTIONS ACROSS ALL 29 PAPERS ===")
cloze_opt_issues = []
for fpath in files:
    fname = os.path.basename(fpath)
    with open(fpath, "r", encoding="utf-8") as f:
        questions = json.load(f)
    
    # Check if any question has options starting with "______" or "___"
    for q in questions:
        qn = q["question_number"]
        oa = q.get("option_a", "")
        if "______" in oa or "____" in oa:
            cloze_opt_issues.append((fname, qn, oa[:60]))

print(f"Total questions with cloze passage in options: {len(cloze_opt_issues)}")
for c in cloze_opt_issues:
    print(f"  {c[0]} | Q.{c[1]}: {repr(c[2])}")
