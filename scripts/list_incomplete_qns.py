import json

with open('kiran_type4_254_verified.json', 'r', encoding='utf-8') as f:
    questions = json.load(f)

incomplete = []
for q in questions:
    qn = q['q_num']
    opts = q['options']
    empty_indices = [i for i, o in enumerate(opts) if not o or len(o.strip()) == 0]
    if empty_indices:
        incomplete.append((qn, empty_indices, opts, q['question_text']))

print(f"Total incomplete: {len(incomplete)}")
print("Missing question numbers:")
print([x[0] for x in incomplete])
