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

print("=" * 80)
print("INSPECTING ALL FLAGGED MATH QUESTIONS IN ORIGINAL PDFs")
print("=" * 80)

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
            print(f"\n--- {title} (ID {pid}) Q{qn} ---")
            print(f"Current Statement: {repr(txt)}")
            print(f"Current Options: {opts}")
            print(f"Correct Answer: {q['correct_answer']}")
            
            # Find in PDF
            # Search for Q{qn}. in PDF
            found_text = ""
            for pno, page in enumerate(doc):
                t = page.get_text()
                if f"Q{qn}." in t or f"Q{qn}\n" in t:
                    # print snippet from this page
                    lines = t.split('\n')
                    found_text = f"Page {pno+1}:\n" + "\n".join(lines[:35])
                    break
            print(found_text[:400] if found_text else "Not found via simple search")
