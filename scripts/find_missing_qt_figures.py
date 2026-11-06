import json
import glob
import os
import re
import sys

sys.stdout.reconfigure(encoding='utf-8')

backup_dir = r"c:\ssczone\src\data\pyq_backup"
files = sorted(glob.glob(os.path.join(backup_dir, "*2026*.json")))

# Phrases that indicate the QUESTION TEXT must show a figure/diagram
qt_figure_cues = re.compile(
    r'\b('
    r'in the given figure|'
    r'in the following figure|'
    r'shown in the figure|'
    r'refer to the given figure|'
    r'from the given figure|'
    r'according to the given figure|'
    r'in the figure below|'
    r'in the figure,|'
    r'given in the figure|'
    r'given venn diagram|'
    r'in the venn diagram|'
    r'based on the venn diagram|'
    r'study the given pie chart|'
    r'in the pie chart|'
    r'given pie chart|'
    r'given bar graph|'
    r'study the given bar graph|'
    r'in the bar graph|'
    r'given histogram|'
    r'given line graph|'
    r'Figure\s*\(?X\)?|'
    r'Image\s*\(?X\)?|'
    r'DIAGRAM_OR_GEOMETRIC'
    r')\b',
    re.I
)

missing_qt_images = []

for fpath in files:
    fname = os.path.basename(fpath)
    with open(fpath, "r", encoding="utf-8") as f:
        questions = json.load(f)
    
    for q in questions:
        qn = q["question_number"]
        qt = q.get("question_text", "")
        
        # Check if question text mentions a figure
        m = qt_figure_cues.search(qt)
        if m:
            # Does question_text have an image?
            has_img_in_qt = "![" in qt or "/images/pyq/2026/" in qt
            if not has_img_in_qt:
                missing_qt_images.append({
                    "file": fname,
                    "qn": qn,
                    "cue": m.group(0),
                    "text": qt
                })

print(f"Total questions where QUESTION TEXT mentions a figure but has NO image in question_text: {len(missing_qt_images)}\n")

for item in missing_qt_images:
    print(f"File: {item['file']} | Q.{item['qn']} (Cue: '{item['cue']}')")
    print(f"  Snippet: {repr(item['text'][:120])}")
    print("-" * 60)
