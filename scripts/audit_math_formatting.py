import json
import glob
import os
import re
import sys

sys.stdout.reconfigure(encoding='utf-8')

backup_dir = r"c:\ssczone\src\data\pyq_backup"
files = sorted(glob.glob(os.path.join(backup_dir, "*2026*.json")))

math_formatting_issues = []

for fpath in files:
    fname = os.path.basename(fpath)
    with open(fpath, "r", encoding="utf-8") as f:
        questions = json.load(f)
        
    for q in questions:
        qn = q["question_number"]
        if 51 <= qn <= 75:
            qt = q.get("question_text", "")
            opts = [q.get("option_a",""), q.get("option_b",""), q.get("option_c",""), q.get("option_d","")]
            comb = qt + " " + " ".join(opts)
            
            # Check for plain x2, y2, x3, y3, sin2, cos2, tan2, cm2, m2, etc.
            m_sup = re.findall(r'\b([a-zA-Z]|sin|cos|tan|sec|cosec|cot|cm|m|km)([23])(?!\d)', comb)
            
            # Check for unrendered fraction / division weirdness
            m_div = re.findall(r'(\d+\s*÷\s*\d+)', comb)
            
            # Check for missing square root like "?3" or broken sqrt
            m_sqrt = re.findall(r'(\?\d+|\broot\b|√)', comb)
            
            # Check for DIAGRAM_OR_GEOMETRIC
            has_placeholder = "DIAGRAM_OR_GEOMETRIC" in comb
            
            if m_sup or has_placeholder or "√" in comb:
                math_formatting_issues.append((fname, qn, m_sup, has_placeholder, qt[:100]))

print(f"Total Math questions with potential equation/formatting improvements: {len(math_formatting_issues)}")
print("\nFirst 20 examples:")
for item in math_formatting_issues[:20]:
    print(f"{item[0]} | Q.{item[1]} -> Superscripts: {item[2]} | Placeholder: {item[3]}")
    print(f"   Text: {repr(item[4])}")
