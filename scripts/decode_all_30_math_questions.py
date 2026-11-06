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

# Map of paper_id to pdf file
pdf_map = {p["paper_id"]: fname for p, fname in zip(papers, pdf_files)}

targets = [
    # Paper 15
    (15, 53), (15, 54), (15, 55), (15, 73), (15, 75),
    # Paper 16
    (16, 53), (16, 73),
    # Paper 17
    (17, 51),
    # Paper 18
    (18, 51), (18, 53), (18, 64), (18, 65), (18, 66), (18, 72),
    # Paper 19
    (19, 75),
    # Paper 20
    (20, 53), (20, 64), (20, 65), (20, 72),
    # Paper 21
    (21, 52), (21, 72), (21, 73),
    # Paper 22
    (22, 52), (22, 56), (22, 64), (22, 72),
    # Paper 23
    (23, 51), (23, 52), (23, 66), (23, 73)
]

print(f"Decoding {len(targets)} questions...")

for pid, qnum in targets:
    fname = pdf_map[pid]
    doc = fitz.open(os.path.join(folder, fname))
    
    # find question in PDF
    for pno in range(len(doc)):
        page = doc[pno]
        txt = page.get_text()
        if f"Q{qnum}." in txt[:120]:
            print(f"\n================================================================================")
            print(f"Paper {pid} ({fname}) Q{qnum} (Page {pno+1}):")
            # print all lines of this page that belong to Q{qnum}
            lines = [l.strip() for l in txt.split('\n') if l.strip()]
            print("\n".join(lines[:25]))
            break
