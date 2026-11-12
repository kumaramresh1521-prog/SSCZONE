import json
import sys

sys.stdout.reconfigure(encoding='utf-8')

with open('reasoning_analogy_155_verified.json', 'r', encoding='utf-8') as f:
    qs = json.load(f)

targets = [13, 23, 26, 30, 38, 40, 41, 42, 44, 45, 54, 58, 62, 63, 64, 69, 71, 75, 76, 77, 79, 82, 83, 84, 85, 86, 104, 109, 111, 112, 113, 114, 115, 119, 120, 122, 127, 130, 131, 132, 138, 141, 147]

for q in qs:
    if q['question_number'] in targets:
        print(f"=== Q{q['question_number']} ===")
        print(f"Q: {q['question_text']}")
        print(f"A: {q['option_a']} | B: {q['option_b']} | C: {q['option_c']} | D: {q['option_d']}")
        print(f"Ans: {q['correct_answer']}")
        print(f"Expl: {q['explanation'][:100]}...")

