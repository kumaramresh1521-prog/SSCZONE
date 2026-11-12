import json
import re

with open('kiran_type2_307_verified.json', 'r', encoding='utf-8') as f:
    data = json.load(f)

print(f"Total questions: {len(data)}")

key_mismatches = []

for q in data:
    qn = q['question_number']
    oa = str(q.get('option_a', '')).strip()
    ob = str(q.get('option_b', '')).strip()
    oc = str(q.get('option_c', '')).strip()
    od = str(q.get('option_d', '')).strip()
    ans = q.get('correct_option', '').strip().upper()
    exp = q.get('explanation', '').strip()
    
    opts = {'A': oa, 'B': ob, 'C': oc, 'D': od}
    curr_ans_val = opts.get(ans, '')
    
    # Check if explanation ends with or mentions "correct option is (X)" or "Option (X)"
    exp_opt_matches = re.findall(r'(?:option|Option|विकल्प)\s*(?:is)?\s*[\(\[]?([A-Da-d1-4])[\)\]]?', exp)
    if exp_opt_matches:
        last_opt = exp_opt_matches[-1].upper()
        # map 1->A, 2->B, 3->C, 4->D
        digit_map = {'1': 'A', '2': 'B', '3': 'C', '4': 'D'}
        last_opt = digit_map.get(last_opt, last_opt)
        if last_opt in ['A', 'B', 'C', 'D'] and last_opt != ans:
            key_mismatches.append((qn, ans, curr_ans_val, last_opt, opts.get(last_opt, ''), exp[-120:]))

print(f"Found {len(key_mismatches)} questions where explanation states a DIFFERENT option than correct_option field:")
for qn, ans, aval, exp_opt, exp_val, exp_tail in key_mismatches:
    print(f"Q{qn:03d}: json_ans={ans} ({aval}) vs exp_says={exp_opt} ({exp_val})")
    print(f"  Exp tail: {exp_tail.replace(chr(10), ' ')}")
    print()
