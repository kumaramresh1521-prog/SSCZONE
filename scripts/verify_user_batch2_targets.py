import json

with open('kiran_type2_307_verified.json', 'r', encoding='utf-8') as f:
    data = json.load(f)

by_num = {q['question_number']: q for q in data}

target_qns = [33, 34, 35, 36, 37, 38, 41, 51, 181, 186, 201, 221, 222, 230, 284]

for qn in target_qns:
    if qn not in by_num:
        print(f"Question {qn} NOT FOUND in json!")
        continue
    q = by_num[qn]
    print(f"=== Question {qn} ===")
    print("Prompt:", q.get('question_text', '').strip())
    print(f"Options: (A) {q.get('option_a')} | (B) {q.get('option_b')} | (C) {q.get('option_c')} | (D) {q.get('option_d')}")
    print("Answer:", q.get('correct_option'))
    print("Exam:", q.get('exam_tag', ''))
    print("Explanation:\n", q.get('explanation', '').strip())
    print("-" * 60)
