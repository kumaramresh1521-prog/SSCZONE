import json
import re
import sys

sys.stdout.reconfigure(encoding='utf-8')

with open("tmp/13sept_s2_raw.json", "r", encoding="utf-8") as f:
    qs = json.load(f)

print(f"=== AUDIT PASS 2: 13 SEPT SHIFT 2 ===")
print(f"Total questions: {len(qs)}")

# Inspect Quant Q51-Q75
print("\n--- QUANT SECTION (Q51-Q75) DETAILED AUDIT ---")
for q in qs[50:75]:
    txt = q["question_text"]
    opts = [q["option_a"], q["option_b"], q["option_c"], q["option_d"]]
    ans = q["correct_answer"]
    
    # Check for blank fractions or weird signs
    flag = False
    if "  " in txt and ("=" in txt or "of" in txt or "+" in txt):
        flag = True
    if any(len(o.strip()) == 0 for o in opts):
        flag = True
    
    if flag:
        print(f"⚠️ Flagged Q{q['question_number']}: {txt[:80]}...")
        print(f"   A: {opts[0]} | B: {opts[1]} | C: {opts[2]} | D: {opts[3]} | Ans: {ans}")

print("\nAudit Pass 2 completed for 13 Sept Shift 2.")
