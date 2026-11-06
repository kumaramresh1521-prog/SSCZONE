import json
import glob
import os
import re
import sys

sys.stdout.reconfigure(encoding='utf-8')

backup_dir = r"c:\ssczone\src\data\pyq_backup"
files = sorted(glob.glob(os.path.join(backup_dir, "*2026*.json")))

figure_cues = re.compile(
    r'\b('
    r'in the given figure|'
    r'in the following figure|'
    r'shown in the figure|'
    r'from the given figure|'
    r'the following figure|'
    r'given below figure|'
    r'given diagram|'
    r'in the diagram|'
    r'venn diagram|'
    r'mirror image|'
    r'water image|'
    r'paper is folded|'
    r'piece of paper|'
    r'folded into a cube|'
    r'folded to form a cube|'
    r'embedded in the given figure|'
    r'pattern would the paper resemble|'
    r'hidden in the given figure|'
    r'complete the pattern|'
    r'how many triangles|'
    r'how many squares|'
    r'how many rectangles|'
    r'opposite faces|'
    r'DIAGRAM_OR_GEOMETRIC'
    r')\b',
    re.I
)

reasoning_issues = []

for fpath in files:
    fname = os.path.basename(fpath)
    with open(fpath, "r", encoding="utf-8") as f:
        questions = json.load(f)
        
    for q in questions[:25]: # Reasoning is Q.1 to 25
        qn = q["question_number"]
        qt = q.get("question_text", "")
        oa = q.get("option_a", "")
        ob = q.get("option_b", "")
        oc = q.get("option_c", "")
        od = q.get("option_d", "")
        
        has_img_in_q = "![" in qt
        has_img_in_opts = any("![" in opt for opt in [oa, ob, oc, od])
        
        m = figure_cues.search(qt)
        if m:
            # Check what's missing
            missing_q_img = not has_img_in_q
            missing_opt_img = not has_img_in_opts
            
            # If it's a "How many triangles" or "Venn diagram" or "paper folding", the QUESTION must have an image!
            # If it's a "complete the pattern" or "embedded figure", BOTH question and options usually have images!
            reasoning_issues.append({
                "file": fname,
                "qn": qn,
                "cue": m.group(0),
                "has_q_img": has_img_in_q,
                "has_opt_img": has_img_in_opts,
                "text": qt[:120],
                "opt_a": oa[:50]
            })

print(f"Total reasoning questions with figure cues: {len(reasoning_issues)}")
missing_anything = [r for r in reasoning_issues if not r["has_q_img"] or not r["has_opt_img"]]
print(f"Questions where EITHER question image OR option image is missing: {len(missing_anything)}\n")

for r in missing_anything:
    print(f"File: {r['file']} | Q.{r['qn']} (Cue: '{r['cue']}')")
    print(f"  has_q_img: {r['has_q_img']} | has_opt_img: {r['has_opt_img']}")
    print(f"  Text: {repr(r['text'])}")
    print(f"  Opt A: {repr(r['opt_a'])}")
    print("-" * 60)
