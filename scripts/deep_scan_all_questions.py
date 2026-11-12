import json
import re

with open('reasoning_analogy_155_verified.json', 'r', encoding='utf-8') as f:
    questions = json.load(f)

print(f"Total questions: {len(questions)}")

# Let's inspect all options that contain more than 5 words or have punctuation like ']' or '[' or digits followed by ']'
suspicious = []
for q in questions:
    num = q['question_number']
    for opt_k in ['option_a', 'option_b', 'option_c', 'option_d']:
        opt_v = q[opt_k]
        # check for brackets
        if '[' in opt_v or ']' in opt_v:
            suspicious.append((num, opt_k, 'Bracket in option', opt_v))
        # check for directions keywords
        if any(w in opt_v.lower() for w in ['direction', 'following', 'mark', 'certain', 'alternatives', 'consist', 'choose']):
            suspicious.append((num, opt_k, 'Directions keyword in option', opt_v))
        # check for year
        if re.search(r'\b(19|20)\d\d\b', opt_v):
            suspicious.append((num, opt_k, 'Year in option', opt_v))
            
    # Check question text
    q_txt = q['question_text']
    if '[' in q_txt or ']' in q_txt:
        suspicious.append((num, 'question_text', 'Bracket in question text', q_txt))
    if re.search(r'\b(19|20)\d\d\b', q_txt) and num not in [94]:  # Q94 has 41537 / 421
        # Check if year is exam year
        if re.search(r'\b(19|20)\d\d\b', q_txt):
            suspicious.append((num, 'question_text', 'Year in question text', q_txt))

print(f"Found {len(suspicious)} suspicious items:")
for s in suspicious:
    print(f"Q{s[0]} [{s[1]}] -> {s[2]}: {s[3]}")
