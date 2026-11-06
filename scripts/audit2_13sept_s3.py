import json
import sys

sys.stdout.reconfigure(encoding='utf-8')

with open("tmp/13sept_s3_raw.json", "r", encoding="utf-8") as f:
    qs = json.load(f)

print(f"=== AUDIT PASS 2: 13 SEPT SHIFT 3 ===")
for q in qs:
    n = q["question_number"]
    txt = q["question_text"]
    opts = [q["option_a"], q["option_b"], q["option_c"], q["option_d"]]
    ans = q["correct_answer"]
    
    if any(o.startswith("Option ") for o in opts) or any(len(o.strip()) == 0 for o in opts):
        print(f"Placeholder options in Q{n}: {opts}")
    if "  " in txt and ("=" in txt or "ratio" in txt or "angle" in txt):
        print(f"Blank in Q{n}: {txt[:80]}")
