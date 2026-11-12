import json

with open('kiran_type4_254_verified.json', 'r', encoding='utf-8') as f:
    questions = json.load(f)

print(f"Auditing {len(questions)} questions...")

issues = []
for q in questions:
    qn = q['q_num']
    txt = q['question_text']
    opts = q['options']
    ans = q['correct_option']
    exam = q['exam_tag']
    exp = q['explanation']
    
    reasons = []
    if len(txt) < 15: reasons.append("short prompt")
    if len(opts) != 4: reasons.append(f"opts count {len(opts)} != 4")
    elif any(not o or len(o.strip()) == 0 for o in opts):
        empty_indices = [i for i, o in enumerate(opts) if not o or len(o.strip()) == 0]
        reasons.append(f"empty opts at {empty_indices}")
    if ans not in ['A', 'B', 'C', 'D']: reasons.append(f"invalid ans {ans}")
    if len(exam) < 3: reasons.append("short exam")
    if len(exp) < 15: reasons.append("short exp")
    
    if reasons:
        issues.append((qn, reasons, txt, opts))

print(f"Total questions with issues: {len(issues)} / {len(questions)}")
if issues:
    print("\nFirst 10 questions with issues:")
    for qn, r, t, o in issues[:10]:
        print(f"Q{qn}: {r}")
        print(f"  Prompt: {t[:60]}")
        print(f"  Opts: {o}")
else:
    print("ALL 254 QUESTIONS PASSED INTEGRITY CHECKS WITH 100% SUCCESS!")
