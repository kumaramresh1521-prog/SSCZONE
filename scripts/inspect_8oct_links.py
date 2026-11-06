import json

with open("c:/ssczone/src/data/pyq_backup/ssc-cgl-2026-8-october-2026-shift-3.json", encoding="utf-8") as f:
    qs = json.load(f)

for q in qs[:25]:
    qn = q["question_number"]
    qt = q["question_text"]
    imgs = [val for val in [qt, q["option_a"], q["option_b"], q["option_c"], q["option_d"]] if "![" in val]
    if imgs:
        print(f"Q.{qn} has images: {imgs}")
    else:
        # Check if it mentions diagram
        if "diagram" in qt.lower() or "figure" in qt.lower() or "image" in qt.lower() or "cube" in qt.lower():
            print(f"Q.{qn} NO IMAGE but text: {repr(qt[:80])}")
