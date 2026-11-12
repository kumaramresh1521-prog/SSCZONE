import json
import re

with open('kiran_type1_284_verified.json', 'r', encoding='utf-8') as f:
    questions = json.load(f)

# Fix Q189
for q in questions:
    if q['question_number'] == 189:
        q['correct_answer'] = 'B'
        q['explanation'] = "The first makes the second. Goldsmith makes jewellery of gold. Similarly, Cobbler makes shoes with leather."
    if q['question_number'] == 169:
        q['correct_answer'] = 'A'
        q['explanation'] = "The first serves the second. Advocate pleads in the court for his/her client. Similarly, Doctor treats patient."

with open('kiran_type1_284_verified.json', 'w', encoding='utf-8') as f:
    json.dump(questions, f, ensure_ascii=False, indent=2)

print("Updated Q189 and Q169.")
