import json
import glob
import os
import re
import sys

sys.stdout.reconfigure(encoding='utf-8')

backup_dir = r"c:\ssczone\src\data\pyq_backup"
files = sorted(glob.glob(os.path.join(backup_dir, "*2026*.json")))

math_figure_cues = re.compile(
    r'\b('
    r'in the figure|'
    r'in the given figure|'
    r'shown in the figure|'
    r'from the given figure|'
    r'as per the figure|'
    r'refer to the figure|'
    r'the following figure|'
    r'pie chart|'
    r'bar graph|'
    r'bar chart|'
    r'histogram|'
    r'line graph|'
    r'study the graph|'
    r'study the chart|'
    r'the given graph|'
    r'the given chart|'
    r'DIAGRAM_OR_GEOMETRIC'
    r')\b',
    re.I
)

math_missing = []

for fpath in files:
    fname = os.path.basename(fpath)
    with open(fpath, "r", encoding="utf-8") as f:
        questions = json.load(f)
    
    for q in questions:
        qn = q["question_number"]
        if 51 <= qn <= 75: # Quantitative Aptitude section
            qt = q.get("question_text", "")
            has_img = any("![" in text or "/images/pyq/2026/" in text for text in [qt, q.get("option_a",""), q.get("option_b",""), q.get("option_c",""), q.get("option_d","")])
            m = math_figure_cues.search(qt)
            if m and not has_img:
                math_missing.append({
                    "file": fname,
                    "qn": qn,
                    "cue": m.group(0),
                    "text": qt[:150]
                })

print(f"Total Math (Q.51-75) questions with figure/chart cues missing image: {len(math_missing)}")
for item in math_missing:
    print(f"  {item['file']} | Q.{item['qn']} (Cue: '{item['cue']}'):")
    print(f"    Text: {repr(item['text'])}")
    print()
