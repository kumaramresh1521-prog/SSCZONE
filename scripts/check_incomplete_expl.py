import json

with open('type4_explanations_parsed.json', 'r', encoding='utf-8') as f:
    explanations = json.load(f)

with open('kiran_type4_254_verified.json', 'r', encoding='utf-8') as f:
    questions = json.load(f)

incomplete_qns = []
for q in questions:
    qn = q['q_num']
    opts = q['options']
    if any(not o or len(o.strip()) == 0 for o in opts):
        incomplete_qns.append(qn)

has_expl = []
no_expl = []
for qn in incomplete_qns:
    if str(qn) in explanations:
        has_expl.append((qn, explanations[str(qn)]))
    else:
        no_expl.append(qn)

print(f"Total incomplete: {len(incomplete_qns)}")
print(f"Has book explanation: {len(has_expl)}")
print(f"Missing book explanation: {len(no_expl)}")
print("\nFirst 10 explanations of incomplete questions:")
for qn, exp in has_expl[:10]:
    print(f"Q{qn} (Ans: {exp.get('ans')}): {exp.get('text')}")
