import json
import re

with open('kiran_type2_307_verified.json', 'r', encoding='utf-8') as f:
    data = json.load(f)

print(f"Loaded {len(data)} questions.")

mismatches = []

for q in data:
    qn = q['question_number']
    qt = q.get('question_text', '')
    exp = q.get('explanation', '')
    oa = str(q.get('option_a', '')).strip()
    ob = str(q.get('option_b', '')).strip()
    oc = str(q.get('option_c', '')).strip()
    od = str(q.get('option_d', '')).strip()
    ans = q.get('correct_option', '').strip()
    
    # Extract numbers from question text
    # e.g., "36 : 84" or "29 : 13 :: 37 : ?"
    q_nums = re.findall(r'\b\d+\b', qt)
    
    # Extract numbers from explanation
    exp_nums = re.findall(r'\b\d+\b', exp)
    
    # Check if at least one number from the question appears in the explanation
    if q_nums:
        # Check overlap
        overlap = set(q_nums).intersection(set(exp_nums))
        if not overlap:
            mismatches.append((qn, "NO_NUM_OVERLAP", f"Q nums={q_nums[:5]}, Exp nums={exp_nums[:5]}"))
            
    # Check if correct option value is mentioned in explanation
    corr_val = {'A': oa, 'B': ob, 'C': oc, 'D': od}.get(ans, '')
    corr_nums = re.findall(r'\b\d+\b', corr_val)
    if corr_nums:
        has_corr = any(cn in exp_nums for cn in corr_nums)
        if not has_corr:
            mismatches.append((qn, "CORR_VAL_NOT_IN_EXP", f"Ans {ans}={corr_val}, not in exp nums={exp_nums[:8]}"))

print(f"Total potential explanation mismatches: {len(mismatches)}")
for qn, kind, desc in mismatches:
    print(f"Q{qn:03d} [{kind}]: {desc}")
