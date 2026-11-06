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

summary_list = []

for p, fname in zip(papers, pdf_files):
    pid = p["paper_id"]
    title = p["title"]
    qs = p["questions"]
    pdf_path = os.path.join(folder, fname)
    doc = fitz.open(pdf_path)

    for q in qs:
        qn = q["question_number"]
        txt = q["question_text"]
        opts = [q["option_a"], q["option_b"], q["option_c"], q["option_d"]]
        
        has_placeholder = any(o.startswith("Option ") for o in opts)
        is_short = len(txt.strip()) < 15 or txt.strip().endswith("value of") or txt.strip().endswith("value of:") or txt.strip().endswith("Simplify:") or txt.strip().endswith("Solve:") or txt.strip().endswith("Evaluate")
        
        if has_placeholder or is_short:
            # Locate in PDF
            # We look for the block containing the question text or options
            q_pdf_text = ""
            for pno, page in enumerate(doc):
                t = page.get_text()
                # Check if this question is on this page
                if f"Q{qn}." in t[:80]: # in header
                    q_pdf_text = f"P.{pno+1}"
                    break
                    
            summary_list.append({
                "paper_id": pid,
                "title": title.replace("SSC CGL 2025 Tier-I (Held On ", "").replace(")", ""),
                "qnum": qn,
                "text": txt,
                "opts": opts,
                "ans": q["correct_answer"],
                "page": q_pdf_text
            })

print(f"Total flagged questions needing math review: {len(summary_list)}")
print(f"{'Paper':25s} | {'Q#':3s} | {'Ans':3s} | {'Options Sample':30s} | Question Text")
print("-" * 100)
for item in summary_list:
    opts_str = f"A: {item['opts'][0][:8]} | B: {item['opts'][1][:8]}"
    print(f"{item['title']:25s} | Q{item['qnum']:2d} | {item['ans']:3s} | {opts_str:30s} | {item['text'][:40]}")
