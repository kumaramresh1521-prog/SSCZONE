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
    # Paper 15
    (15, 53), (15, 54), (15, 55), (15, 73), (15, 75),
    # Paper 16
    (16, 53), (16, 73),
    # Paper 17
    (17, 51),
    # Paper 18
    (18, 51), (18, 53), (18, 56), (18, 64), (18, 65), (18, 66), (18, 72),
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

print(f"Total targets: {len(targets)}\n")

for pid, qnum in targets:
    fname = pdf_map[pid]
    doc = fitz.open(os.path.join(folder, fname))
    
    # We find the question text across all pages
    for pno in range(len(doc)):
        txt = doc[pno].get_text()
        # Find Q{qnum} in blocks
        blocks = doc[pno].get_text("blocks")
        found = False
        for b_idx, b in enumerate(blocks):
            b_txt = b[4].strip()
            # If block has Correct Answer and precedes or contains target
            if "Correct Answer:" in b_txt:
                pass
        
        # If page has Q{qnum}. in header
        if f"Q{qnum}." in txt[:150]:
            # Print page's text from where this question starts
            # Split by 'Correct Answer: [A-D]'
            ca_splits = re.split(r'Correct Answer:\s*([A-D])', txt)
            # Find which split corresponds to Q{qnum}
            print(f"=== Paper {pid} Q{qnum} ({fname} Page {pno+1}) ===")
            print(txt[:700])
            print("="*60)
            break
