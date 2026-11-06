import fitz
import json
import re
import os
import sys

sys.stdout.reconfigure(encoding='utf-8')

pdf_mapping = [
    (1, "12 Sept Shift 1", [
        r"E:\pyq pdf\SSC CGL, 2025 Official Paper (Held On_ 12 Sept, 2025 Shift 1).pdf",
        r"C:\Users\Admin\Downloads\SSC CGL, 2025 Official Paper (Held On_ 12 Sept, 2025 Shift 1).pdf"
    ]),
    (4, "12 Sept Shift 2", [
        r"C:\Users\Admin\Downloads\SSC CGL, 2025 Official Paper (Held On_ 12 Sept, 2025 Shift 2).pdf",
        r"E:\pyq pdf\SSC CGL, 2025 Official Paper (Held On_ 12 Sept, 2025 Shift 2).pdf"
    ]),
    (5, "12 Sept Shift 3", [
        r"E:\pyq pdf\ssc-cgl-2025-12-september-2025-shift-3_SSC_ZONE.pdf"
    ]),
    (6, "13 Sept Shift 1", [
        r"C:\Users\Admin\Downloads\SSC CGL, 2025 Official Paper (Held On_ 13 Sept, 2025 Shift 1).pdf"
    ]),
    (7, "13 Sept Shift 2", [
        r"C:\Users\Admin\Downloads\SSC CGL, 2025 Official Paper (Held On_ 13 Sept, 2025 Shift 2).pdf"
    ]),
    (8, "13 Sept Shift 3", [
        r"C:\Users\Admin\Downloads\SSC CGL, 2025 Official Paper (Held On_ 13 Sept, 2025 Shift 3).pdf"
    ]),
    (9, "14 Sept Shift 1", [
        r"C:\Users\Admin\Downloads\SSC CGL, 2025 Official Paper (Held On_ 14 Sept, 2025 Shift 1).pdf"
    ]),
    (10, "14 Sept Shift 2", [
        r"C:\Users\Admin\Downloads\SSC CGL, 2025 Official Paper (Held On_ 14 Sept, 2025 Shift 2).pdf"
    ]),
    (11, "14 Sept Shift 3", [
        r"C:\Users\Admin\Downloads\SSC CGL, 2025 Official Paper (Held On_ 14 Sept, 2025 Shift 3).pdf"
    ]),
    (12, "15 Sept Shift 1", [
        r"C:\Users\Admin\Downloads\SSC CGL, 2025 Official Paper (Held On_ 15 Sept, 2025 Shift 1).pdf"
    ]),
    (13, "15 Sept Shift 2", [
        r"C:\Users\Admin\Downloads\SSC CGL, 2025 Official Paper (Held On_ 15 Sept, 2025 Shift 2).pdf"
    ]),
    (14, "15 Sept Shift 3", [
        r"C:\Users\Admin\Downloads\SSC CGL, 2025 Official Paper (Held On_ 15 Sept, 2025 Shift 3).pdf"
    ])
]

with open("tmp_cleaned_database_payload.json", "r", encoding="utf-8") as f:
    db_papers = json.load(f)

db_papers_dict = {p["paper"]["id"]: p for p in db_papers}

print("=" * 80)
print("ACCURATE VERIFICATION: DATABASE ANSWERS vs OFFICIAL PDF ANSWER KEYS")
print("=" * 80)

total_checked = 0
total_matched = 0
mismatches = []

def extract_answers_proper(pdf_path):
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
    
    answers = {}
    q_count = 0
    for j in range(0, len(parts) - 1, 2):
        q_count += 1
        ans = parts[j+1].strip().upper()
        answers[q_count] = ans
    return answers

for pid, shift_name, candidates in pdf_mapping:
    pdf_path = None
    for c in candidates:
        if os.path.exists(c):
            pdf_path = c
            break
            
    if not pdf_path:
        print(f"⚠️ {shift_name}: PDF not found.")
        continue
        
    pdf_answers = extract_answers_proper(pdf_path)
    p_data = db_papers_dict.get(pid)
    if not p_data:
        continue
        
    db_questions = p_data["questions"]
    num_to_letter = {"1": "A", "2": "B", "3": "C", "4": "D"}
    
    matches_this_paper = 0
    paper_mismatches = []
    
    for q in db_questions:
        qnum = q["question_number"]
        db_raw = str(q.get("correct_answer", "")).strip().upper()
        db_letter = num_to_letter.get(db_raw, db_raw)
        
        pdf_letter = pdf_answers.get(qnum)
        if pdf_letter:
            total_checked += 1
            if db_letter == pdf_letter:
                matches_this_paper += 1
                total_matched += 1
            else:
                mismatches.append((pid, shift_name, qnum, db_letter, pdf_letter))
                paper_mismatches.append((qnum, db_letter, pdf_letter))
                
    print(f"📄 Paper ID {pid:2d} ({shift_name:18s}): {matches_this_paper:3d}/{len(pdf_answers)} matched perfectly!")
    if paper_mismatches:
        for pm in paper_mismatches:
            print(f"     ❌ Q{pm[0]}: DB has {pm[1]}, PDF has {pm[2]}")

print("=" * 80)
print(f"TOTAL QUESTIONS CHECKED : {total_checked}")
print(f"TOTAL MATCHES           : {total_matched}")
print(f"TOTAL MISMATCHES        : {len(mismatches)}")
print(f"ACCURACY RATE           : {(total_matched / total_checked * 100):.2f}%")
print("=" * 80)
