import json

with open('type2_questions_raw.json', 'r', encoding='utf-8') as f:
    raw = json.load(f)

for q in raw:
    if q.get('question_number') == 34:
        print("Raw Q34:")
        print(json.dumps(q, indent=2, ensure_ascii=False))
