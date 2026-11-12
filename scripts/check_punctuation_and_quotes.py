import json
import re
import sys

sys.stdout.reconfigure(encoding='utf-8')

with open('reasoning_analogy_155_verified.json', 'r', encoding='utf-8') as f:
    questions = json.load(f)

for q in questions:
    num = q['question_number']
    
    # Check colon spacing in question_text
    txt = q['question_text']
    # If it contains ":" but not " : ", report
    if re.search(r'[^\s]:[^\s]', txt) and not re.search(r'http|Q\.', txt):
        print(f"Q{num} colon spacing in txt: {txt}")
        
    # Check options colon spacing
    for opt_k in ['option_a', 'option_b', 'option_c', 'option_d']:
        opt_v = q[opt_k]
        if re.search(r'[a-zA-Z]:[a-zA-Z]', opt_v):
            print(f"Q{num} {opt_k} colon spacing: {opt_v}")
        # check unbalanced quotes
        if opt_v.count("'") % 2 != 0:
            print(f"Q{num} {opt_k} unbalanced single quote: {opt_v}")
        if opt_v.count('"') % 2 != 0:
            print(f"Q{num} {opt_k} unbalanced double quote: {opt_v}")
