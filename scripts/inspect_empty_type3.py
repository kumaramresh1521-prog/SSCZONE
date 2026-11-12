import json

with open('kiran_type3_257_verified.json', 'r', encoding='utf-8') as f:
    data = json.load(f)

print(f"Total questions: {len(data)}")

empty_qs = [q for q in data if not q.get('question_text', '').strip()]
print(f"Empty question text count: {len(empty_qs)}")
for q in empty_qs:
    qn = q['question_number']
    opts = f"A: {q['option_a']} | B: {q['option_b']} | C: {q['option_c']} | D: {q['option_d']}"
    exp = q['explanation'].replace('\n', ' ')[:100]
    print(f"Q{qn}: ans={q['correct_option']} | {opts} | exp={exp}")
