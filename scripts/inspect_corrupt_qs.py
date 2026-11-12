import json
import sys

sys.stdout.reconfigure(encoding='utf-8')

with open('reasoning_analogy_155_verified.json', 'r', encoding='utf-8') as f:
    questions = json.load(f)

q_by_num = {q['question_number']: q for q in questions}

target_nums = [34, 41, 43, 45, 46, 52, 54, 60, 71, 82, 84, 88, 94, 104, 125, 137, 138, 141, 147]

for num in target_nums:
    q = q_by_num[num]
    print(f"==================== Q{num} ====================")
    print("Question:", q['question_text'])
    print(f"A: {q['option_a']} | B: {q['option_b']} | C: {q['option_c']} | D: {q['option_d']}")
    print("Answer:", q['correct_answer'])
    print("Explanation:", q['explanation'])
    print()
