import json

with open('kiran_type1_284_verified.json', 'r', encoding='utf-8') as f:
    questions = json.load(f)

for q in questions:
    if 'Advocate' in q['question_text'] or 'Lawyer' in q['question_text'] or 'Client' in q['question_text']:
        print(f"Q{q['question_number']}: {q['question_text']}")
        print(f"Ans: {q['correct_answer']} | Exp: {q['explanation']}\n")
