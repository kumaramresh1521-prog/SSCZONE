import json
import glob
import os
import re
import sys

sys.stdout.reconfigure(encoding='utf-8')

backup_dir = r"c:\ssczone\src\data\pyq_backup"
files = glob.glob(os.path.join(backup_dir, "*2026*.json"))

comp_in_opt = []
comp_in_qt = []

for fpath in files:
    fname = os.path.basename(fpath)
    with open(fpath, "r", encoding="utf-8") as f:
        questions = json.load(f)
    
    for q in questions:
        qn = q["question_number"]
        qt = q.get("question_text", "")
        if re.search(r'Comprehension\s*\(\s*Q', qt, re.I):
            comp_in_qt.append((fname, qn))
            
        for opt_k in ['option_a', 'option_b', 'option_c', 'option_d']:
            val = q.get(opt_k, "")
            if re.search(r'Comprehension\s*\(\s*Q', val, re.I):
                comp_in_opt.append((fname, qn, opt_k, val[:120]))

print(f"Total Comprehension found in Question Text: {len(comp_in_qt)}")
print(f"Total Comprehension found in Options: {len(comp_in_opt)}")

for c in comp_in_opt:
    print(f"  {c[0]} | Q.{c[1]} {c[2]} -> {repr(c[3])}")
