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
    
    # Check if questions 76-80 or 96-100 have any comprehension passage already
    found_in_paper = False
    for q in questions:
        for opt in ['option_a', 'option_b', 'option_c', 'option_d']:
            if 'Comprehension' in q.get(opt, ''):
                found_in_paper = True
                break
        if 'Comprehension' in q.get('question_text', ''):
            found_in_paper = True
            break
            
    if not found_in_paper:
        print(f"Paper without 'Comprehension' word: {fname}")
