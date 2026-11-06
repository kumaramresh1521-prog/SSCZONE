import glob
import json
import os
import re
import sys

sys.stdout.reconfigure(encoding='utf-8')

def clean_footers(text: str) -> str:
    if not text:
        return ''
    # Remove footer like '6 (BASIC ARITHMETIC SKILL)' or '8 (BASIC KNOWLEDGE)'
    text = re.sub(r'\s*\d+\s*\((?:BASIC ARITHMETIC SKILL|BASIC KNOWLEDGE)\)\s*', ' ', text)
    # Remove stray section header QUANTITATIVE APTITUDE
    text = re.sub(r'\s*QUANTITATIVE APTITUDE\s*', ' ', text)
    # Remove stray (E) Not Answered
    text = re.sub(r'\s*\(E\)\s*Not Answered\s*', ' ', text)
    # Special Q.86 page 10 number in 30 Sept Shift 3
    text = re.sub(r'parties\s+10\s*\n+\s*\(Q\)', 'parties\n\n(Q)', text)
    # Clean whitespace
    text = re.sub(r'[ \t]+', ' ', text)
    return text.strip()

backup_dir = r"c:\ssczone\src\data\pyq_backup"
files = sorted(glob.glob(os.path.join(backup_dir, "*2026*.json")))

cleaned_count = 0
for fpath in files:
    fname = os.path.basename(fpath)
    with open(fpath, "r", encoding="utf-8") as f:
        data = json.load(f)
    for q in data:
        qn = q["question_number"]
        for k in ["question_text", "option_a", "option_b", "option_c", "option_d"]:
            v = q.get(k, "")
            cv = clean_footers(v)
            if cv != v:
                cleaned_count += 1
                print(f"{fname} Q.{qn} {k}:")
                print("  OLD:", repr(v))
                print("  NEW:", repr(cv))

print("Total footer cleans:", cleaned_count)
