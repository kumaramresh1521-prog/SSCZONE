import fitz
import json
import sys

sys.stdout.reconfigure(encoding='utf-8')

with open('reasoning_analogy_155_verified.json', 'r', encoding='utf-8') as f:
    qs = json.load(f)

q_map = {q['question_number']: q for q in qs}

for num in range(89, 109):
    q = q_map[num]
    print(f"Q{num}: {q['question_text']}")
    print(f"  A: {q['option_a']} | B: {q['option_b']} | C: {q['option_c']} | D: {q['option_d']}")
    print(f"  Ans: {q['correct_answer']}")
