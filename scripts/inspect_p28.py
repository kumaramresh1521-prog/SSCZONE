import json

with open(r'c:\ssczone\src\data\pyq_backup\ssc-cgl-2026-1-october-2026-shift-2.json', 'r', encoding='utf-8') as f:
    data = json.load(f)

if isinstance(data, list):
    questions = data
else:
    questions = data.get('questions', [])
print(f'Total questions in Paper 28: {len(questions)}')
for q in questions[:15]:
    num = q.get('question_number')
    txt = (q.get('question_text') or '')[:70]
    ans = q.get('correct_answer')
    a = (q.get('option_a') or '')[:25]
    b = (q.get('option_b') or '')[:25]
    c = (q.get('option_c') or '')[:25]
    d = (q.get('option_d') or '')[:25]
    print(f"Q{num:02d} [Ans:{ans}]: {txt}")
    print(f"     A: {a} | B: {b} | C: {c} | D: {d}")
