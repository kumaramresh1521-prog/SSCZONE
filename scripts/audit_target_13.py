import json
import re

qs = json.load(open('kiran_type2_307_verified.json', encoding='utf-8'))
targets = [10, 13, 21, 106, 188, 289, 140, 142, 176, 276, 288, 42, 196]

for t in targets:
    it = qs[t-1]
    print('='*70)
    print(f"QUESTION {t}:")
    print("Text:", it['question_text'])
    print(f"Options: (A) {it['option_a']} | (B) {it['option_b']} | (C) {it['option_c']} | (D) {it['option_d']}")
    print("Current Correct Answer:", it['correct_option'])
    print("Exam Tag:", it['exam_tag'])
    print("Current Explanation:\n", it['explanation'])
