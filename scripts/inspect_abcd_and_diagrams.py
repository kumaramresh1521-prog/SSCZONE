import glob
import json
import os
import re
import sys

sys.stdout.reconfigure(encoding='utf-8')
backup_dir = r"c:\ssczone\src\data\pyq_backup"
files = sorted(glob.glob(os.path.join(backup_dir, "*2026*.json")))

results = []
for fpath in files:
    fname = os.path.basename(fpath)
    with open(fpath, "r", encoding="utf-8") as f:
        data = json.load(f)
    for q in data:
        qt = q.get("question_text", "")
        qn = q["question_number"]
        has_abcd = bool(re.search(r'\(A\)\s*(\(B\)|[A-D\d])', qt))
        has_diagram = "DIAGRAM_OR_GEOMETRIC" in qt or any("DIAGRAM_OR_GEOMETRIC" in q.get(f"option_{x}", "") for x in ["a","b","c","d"])
        
        if has_abcd or has_diagram:
            results.append((fname, qn, qt, q.get("option_a",""), q.get("option_b",""), q.get("option_c",""), q.get("option_d","")))

print(f"Total matching items: {len(results)}")
for r in results:
    print("=" * 60)
    print(f"{r[0]} Q.{r[1]}:")
    print(f"QUESTION TEXT:\n{r[2]}")
    print(f"OPTS: A={r[3][:40]} | B={r[4][:40]} | C={r[5][:40]} | D={r[6][:40]}")
