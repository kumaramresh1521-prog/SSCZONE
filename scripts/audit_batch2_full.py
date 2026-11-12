import json
import re

with open('kiran_type2_307_verified.json', 'r', encoding='utf-8') as f:
    data = json.load(f)

print(f"Total questions in Batch 2: {len(data)}")

issues = []

for q in data:
    qn = q['question_number']
    qt = q.get('question_text', '').strip()
    oa = q.get('option_a', '').strip()
    ob = q.get('option_b', '').strip()
    oc = q.get('option_c', '').strip()
    od = q.get('option_d', '').strip()
    ans = q.get('correct_option', '').strip()
    exp = q.get('explanation', '').strip()
    
    # 1. Prompt truncation check
    if not qt:
        issues.append((qn, "EMPTY_PROMPT", "Prompt is empty"))
    elif qt[0].islower() or qt.startswith('the two numbers') or qt.startswith('to the third') or qt.startswith('the following') or qt.startswith('as the second'):
        issues.append((qn, "TRUNCATED_PROMPT", f"Starts abruptly: '{qt[:40]}'"))
    
    # 2. Options check
    for opt_label, opt_val in [('A', oa), ('B', ob), ('C', oc), ('D', od)]:
        if not opt_val:
            issues.append((qn, "MISSING_OPTION", f"Option {opt_label} is empty"))
        if '（' in opt_val or '）' in opt_val:
            issues.append((qn, "CHINESE_PAREN_OPTION", f"Option {opt_label} has special paren: '{opt_val}'"))
        if opt_val.startswith(',') or opt_val.startswith('.'):
            issues.append((qn, "STRAY_PUNCT_OPTION", f"Option {opt_label} starts with punct: '{opt_val}'"))

    # 3. Answer check
    if ans not in ['A', 'B', 'C', 'D']:
        issues.append((qn, "INVALID_ANSWER", f"Ans is '{ans}'"))
        
    # 4. Explanation length
    if len(exp) < 15:
        issues.append((qn, "SHORT_EXPLANATION", f"Exp length {len(exp)}: '{exp}'"))

    # 5. Junk merge in explanation
    # Look for question number headers or weird brackets in explanation
    if re.search(r'\b\d{2,3}\.\s*\[', exp) or re.search(r'\bQ\.\s*\d+', exp) or '87. []' in exp:
        issues.append((qn, "MERGED_JUNK_IN_EXP", f"Possible merged text: '{exp[-80:]}'"))
    if '§' in exp or '⁴096' in exp:
        issues.append((qn, "CORRUPT_OCR_IN_EXP", f"Corrupt symbols in exp: '{exp}'"))

print(f"Total potential issues flagged: {len(issues)}")
for qn, cat, desc in issues:
    print(f"Q{qn:03d} [{cat}]: {desc}")
