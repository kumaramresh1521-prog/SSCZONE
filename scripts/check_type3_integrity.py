import json

with open('kiran_type3_257_verified.json', 'r', encoding='utf-8') as f:
    data = json.load(f)

print(f"Total questions: {len(data)}")

issues = []
for i, q in enumerate(data):
    qn = q.get('question_number', i+1)
    qt = q.get('question_text', '').strip()
    oa = q.get('option_a', '').strip()
    ob = q.get('option_b', '').strip()
    oc = q.get('option_c', '').strip()
    od = q.get('option_d', '').strip()
    ans = q.get('correct_option', '').strip().upper()
    exp = q.get('explanation', '').strip()
    
    if len(qt) < 10:
        issues.append(f"Q{qn}: short/empty prompt ({len(qt)} chars)")
    if not (oa and ob and oc and od):
        issues.append(f"Q{qn}: missing option(s)")
    if ans not in ['A', 'B', 'C', 'D']:
        issues.append(f"Q{qn}: invalid answer '{ans}'")
    if len(exp) < 15:
        issues.append(f"Q{qn}: short/empty explanation ({len(exp)} chars)")

print(f"Found {len(issues)} issues:")
for issue in issues:
    print(" -", issue)
