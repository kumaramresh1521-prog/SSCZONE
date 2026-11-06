import json
import glob
import os
import re
import sys

sys.stdout.reconfigure(encoding='utf-8')

backup_dir = r"c:\ssczone\src\data\pyq_backup"
files = glob.glob(os.path.join(backup_dir, "*2026*.json"))

for fpath in files:
    fname = os.path.basename(fpath)
    with open(fpath, "r", encoding="utf-8") as f:
        questions = json.load(f)
        
    for q in questions:
        qn = q["question_number"]
        for opt_k in ['option_a', 'option_b', 'option_c', 'option_d']:
            val = q.get(opt_k, "")
            m = re.search(r'Comprehension\s*\(\s*Q\.?\s*(\d+)\s*[-–]\s*(\d+)\s*\)', val, re.I)
            if m:
                q_start = int(m.group(1))
                q_end = int(m.group(2))
                # Split where Comprehension starts (or section name before it)
                split_idx = val.find(m.group(0))
                # Check if there is "ENGLISH LANGUAGE" or similar just before it
                before = val[:split_idx].strip()
                sec_m = re.search(r'\b(ENGLISH\s+LANGUAGE|GENERAL\s+AWARENESS|QUANTITATIVE\s+APTITUDE|GENERAL\s+INTELLIGENCE)\s*$', before, re.I)
                if sec_m:
                    actual_opt = before[:sec_m.start()].strip()
                else:
                    actual_opt = before
                
                passage = val[split_idx:].strip()
                print(f"File: {fname} | Q.{qn} {opt_k}")
                print(f"  Target Questions: {q_start} to {q_end}")
                print(f"  Extracted Clean Option: {repr(actual_opt)}")
                print(f"  Passage Preview: {repr(passage[:120])}")
                print("-" * 60)
