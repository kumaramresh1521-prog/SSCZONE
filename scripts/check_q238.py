import json

with open('kiran_type2_307_verified.json', 'r', encoding='utf-8') as f:
    data = json.load(f)

by_num = {q['question_number']: q for q in data}

q = by_num[238]
print("Q238:")
print(json.dumps(q, indent=2, ensure_ascii=False))
