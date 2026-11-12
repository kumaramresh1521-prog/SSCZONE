import json

with open('kiran_type1_284_verified.json', 'r', encoding='utf-8') as f:
    qs = json.load(f)

for q in qs:
    if q['question_number'] in [35, 36, 37, 38]:
        print(f"Q{q['question_number']}: {q['question_text']}")
        print(f"Options: A) {q['option_a']} | B) {q['option_b']} | C) {q['option_c']} | D) {q['option_d']}")
        print(f"Ans: {q['correct_answer']}")
