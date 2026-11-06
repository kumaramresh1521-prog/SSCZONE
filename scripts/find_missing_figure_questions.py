import json
import glob
import os
import re
import sys

sys.stdout.reconfigure(encoding='utf-8')

backup_dir = r"c:\ssczone\src\data\pyq_backup"
files = sorted(glob.glob(os.path.join(backup_dir, "*2026*.json")))

figure_keywords = re.compile(r'\b(given figure|following figure|in the figure|shown in the figure|the figure below|given diagram|shown below|in the diagram|given below|venn diagram|mirror image|paper is folded|folded into a cube|embedded in the given figure|pattern would the paper resemble|hidden in the given figure)\b', re.I)

missing_figure_questions = []

for fpath in files:
    fname = os.path.basename(fpath)
    with open(fpath, "r", encoding="utf-8") as f:
        questions = json.load(f)
    
    for q in questions:
        qn = q["question_number"]
        qt = q.get("question_text", "")
        oa = q.get("option_a", "")
        ob = q.get("option_b", "")
        oc = q.get("option_c", "")
        od = q.get("option_d", "")
        
        has_img = any("![" in text or "/images/pyq/2026/" in text for text in [qt, oa, ob, oc, od])
        
        # Check if question text mentions a figure/diagram
        m = figure_keywords.search(qt)
        if m and not has_img:
            missing_figure_questions.append({
                "file": fname,
                "qn": qn,
                "matched": m.group(0),
                "text": qt[:120],
                "opt_a": oa[:40]
            })

print(f"Total questions mentioning figure/diagram without ANY image: {len(missing_figure_questions)}")
print("\nFirst 30 examples:")
for item in missing_figure_questions[:30]:
    print(f"  {item['file']} | Q.{item['qn']} (matched: '{item['matched']}'):")
    print(f"    Text: {repr(item['text'])}")
    print(f"    Opt A: {repr(item['opt_a'])}")
    print()
