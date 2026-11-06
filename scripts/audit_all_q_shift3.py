import json
import re
import sys

sys.stdout.reconfigure(encoding='utf-8')

json_path = r"C:\Users\Admin\Downloads\ssc-cgl-2025-12-september-2025-shift-3_bulk_import.json"
with open(json_path, "r", encoding="utf-8") as f:
    qs = json.load(f)

for q in qs:
    n = q["question_number"]
    txt = q["question_text"]
    opts = [q["option_a"], q["option_b"], q["option_c"], q["option_d"]]
    
    # Check for short or weird texts
    issues = []
    if len(txt) < 15:
        issues.append(f"Short text: '{txt}'")
    if any(o.startswith("Option ") for o in opts):
        issues.append("Generic 'Option X' found")
    if any(len(o) == 0 for o in opts):
        issues.append("Empty option found")
    if "  " in txt and ("=" in txt or "of" in txt):
        issues.append("Possible missing math symbol (large space)")
    if "figure" in txt.lower() or "image" in txt.lower() or "pattern" in txt.lower() or "fold" in txt.lower() or "mirror" in txt.lower() or "dice" in txt.lower() or "cube" in txt.lower():
        issues.append(f"Visual question: '{txt[:50]}'")

    if issues:
        print(f"Q{n}: {', '.join(issues)}")
