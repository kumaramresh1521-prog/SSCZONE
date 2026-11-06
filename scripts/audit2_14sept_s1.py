import json
import re
import sys

sys.stdout.reconfigure(encoding='utf-8')

with open("tmp/14sept_s1_raw.json", "r", encoding="utf-8") as f:
    qs = json.load(f)

print(f"Total questions loaded: {len(qs)}")

sec_names = [
    "Section 1: General Intelligence and Reasoning (Q1-Q25)",
    "Section 2: General Awareness (Q26-Q50)",
    "Section 3: Quantitative Aptitude (Q51-Q75)",
    "Section 4: English Comprehension (Q76-Q100)"
]

for sec_idx, sec_name in enumerate(sec_names):
    sec_qs = qs[sec_idx*25 : (sec_idx+1)*25]
    print(f"\n=======================================================")
    print(f"{sec_name}")
    print(f"=======================================================")
    for q in sec_qs:
        n = q["question_number"]
        txt = q["question_text"]
        opts = [q["option_a"], q["option_b"], q["option_c"], q["option_d"]]
        ans = q["correct_answer"]
        
        # Check suspicious patterns
        flags = []
        if len(txt) < 15:
            flags.append(f"Short text ({len(txt)})")
        for idx, opt in enumerate(opts):
            lbl = chr(65 + idx)
            if not opt or opt.strip() == "" or opt == f"Option {lbl}":
                flags.append(f"Empty/Placeholder Option {lbl}")
            if len(opt.strip()) == 0:
                flags.append(f"Zero-len Option {lbl}")
        
        # Check math anomalies (isolated operators, missing numbers before/after ^ or /)
        if re.search(r'[+\-*/=]\s*$', txt) or "  " in txt and any(sym in txt for sym in ['=', '+', '-', '√', 'π', '^', '°']):
            flags.append("Suspicious math spacing/operator")
        
        # Check Hindi repeated matras
        if re.search(r'([\u093E-\u094C\u0901-\u0903])\1', txt):
            flags.append("Repeated Hindi matras")
            
        if flags or n in [65, 51, 52, 53, 54, 75]:
            print(f"Q{n} [Ans: {ans}]: {flags if flags else 'Checked explicitly'}")
            print(f"   Text: {txt[:120]}...")
            print(f"   A: {opts[0]} | B: {opts[1]} | C: {opts[2]} | D: {opts[3]}")
