import glob
import json
import os
import re
import sys

sys.stdout.reconfigure(encoding='utf-8')

backup_dir = r"c:\ssczone\src\data\pyq_backup"
files = sorted(glob.glob(os.path.join(backup_dir, "*.json")))

print(f"Scanning {len(files)} JSON files for potential errors...")

issues = []

for fpath in files:
    base = os.path.basename(fpath).replace(".json", "")
    with open(fpath, "r", encoding="utf-8") as f:
        data = json.load(f)
    
    if len(data) != 100:
        issues.append((base, 0, f"Paper has {len(data)} questions instead of 100!"))
    
    for q in data:
        qn = q.get("question_number", 0)
        qt = q.get("question_text", "")
        oa = q.get("option_a", "")
        ob = q.get("option_b", "")
        oc = q.get("option_c", "")
        od = q.get("option_d", "")
        ans = q.get("correct_answer", "")
        
        # 1. Answer key validity
        if ans not in ("A", "B", "C", "D"):
            issues.append((base, qn, f"Invalid correct_answer: '{ans}'"))
            
        # 2. Empty options or question text
        for opt_label, opt_val in [("A", oa), ("B", ob), ("C", oc), ("D", od)]:
            if not opt_val or not opt_val.strip():
                issues.append((base, qn, f"Empty option_{opt_label}"))
        if not qt or not qt.strip():
            issues.append((base, qn, "Empty question_text"))
            
        # 3. Duplicate options
        opts_stripped = [oa.strip(), ob.strip(), oc.strip(), od.strip()]
        if len(set(opts_stripped)) < 4:
            issues.append((base, qn, f"Duplicate options: {opts_stripped}"))
            
        # 4. Garbled cp1252 / mojibake artifacts
        # e.g. ÔêÜ (√), ÔÇ£ (“), ¤Ç (π), ­Ø×▒, Ôé╣ (₹), Ôû│ (Δ)
        mojibake_patterns = [r"ÔêÜ", r"ÔÇ£", r"ÔÇØ", r"¤Ç", r"Ôé╣", r"Ôû│", r"ÔêÆ", r"­Ø", r"Ã", r"Â"]
        for p in mojibake_patterns:
            if re.search(p, qt) or any(re.search(p, opt) for opt in opts_stripped):
                issues.append((base, qn, f"Mojibake detected with pattern '{p}'"))
                break
                
        # 5. Broken ratio format like "1 :" or "3 :" (missing right-hand side of ratio)
        for opt_label, opt_val in [("A", oa), ("B", ob), ("C", oc), ("D", od)]:
            if re.search(r"^\s*\d+\s*:\s*$", opt_val):
                issues.append((base, qn, f"Broken ratio option_{opt_label}: '{opt_val}'"))
                
        # 6. Broken fraction / mangled numbers like "m = 1, n ="
        for opt_label, opt_val in [("A", oa), ("B", ob), ("C", oc), ("D", od)]:
            if re.search(r"[a-z]\s*=\s*\d+,\s*[a-z]\s*=\s*$", opt_val, re.IGNORECASE):
                issues.append((base, qn, f"Cutoff variable assignment in option_{opt_label}: '{opt_val}'"))

        # 7. Stray section headers in options
        stray_hdrs = ["GENERAL AWARENESS", "QUANTITATIVE APTITUDE", "ENGLISH COMPREHENSION", "GENERAL INTELLIGENCE"]
        for opt_label, opt_val in [("A", oa), ("B", ob), ("C", oc), ("D", od)]:
            for hdr in stray_hdrs:
                if hdr in opt_val.upper():
                    issues.append((base, qn, f"Stray header '{hdr}' in option_{opt_label}: '{opt_val}'"))

        # 8. Trailing page numbers like ". 8" or ". 12" at end of question_text
        if re.search(r"\.\s*\d{1,2}\s*$", qt):
            issues.append((base, qn, f"Trailing page number in question_text: '{qt[-15:]}'"))

print(f"\nTotal potential issues detected: {len(issues)}")
if issues:
    print("\nSummary of issues by category:")
    from collections import Counter
    cat_counts = Counter([i[2].split(':')[0] for i in issues])
    for cat, cnt in cat_counts.items():
        print(f"  - {cat}: {cnt}")
        
    print("\nFirst 20 issues:")
    for base, qn, desc in issues[:20]:
        print(f"  {base} Q.{qn}: {desc}")
else:
    print("Everything is 100% clean across all checks!")

with open("scripts/audit_issues_all.json", "w", encoding="utf-8") as out:
    json.dump([{"base": b, "qn": q, "desc": d} for b, q, d in issues], out, indent=2, ensure_ascii=False)
