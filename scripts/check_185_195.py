import json

with open('kiran_type1_284_verified.json', 'r', encoding='utf-8') as f:
    questions = json.load(f)

for q in questions[184:195]:
    print(f"=== Q{q['question_number']} ===")
    print(f"Q: {q['question_text']}")
    print(f"Opts: A: {q['option_a']} | B: {q['option_b']} | C: {q['option_c']} | D: {q['option_d']}")
    print(f"Ans: {q['correct_answer']}")
    print(f"Exp: {q['explanation']}\n")
