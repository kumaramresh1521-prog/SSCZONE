import glob
import json
import os
import re
import sys

sys.stdout.reconfigure(encoding='utf-8')

def clean_question_text(text: str) -> str:
    if not text:
        return ""
    
    # Remove DIAGRAM_OR_GEOMETRIC
    text = re.sub(r'\s*DIAGRAM_OR_GEOMETRIC\s*', ' ', text)
    
    # Remove stray section headers
    text = re.sub(r'\b(GENERAL AWARENESS|GENERAL INTELLIGENCE|QUANTITATIVE APTITUDE|ENGLISH LANGUAGE|GENERAL)\b', '', text)
    
    # Remove isolated option grids in question text: (A) (B) (C) (D) or (A) (B) \n (C) (D)
    text = re.sub(r'\(A\)\s*(?:\n*\s*\(B\))?\s*(?:\n*\s*\(C\))?\s*(?:\n*\s*\(D\))?', '', text)
    
    # Remove stray isolated digits at beginning, end, or alone on a line (page numbers)
    text = re.sub(r'^\s*\d+\s*\n+', '', text)
    text = re.sub(r'\n+\s*\d+\s*$', '', text)
    text = re.sub(r'\n+\s*\d+\s*\n+', '\n\n', text)
    text = re.sub(r'\s+\d+\s*$', '', text)
    
    # Clean multiple spaces and blank lines
    text = re.sub(r'[ \t]+', ' ', text)
    text = re.sub(r'\n\s*\n\s*\n+', '\n\n', text)
    return text.strip()

backup_dir = r"c:\ssczone\src\data\pyq_backup"
files = sorted(glob.glob(os.path.join(backup_dir, "*2026*.json")))

tested = 0
for fpath in files:
    fname = os.path.basename(fpath)
    with open(fpath, "r", encoding="utf-8") as f:
        data = json.load(f)
    for q in data:
        qt = q.get("question_text", "")
        if "DIAGRAM_OR_GEOMETRIC" in qt or re.search(r'\(A\)\s*(\(B\)|[A-D\d])', qt):
            cleaned = clean_question_text(qt)
            tested += 1
            print(f"[{fname} Q.{q['question_number']}]")
            print("  BEFORE:\n   ", repr(qt))
            print("  AFTER :\n   ", repr(cleaned))
            print("-" * 50)

print(f"Total processed: {tested}")
