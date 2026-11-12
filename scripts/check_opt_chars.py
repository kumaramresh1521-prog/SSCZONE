import json
import re

with open('kiran_type2_307_verified.json', 'r', encoding='utf-8') as f:
    data = json.load(f)

for q in data:
    qn = q['question_number']
    for opt in ['option_a', 'option_b', 'option_c', 'option_d']:
        v = str(q.get(opt, '')).strip()
        if re.search(r'[^\w\s\:\,\.\-\(\)\/\+]', v):
            print(f"Q{qn} {opt}: '{v}' has special char")
        if v.startswith('.') or v.startswith(','):
            print(f"Q{qn} {opt}: '{v}' starts with dot/comma")
