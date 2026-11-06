import glob
import json
import os
import re
import sys

sys.stdout.reconfigure(encoding='utf-8')

backup_dir = r"c:\ssczone\src\data\pyq_backup"
files = sorted(glob.glob(os.path.join(backup_dir, "*.json")))

print(f"Auditing algebra & text formatting in {len(files)} files...")

flagged = []

for fpath in files:
    base = os.path.basename(fpath).replace(".json", "")
    with open(fpath, "r", encoding="utf-8") as f:
        data = json.load(f)
        
    for q in data:
        qn = q['question_number']
        qt = q['question_text']
        opts = [q['option_a'], q['option_b'], q['option_c'], q['option_d']]
        
        # 1. Truncated "If \n, then find" or "If , then find"
        if re.search(r"If\s*,\s*then\s*find", qt, re.IGNORECASE) or re.search(r"If\s*\n\s*,\s*then\s*find", qt, re.IGNORECASE):
            flagged.append((base, qn, "Missing equation in 'If , then find'", qt))
            
        # 2. Options that end in lonely ":" or lonely "=" or lonely "/"
        for label, opt in zip(["A", "B", "C", "D"], opts):
            if re.search(r"[:=/+−\-]\s*$", opt.strip()):
                flagged.append((base, qn, f"Option {label} ends in trailing operator: '{opt}'", qt[:60]))
                
        # 3. Fraction with 3 space-separated numbers like "5 13 13" or "1 4 2"
        for label, opt in zip(["A", "B", "C", "D"], opts):
            if re.search(r"^\d+\s+\d+\s+\d+$", opt.strip()):
                flagged.append((base, qn, f"Option {label} looks like mangled fraction: '{opt}'", qt[:60]))
                
        # 4. Stray symbols like 'ÔêÜ', '¤Ç', etc.
        for text_item in [qt] + opts:
            if any(c in text_item for c in ['Ô', '¤', '­', 'Ø']):
                flagged.append((base, qn, f"Mojibake characters found in '{text_item[:30]}'", qt[:60]))
                break

print(f"\nTotal algebraic / formatting items flagged: {len(flagged)}")
for base, qn, reason, snippet in flagged:
    print(f"  {base} Q.{qn}: {reason}")
