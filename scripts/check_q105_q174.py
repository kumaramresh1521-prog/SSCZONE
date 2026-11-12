import json

with open('kiran_type2_307_verified.json', 'r', encoding='utf-8') as f:
    data = json.load(f)

by_num = {q['question_number']: q for q in data}

for qn in [105, 174, 198, 217]:
    q = by_num[qn]
    print(f"=== Q{qn} in kiran_type2_307_verified.json ===")
    print("Prompt:", q['question_text'])
    print(f"Options: A: {q['option_a']} | B: {q['option_b']} | C: {q['option_c']} | D: {q['option_d']}")
    print("Answer:", q['correct_option'])
    print("Explanation:\n", q['explanation'])
    print()
