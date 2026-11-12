import json

with open('kiran_type3_257_verified.json', 'r', encoding='utf-8') as f:
    data = json.load(f)

by_num = {q['question_number']: q for q in data}

for qn in [10, 24, 91, 98, 107]:
    q = by_num[qn]
    print(f"=== Q{qn} ===")
    print("Prompt:", q['question_text'])
    print(f"Options: A: {q['option_a']}, B: {q['option_b']}, C: {q['option_c']}, D: {q['option_d']}")
    print("Correct:", q['correct_option'])
    print("Exam:", q.get('exam_tag', ''))
    print("Explanation:\n", q['explanation'])
    print()
