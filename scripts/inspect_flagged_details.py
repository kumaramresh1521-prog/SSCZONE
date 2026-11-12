import json

with open('kiran_type2_307_verified.json', 'r', encoding='utf-8') as f:
    data = json.load(f)

by_num = {q['question_number']: q for q in data}

flagged_list = [40, 54, 82, 95, 105, 107, 122, 124, 150, 156, 171, 174, 198, 210, 211, 214, 217, 220, 224, 226, 238, 248, 252, 253, 277, 280, 282, 283, 295]

for qn in flagged_list:
    q = by_num[qn]
    print(f"=== Question {qn} ===")
    print("Prompt:", q['question_text'])
    print(f"Options: (A) {q['option_a']} | (B) {q['option_b']} | (C) {q['option_c']} | (D) {q['option_d']}")
    print(f"Answer: ({q['correct_option']})")
    print("Exam:", q.get('exam_tag', ''))
    print("Explanation:\n", q['explanation'])
    print("-" * 70)
