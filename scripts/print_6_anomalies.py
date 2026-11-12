import json

qs = json.load(open('kiran_type3_257_verified.json', encoding='utf-8'))
for q in qs:
    opts = [q['option_a'], q['option_b'], q['option_c'], q['option_d']]
    if any(not o for o in opts) or any('(' in o and ')' not in o for o in opts) or any('(' in o and len(o)<5 for o in opts):
        num = q['question_number']
        print(f"Q{num}: {opts}")
