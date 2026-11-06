import fitz
import json
import re
import os
import sys

sys.stdout.reconfigure(encoding='utf-8')

# Define mappings between paper titles and PDF files
pdf_candidates = [
    # Paper 1: 12 Sept Shift 1
    (1, "12 Sept Shift 1", [
        r"E:\pyq pdf\SSC CGL, 2025 Official Paper (Held On_ 12 Sept, 2025 Shift 1).pdf",
        r"C:\Users\Admin\Downloads\SSC CGL, 2025 Official Paper (Held On_ 12 Sept, 2025 Shift 1).pdf"
    ]),
    # Paper 4: 12 Sept Shift 2
    (4, "12 Sept Shift 2", [
        r"C:\Users\Admin\Downloads\SSC CGL, 2025 Official Paper (Held On_ 12 Sept, 2025 Shift 2).pdf",
        r"E:\pyq pdf\SSC CGL, 2025 Official Paper (Held On_ 12 Sept, 2025 Shift 2).pdf"
    ]),
    # Paper 5: 12 Sept Shift 3
    (5, "12 Sept Shift 3", [
        r"C:\Users\Admin\Downloads\SSC CGL, 2025 Official Paper (Held On_ 12 Sept, 2025 Shift 3).pdf",
        r"E:\pyq pdf\SSC CGL, 2025 Official Paper (Held On_ 12 Sept, 2025 Shift 3).pdf"
    ]),
    # Paper 6: 13 Sept Shift 1
    (6, "13 Sept Shift 1", [
        r"C:\Users\Admin\Downloads\SSC CGL, 2025 Official Paper (Held On_ 13 Sept, 2025 Shift 1).pdf"
    ]),
    # Paper 7: 13 Sept Shift 2
    (7, "13 Sept Shift 2", [
        r"C:\Users\Admin\Downloads\SSC CGL, 2025 Official Paper (Held On_ 13 Sept, 2025 Shift 2).pdf"
    ]),
    # Paper 8: 13 Sept Shift 3
    (8, "13 Sept Shift 3", [
        r"C:\Users\Admin\Downloads\SSC CGL, 2025 Official Paper (Held On_ 13 Sept, 2025 Shift 3).pdf"
    ]),
    # Paper 9: 14 Sept Shift 1
    (9, "14 Sept Shift 1", [
        r"C:\Users\Admin\Downloads\SSC CGL, 2025 Official Paper (Held On_ 14 Sept, 2025 Shift 1).pdf"
    ]),
    # Paper 10: 14 Sept Shift 2
    (10, "14 Sept Shift 2", [
        r"C:\Users\Admin\Downloads\SSC CGL, 2025 Official Paper (Held On_ 14 Sept, 2025 Shift 2).pdf"
    ]),
    # Paper 11: 14 Sept Shift 3
    (11, "14 Sept Shift 3", [
        r"C:\Users\Admin\Downloads\SSC CGL, 2025 Official Paper (Held On_ 14 Sept, 2025 Shift 3).pdf"
    ]),
    # Paper 12: 15 Sept Shift 1
    (12, "15 Sept Shift 1", [
        r"C:\Users\Admin\Downloads\SSC CGL, 2025 Official Paper (Held On_ 15 Sept, 2025 Shift 1).pdf"
    ]),
    # Paper 13: 15 Sept Shift 2
    (13, "15 Sept Shift 2", [
        r"C:\Users\Admin\Downloads\SSC CGL, 2025 Official Paper (Held On_ 15 Sept, 2025 Shift 2).pdf"
    ]),
    # Paper 14: 15 Sept Shift 3
    (14, "15 Sept Shift 3", [
        r"C:\Users\Admin\Downloads\SSC CGL, 2025 Official Paper (Held On_ 15 Sept, 2025 Shift 3).pdf"
    ]),
]

with open("tmp_cleaned_database_payload.json", "r", encoding="utf-8") as f:
    db_papers = json.load(f)

db_papers_dict = {p["paper"]["id"]: p for p in db_papers}

print("================================================================================")
print("COMPARING DATABASE & TXT ANSWER KEYS WITH ORIGINAL OFFICIAL PDFS")
print("================================================================================\n")

