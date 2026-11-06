import fitz
import re
import os
import sys
import json

sys.stdout.reconfigure(encoding='utf-8')

folder = r"F:\startup  send mail"
pdf_files = [f for f in sorted(os.listdir(folder)) if f.lower().endswith(".pdf")]

with open("tmp_9_papers_pure_english.json", "r", encoding="utf-8") as f:
    papers = json.load(f)

pdf_map = {p["paper_id"]: fname for p, fname in zip(papers, pdf_files)}

targets = [
    (16, 73),
    (19, 75),
    (20, 53), (20, 64), (20, 65), (20, 72),
    (21, 52), (21, 72), (21, 73),
    (22, 52), (22, 56), (22, 64),
    (23, 51), (23, 52), (23, 73)
]

for pid, qnum in targets:
    fname = pdf_map[pid]
    doc = fitz.open(os.path.join(folder, fname))
    
    # search across pages
    for pno in range(len(doc)):
        txt = doc[pno].get_text()
        if f"Q{qnum}." in txt:
            print(f"=== Paper {pid} Q{qnum} (Page {pno+1}) ===")
            for l in [line.strip() for line in txt.split('\n') if line.strip()]:
                if any(w in l for w in [f"Q{qnum}", "chord", "ratio", "slope", "sin", "cos", "tan", "cot", "Solve", "Evaluate", "tangent", "triangle", "circles", "radius", "area", "volume", "A)", "B)", "C)", "D)", "Correct Answer:"]):
                    print(" ", l)
            print()
            break
