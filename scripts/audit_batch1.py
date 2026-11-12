import json
import sys

sys.stdout.reconfigure(encoding='utf-8')

with open('kiran_type1_284_verified.json', 'r', encoding='utf-8') as f:
    questions = json.load(f)

for i in range(0, 15):
    q = questions[i]
    print(f"=== Q{q['question_number']} ===")
    print(f"Q: {q['question_text']}")
    print(f"Options: A) {q['option_a']} | B) {q['option_b']} | C) {q['option_c']} | D) {q['option_d']}")
    print(f"Ans: {q['correct_answer']}")
    print(f"Tag: {q['exam_tag']}")
    print(f"Exp: {q['explanation']}\n")
