import fitz
import json
import re
import os
import sys

sys.stdout.reconfigure(encoding='utf-8')

folder = r"F:\startup  send mail"
pdf_files = [f for f in sorted(os.listdir(folder)) if f.lower().endswith(".pdf")]

with open("tmp_9_papers_pure_english.json", "r", encoding="utf-8") as f:
    papers = json.load(f)

print("=" * 80)
print("VERIFYING EXTRACTED ANSWERS OF 9 NEW PAPERS AGAINST OFFICIAL PDFs")
print("=" * 80)

total_checked = 0
total_matched = 0

for p, fname in zip(papers, pdf_files):
    pdf_path = os.path.join(folder, fname)
    doc = fitz.open(pdf_path)
    
    start_pno = 0
    for pno in range(min(5, len(doc))):
        txt = doc[pno].get_text()
        if "Q1." in txt or "General Intelligence" in txt:
            start_pno = pno
            break

    content_blocks = []
    for pno in range(start_pno, len(doc)):
        page = doc[pno]
        blocks = page.get_text("blocks")
        for b in blocks:
            text = b[4].strip()
            y0, y1 = b[1], b[3]
            if y0 < 45 or y1 > 800:
                continue
            if "testbook" in text.lower():
                continue
            if re.match(r'^Q\d+\.\s*$', text):
                continue
            content_blocks.append(text)

    full_text = "\n".join(content_blocks)
    ca_pattern = re.compile(r'Correct Answer:\s*([A-D])', re.IGNORECASE)
    parts = ca_pattern.split(full_text)
    
    pdf_answers = {}
    q_count = 0
    for j in range(0, len(parts) - 1, 2):
        q_count += 1
        ans = parts[j+1].strip().upper()
        pdf_answers[q_count] = ans

    qs = p["questions"]
    p_matched = 0
    for q in qs:
        qn = q["question_number"]
        db_a = q["correct_answer"]
        pdf_a = pdf_answers.get(qn)
        if pdf_a:
            total_checked += 1
            if db_a == pdf_a:
                total_matched += 1
                p_matched += 1
            else:
                print(f"  ❌ {p['title']} Q{qn}: Extracted {db_a}, PDF has {pdf_a}")
                
    print(f"📄 {p['title']}: {p_matched}/100 answers matched perfectly!")

print("=" * 80)
print(f"TOTAL CHECKED: {total_checked}")
print(f"TOTAL MATCHED: {total_matched}")
print(f"ACCURACY     : {(total_matched / total_checked * 100):.2f}%")
print("=" * 80)