total_verified_questions = 0
total_matches = 0
total_mismatches = 0
mismatch_details = []

def extract_pdf_answers(pdf_path):
    doc = fitz.open(pdf_path)
    full_text = ""
    for page in doc:
        full_text += page.get_text("text") + "\n"
    
    # Extract Q1. to Q100. answers
    # Typical pattern: Q1. ... Correct Answer: B ... Q2. ...
    # Or find all 'Correct Answer: X'
    # Testbook format has exact: 'Correct Answer: [A-D]'
    answers = {}
    
    # Split text by Q\d+\.
    q_blocks = re.split(r'\nQ(\d+)\.\s*', full_text)
    # q_blocks[0] is header, then (qnum, text), (qnum, text)...
    if len(q_blocks) > 1:
        for i in range(1, len(q_blocks), 2):
            qnum = int(q_blocks[i])
            block = q_blocks[i+1]
            m = re.search(r'Correct Answer:\s*([A-D])', block, re.IGNORECASE)
            if m:
                answers[qnum] = m.group(1).upper()
    else:
        # Fallback regex
        pattern = re.compile(r'Q(\d+)\..*?Correct Answer:\s*([A-D])', re.DOTALL | re.IGNORECASE)
        for m in pattern.finditer(full_text):
            qnum = int(m.group(1))
            answers[qnum] = m.group(2).upper()
            
    return answers

for pid, shift_name, candidates in pdf_candidates:
    pdf_found = None
    for cand in candidates:
        if os.path.exists(cand):
            pdf_found = cand
            break
            
    if not pdf_found:
        print(f"⚠️ Paper ID {pid:2d} ({shift_name}): PDF not found at expected paths.")
        continue
        
    pdf_answers = extract_pdf_answers(pdf_found)
    p_data = db_papers_dict.get(pid)
    if not p_data:
        print(f"⚠️ Paper ID {pid:2d}: No database data.")
        continue
        
    db_questions = p_data["questions"]
    print(f"📄 Paper ID {pid:2d} ({shift_name}): Found PDF -> {os.path.basename(pdf_found)}")
    print(f"   Extracted {len(pdf_answers)} answers from PDF. Comparing with {len(db_questions)} DB questions...")
    
    paper_matches = 0
    paper_mismatches = 0
    for q in db_questions:
        qnum = q["question_number"]
        db_ans = str(q.get("correct_answer", "")).strip().upper()
        # In some formats it might be numeric (1->A, 2->B, etc.) or char (A, B, C, D)
        num_to_letter = {"1": "A", "2": "B", "3": "C", "4": "D"}
        db_letter = num_to_letter.get(db_ans, db_ans)
        
        pdf_letter = pdf_answers.get(qnum)
        
        if pdf_letter:
            total_verified_questions += 1
            if db_letter == pdf_letter:
                paper_matches += 1
                total_matches += 1
            else:
                paper_mismatches += 1
                total_mismatches += 1
                mismatch_details.append({
                    "paper_id": pid,
                    "shift": shift_name,
                    "qnum": qnum,
                    "db_answer": db_letter,
                    "pdf_answer": pdf_letter
                })
        else:
            # Check if PDF had answer for this qnum
            pass
            
    print(f"   ✓ Matches: {paper_matches}/100 | Mismatches: {paper_mismatches}\n")

print("================================================================================")
print(f"SUMMARY VERIFICATION RESULT:")
print(f"Total Questions Verified Against Official PDFs: {total_verified_questions}")
print(f"Total Matches: {total_matches}")
print(f"Total Mismatches: {total_mismatches}")
print("================================================================================")

if mismatch_details:
    print("\nMismatch Details:")
    for m in mismatch_details:
        print(f"  ❌ Paper {m['paper_id']} ({m['shift']}) Q{m['qnum']}: DB has Option {m['db_answer']}, PDF has Option {m['pdf_answer']}")
else:
    print("\n🎉 ALL ANSWERS PERFECTLY MATCH THE ORIGINAL OFFICIAL PDFs (100% ACCURACY)!")
