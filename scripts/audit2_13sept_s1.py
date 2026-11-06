import json
import re
import sys

sys.stdout.reconfigure(encoding='utf-8')

with open("tmp/13sept_s1_raw.json", "r", encoding="utf-8") as f:
    qs = json.load(f)

print(f"Total questions loaded: {len(qs)}")

# Check each section
sec_names = ["1. Reasoning (Q1-Q25)", "2. General Awareness (Q26-Q50)", "3. Quantitative Aptitude (Q51-Q75)", "4. English Comprehension (Q76-Q100)"]
for sec_idx, name in enumerate(sec_names):
    sec_qs = qs[sec_idx*25 : (sec_idx+1)*25]
    print(f"\n--- {name} ({len(sec_qs)} questions) ---")
    short_qs = [q["question_number"] for q in sec_qs if len(q["question_text"]) < 20]
    if short_qs:
        print(f"  Short question text in: {short_qs}")
    else:
        print("  All question texts look good!")

# Check options across all 100
empty_opts = []
for q in qs:
    for lbl in ["a", "b", "c", "d"]:
        val = q.get(f"option_{lbl}", "")
        if not val or val.strip() == "" or val.strip() == f"Option {lbl.upper()}":
            empty_opts.append((q["question_number"], lbl.upper(), val))

print(f"\nTotal empty / placeholder options across all 100: {len(empty_opts)}")
for o in empty_opts:
    print(f"  Q{o[0]} option {o[1]}: '{o[2]}'")
