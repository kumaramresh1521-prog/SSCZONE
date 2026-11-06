import json
import re
import sys

sys.stdout.reconfigure(encoding='utf-8')

with open("tmp_9_papers_pure_english.json", "r", encoding="utf-8") as f:
    papers = json.load(f)

print("=" * 80)
print("VERIFYING NON-MATH QUESTIONS & GENERAL INTEGRITY")
print("=" * 80)

non_math_issues = []

for p in papers:
    pid = p["paper_id"]
    title = p["title"]
    qs = p["questions"]
    
    for q in qs:
        qn = q["question_number"]
        txt = q["question_text"]
        opts = [q["option_a"], q["option_b"], q["option_c"], q["option_d"]]
        
        # Check if reasoning or english or GA has any issues
        if qn <= 50 or qn >= 76:
            # Check length
            if len(txt) < 15:
                non_math_issues.append((title, qn, f"Very short text: '{txt}'"))
            # Check options
            for o_lbl, o_val in zip(["A", "B", "C", "D"], opts):
                if not o_val or len(o_val.strip()) == 0:
                    non_math_issues.append((title, qn, f"Empty option {o_lbl}"))
                if o_val.startswith("Option "):
                    non_math_issues.append((title, qn, f"Placeholder option {o_lbl}: '{o_val}'"))
            # Check if devanagari remained
            if re.search(r'[\u0900-\u097F]', txt + " " + " ".join(opts)):
                non_math_issues.append((title, qn, "Remaining Devanagari text"))

print(f"Total non-math issues found across 9 papers (675 questions): {len(non_math_issues)}")
for iss in non_math_issues:
    print(f"  • {iss[0]} Q{iss[1]}: {iss[2]}")
