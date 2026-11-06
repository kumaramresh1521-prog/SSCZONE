import fitz
import re
import os
import sys

sys.stdout.reconfigure(encoding='utf-8')

def extract_2column_text(doc):
    full_text = ""
    for page_idx in range(1, len(doc)): # skip cover
        page = doc[page_idx]
        blocks = page.get_text("blocks")
        
        # Filter out empty or tiny blocks
        valid_blocks = [b for b in blocks if b[4].strip()]
        
        # Determine column boundary: average center is around 295-305
        left_blocks = [b for b in valid_blocks if (b[0] + b[2]) / 2 < 305]
        right_blocks = [b for b in valid_blocks if (b[0] + b[2]) / 2 >= 305]
        
        # Sort vertically by y0
        left_blocks.sort(key=lambda b: b[1])
        right_blocks.sort(key=lambda b: b[1])
        
        page_text = ""
        for b in left_blocks:
            page_text += b[4] + "\n"
        for b in right_blocks:
            page_text += b[4] + "\n"
            
        full_text += "\n" + page_text
        
    return full_text

def parse_paper_text(full_text):
    # Remove header titles and section headings
    lines = full_text.split("\n")
    cleaned_lines = []
    for l in lines:
        s = l.strip()
        if re.match(r"^SSC CGL \d{4}\s*\(HELD ON", s, re.I):
            continue
        if s.upper() in ["GENERAL INTELLIGENCE", "GENERAL AWARENESS", "QUANTITATIVE APTITUDE", 
                         "QUANTITATIVE APTITUDE (BASIC ARITHMETIC SKILL)", "ENGLISH LANGUAGE", 
                         "ENGLISH LANGUAGE (BASIC KNOWLEDGE)"]:
            continue
        cleaned_lines.append(l)
    
    clean_text = "\n".join(cleaned_lines)
    
    # Locate all question starts: 01. or 1. up to 100.
    # To avoid matching inline numbers, match (?:^|\n)\s*0?(\d{1,3})\.\s*
    matches = list(re.finditer(r"(?:^|\n)\s*(?:0(?=[1-9]\.))?(\d{1,3})\.\s*", clean_text))
    
    q_spans = []
    expected_num = 1
    for m in matches:
        num = int(m.group(1))
        if num == expected_num:
            q_spans.append((num, m.start(), m.end()))
            expected_num += 1
            if expected_num > 100:
                break
                
    questions = []
    for idx in range(len(q_spans)):
        q_num, start, end = q_spans[idx]
        next_start = q_spans[idx + 1][1] if idx + 1 < len(q_spans) else len(clean_text)
        block = clean_text[end:next_start].strip()
        
        # Find Ans: [A-D]
        ans_m = re.search(r"(?:^|\n|\s)\s*Ans\s*[:\-]\s*\(?([A-D])\)?", block, re.I)
        correct_ans = ans_m.group(1).upper() if ans_m else "A"
        
        # Clean block from Ans
        body = re.sub(r"(?:^|\n|\s)\s*Ans\s*[:\-]\s*\(?[A-D]\)?.*", "", block, flags=re.I).strip()
        
        # Extract Options (A), (B), (C), (D)
        opt_matches = list(re.finditer(r"(?:^|\n|\s)\(([A-D])\)\s*", body))
        
        q_text = ""
        opt_a, opt_b, opt_c, opt_d = "", "", "", ""
        
        if len(opt_matches) >= 4:
            q_text = body[:opt_matches[0].start()].strip()
            opts = {}
            for o_i in range(len(opt_matches)):
                letter = opt_matches[o_i].group(1).upper()
                o_start = opt_matches[o_i].end()
                o_end = opt_matches[o_i + 1].start() if o_i + 1 < len(opt_matches) else len(body)
                opts[letter] = body[o_start:o_end].strip()
                
            opt_a = opts.get("A", "")
            opt_b = opts.get("B", "")
            opt_c = opts.get("C", "")
            opt_d = opts.get("D", "")
        else:
            # Fallback
            parts = re.split(r"(?:^|\n|\s)\([A-D]\)\s*", body)
            if len(parts) >= 5:
                q_text = parts[0].strip()
                opt_a = parts[1].strip()
                opt_b = parts[2].strip()
                opt_c = parts[3].strip()
                opt_d = parts[4].strip()
            else:
                q_text = body
                
        questions.append({
            "question_number": q_num,
            "question_text": q_text,
            "option_a": opt_a,
            "option_b": opt_b,
            "option_c": opt_c,
            "option_d": opt_d,
            "correct_answer": correct_ans
        })
        
    return questions

test_files = [
    r"F:\startup  send mail\2026\SSC CGL 2026 (Held On_ 30 Sep 2026 Shift 2).pdf",
    r"F:\startup  send mail\2026\SSC CGL 2026 (Held On_ 30 Sep 2026 Shift 3).pdf",
    r"F:\startup  send mail\2026\SSC CGL 2026 (Held On_ 1 Oct 2026 Shift 2).pdf"
]

for f in test_files:
    fname = os.path.basename(f)
    doc = fitz.open(f)
    text = extract_2column_text(doc)
    qs = parse_paper_text(text)
    
    valid = sum(1 for q in qs if q["question_text"] and q["option_a"] and q["option_b"] and q["option_c"] and q["option_d"] and q["correct_answer"])
    print(f"File: {fname}")
    print(f"  -> Total Questions Parsed: {len(qs)} / 100")
    print(f"  -> Valid Questions: {valid} / 100")
    if valid < 100:
        bad = [q for q in qs if not (q["question_text"] and q["option_a"] and q["option_b"] and q["option_c"] and q["option_d"] and q["correct_answer"])]
        print(f"  -> First bad question: Q.{bad[0]['question_number']}: text='{bad[0]['question_text'][:40]}', A='{bad[0]['option_a']}'")
