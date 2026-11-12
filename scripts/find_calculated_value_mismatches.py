import json
import re

with open('kiran_type2_307_verified.json', 'r', encoding='utf-8') as f:
    data = json.load(f)

print(f"Total questions: {len(data)}")

val_mismatches = []

for q in data:
    qn = q['question_number']
    oa = str(q.get('option_a', '')).strip()
    ob = str(q.get('option_b', '')).strip()
    oc = str(q.get('option_c', '')).strip()
    od = str(q.get('option_d', '')).strip()
    ans = q.get('correct_option', '').strip().upper()
    exp = q.get('explanation', '').strip()
    
    opts = {'A': oa, 'B': ob, 'C': oc, 'D': od}
    
    # Look for the last "= [number]" or "=[number]" or "=> [number]" in explanation
    m = re.findall(r'=\s*(\d+)\s*(?:\n|\Z|\.|\)|$)', exp)
    if m:
        final_num = m[-1]
        # Check which option matches final_num
        matching_opts = [opt for opt, val in opts.items() if val == final_num or val.endswith(' ' + final_num) or val.endswith(':' + final_num)]
        if matching_opts and ans not in matching_opts:
            val_mismatches.append((qn, ans, opts[ans], matching_opts, [opts[mo] for mo in matching_opts], final_num, exp[-150:]))

print(f"Found {len(val_mismatches)} questions where calculation ends with a number matching a DIFFERENT option:")
for qn, ans, aval, m_opts, m_vals, fnum, exp_tail in val_mismatches:
    print(f"Q{qn:03d}: json_ans={ans} ({aval}) | calc_result={fnum} matches {m_opts} ({m_vals})")
    print(f"  Exp: {exp_tail.replace(chr(10), ' ')}")
    print()
