import fitz
import re
import os
import glob
import json
import sys

sys.stdout.reconfigure(encoding='utf-8')

pdf_dir = r"F:\startup  send mail\2026"
pdf_files = sorted(glob.glob(os.path.join(pdf_dir, "*.pdf")))

print(f"Total PDFs to process: {len(pdf_files)}")

def extract_ordered_text(doc):
    full_doc_text = ""
    for page_idx in range(1, len(doc)):
        page = doc[page_idx]
        blocks = page.get_text("blocks")
        valid_blocks = [b for b in blocks if b[4].strip()]
        
        # Check for section header that divides the page horizontally
        section_headers = [b for b in valid_blocks if any(h in b[4].strip().upper() for h in [
            "GENERAL INTELLIGENCE", "GENERAL AWARENESS", "QUANTITATIVE APTITUDE", "ENGLISH LANGUAGE"
        ])]
        
        y_split = None
        for h in section_headers:
            if h[1] > 140:
                y_split = h[1]
                break
                
        if y_split:
            top_blocks = [b for b in valid_blocks if b[3] <= y_split]
            bottom_blocks = [b for b in valid_blocks if b[1] >= y_split]
            
            top_left = sorted([b for b in top_blocks if (b[0]+b[2])/2 < 305], key=lambda b: b[1])
            top_right = sorted([b for b in top_blocks if (b[0]+b[2])/2 >= 305], key=lambda b: b[1])
            
            bot_left = sorted([b for b in bottom_blocks if (b[0]+b[2])/2 < 305], key=lambda b: b[1])
            bot_right = sorted([b for b in bottom_blocks if (b[0]+b[2])/2 >= 305], key=lambda b: b[1])
            
            page_ordered = top_left + top_right + bot_left + bot_right
        else:
            left = sorted([b for b in valid_blocks if (b[0]+b[2])/2 < 305], key=lambda b: b[1])
            right = sorted([b for b in valid_blocks if (b[0]+b[2])/2 >= 305], key=lambda b: b[1])
            page_ordered = left + right
            
        for b in page_ordered:
            full_doc_text += b[4] + "\n"
            
    return full_doc_text

def parse_questions_from_text(text):
    # Locate question numbering 1..100
    matches = list(re.finditer(r"(?:^|\n)\s*0?(\d{1,3})\.\s*", text))
    
    q_spans = []
    expected = 1
    for m in matches:
        n = int(m.group(1))
        if n == expected:
            q_spans.append((n, m.start(), m.end()))
            expected += 1
            if expected > 100:
                break
                
    questions = []
    for i in range(len(q_spans)):
        q_num, start, end = q_spans[i]
        next_start = q_spans[i + 1][1] if i + 1 < len(q_spans) else len(text)
        block = text[end:next_start].strip()
        
        # Ans regex
        ans_m = re.search(r"(?:^|\n|\s)\s*Ans\s*[:\-]\s*\(?([A-D])\)?", block, re.I)
        ans = ans_m.group(1).upper() if ans_m else "A"
        
        body = re.sub(r"(?:^|\n|\s)\s*Ans\s*[:\-]\s*\(?[A-D]\)?.*", "", block, flags=re.I).strip()
        
        # Clean out common page artifact lines like "SSC CGL 2026...", headers, page numbers
        body_lines = [l.strip() for l in body.split("\n") if l.strip() and not re.match(r"^SSC CGL \d{4}", l.strip(), re.I)]
        clean_body = "\n".join(body_lines)
        
        # Extract Options (A), (B), (C), (D)
        # Handle cases where (A) is followed by option text, or option text precedes (A)
        opt_matches = list(re.finditer(r"(?:^|\n|\s)\(([A-D])\)\s*", clean_body))
        
        q_text = ""
        opts = {'A': '', 'B': '', 'C': '', 'D': ''}
        
        if len(opt_matches) >= 4:
            q_text = clean_body[:opt_matches[0].start()].strip()
            for o_i in range(len(opt_matches)):
                letter = opt_matches[o_i].group(1).upper()
                o_start = opt_matches[o_i].end()
                o_end = opt_matches[o_i + 1].start() if o_i + 1 < len(opt_matches) else len(clean_body)
                opts[letter] = clean_body[o_start:o_end].strip()
        else:
            parts = re.split(r"(?:^|\n|\s)\([A-D]\)\s*", clean_body)
            if len(parts) >= 5:
                q_text = parts[0].strip()
                opts['A'] = parts[1].strip()
                opts['B'] = parts[2].strip()
                opts['C'] = parts[3].strip()
                opts['D'] = parts[4].strip()
            else:
                q_text = clean_body
                
        questions.append({
            "question_number": q_num,
            "question_text": q_text,
            "option_a": opts['A'],
            "option_b": opts['B'],
            "option_c": opts['C'],
            "option_d": opts['D'],
            "correct_answer": ans
        })
        
    return questions

# Test on all files
report = []
for p_idx, pdf_path in enumerate(pdf_files):
    fname = os.path.basename(pdf_path)
    if "1 Oct 2026 Shift 1" in fname:
        continue # handle Hindi file separately
    
    doc = fitz.open(pdf_path)
    text = extract_ordered_text(doc)
    qs = parse_questions_from_text(text)
    
    valid_count = sum(1 for q in qs if q["question_text"] and q["option_a"] and q["option_b"] and q["option_c"] and q["option_d"] and q["correct_answer"])
    
    report.append({
        "file": fname,
        "total_parsed": len(qs),
        "valid_count": valid_count
    })
    print(f"[{p_idx+1}/29] {fname} => Total: {len(qs)}, Valid: {valid_count}")

all_valid = sum(1 for r in report if r["valid_count"] == 100)
print(f"\nPAPERS WITH 100/100 VALID QUESTIONS: {all_valid} / {len(report)}")
