import json
import re

with open('reasoning_analogy_155_verified.json', 'r', encoding='utf-8') as f:
    questions = json.load(f)

print(f"Loaded {len(questions)} questions.")

leaks = []
for q in questions:
    num = q['question_number']
    
    # Check question text
    q_txt = q['question_text']
    if re.search(r'\[|\b20\d\d\b|\bMAT\b|\bSSC\b|\bCGL\b|\bCPO\b|\bCLAT\b|\bIIFT\b', q_txt):
        leaks.append((num, 'question_text', q_txt))
        
    for opt in ['a', 'b', 'c', 'd']:
        val = q[f'option_{opt}']
        if re.search(r'\d{4}\]|\[|\]|\bquestions?\b|\bselect\b|\bdirections?\b|\banalogy\b|\bverbal\b|\brelationship\b|\balternatives\b', val, re.I):
            leaks.append((num, f'option_{opt}', val))

print(f"Total leaks found: {len(leaks)}")
for item in leaks:
    print(f"Q{item[0]} [{item[1]}]: {item[2]}")
