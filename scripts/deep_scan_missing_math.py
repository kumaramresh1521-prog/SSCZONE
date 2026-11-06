import glob
import json
import re
import sys

sys.stdout.reconfigure(encoding='utf-8')

json_files = glob.glob(r'src/data/pyq_backup/*.json')
print(f"Deep scanning {len(json_files)} papers for missing math formulas or truncated statements...")

missing_math = []

for jf in json_files:
    fname = jf.split('\\')[-1]
    with open(jf, 'r', encoding='utf-8') as f:
        try:
            qs = json.load(f)
        except Exception:
            continue
            
    for q in qs:
        qnum = q.get('question_number')
        raw = (q.get('question_text') or "").strip()
        opts = [q.get('option_a'), q.get('option_b'), q.get('option_c'), q.get('option_d')]
        
        # Check if question text is just "Evaluate:" or "Simplify:" or similar
        # e.g. "Evaluate:", "Simplify:", "Solve:", "Find the value of:"
        clean_no_hi = re.sub(r'[\u0900-\u097F\s:।.]+', ' ', raw).strip()
        
        if clean_no_hi.lower() in [
            'evaluate', 'simplify', 'solve', 'calculate', 
            'evaluate the expression', 'simplify the following', 
            'find the value of', 'what is the value of', 'the value of'
        ]:
            missing_math.append((fname, qnum, raw, opts, q.get('correct_answer')))
        elif len(raw) < 18 and any(kw in raw.lower() for kw in ['evaluate', 'simplify', 'solve', 'calculate']):
            missing_math.append((fname, qnum, raw, opts, q.get('correct_answer')))

print(f"\nFOUND {len(missing_math)} QUESTIONS WITH MISSING MATH FORMULAS:")
for m in missing_math:
    print(f"File: {m[0]} | Q.{m[1]}")
    print(f"  TEXT: '{m[2]}'")
    print(f"  OPTS: {m[3]}")
    print(f"  ANS:  {m[4]}")
    print("--------------------------------------------------")
