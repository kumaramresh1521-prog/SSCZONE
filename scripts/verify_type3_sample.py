import json

with open('kiran_type3_257_verified.json', 'r', encoding='utf-8') as f:
    qs = json.load(f)

print(f"Total questions in JSON: {len(qs)}")

for q_idx in [0, 49, 99, 149, 199, 256]:
    q = qs[q_idx]
    num = q['question_number']
    ans = q['correct_option']
    txt = q['question_text'][:70]
    a = q['option_a']
    b = q['option_b']
    c = q['option_c']
    d = q['option_d']
    exam = q['exam_tag']
    expl = q['explanation'][:70].replace('\n', ' ')
    print(f"Q{num} ({ans}) | {txt} | A:{a} B:{b} C:{c} D:{d} | Exam:{exam} | Expl:{expl}")
