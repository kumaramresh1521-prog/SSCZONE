import fitz
import re
import os
import sys

sys.stdout.reconfigure(encoding='utf-8')

def extract_page_blocks_smart(page):
    blocks = page.get_text("blocks")
    valid_blocks = [b for b in blocks if b[4].strip()]
    
    # Check for horizontal split by section header (y > 140)
    y_split = None
    for b in valid_blocks:
        txt = b[4].strip().upper()
        if any(h in txt for h in ["GENERAL INTELLIGENCE", "GENERAL AWARENESS", "QUANTITATIVE APTITUDE", "ENGLISH LANGUAGE"]):
            if b[1] > 140:
                y_split = b[1]
                break
                
    if y_split:
        top_blocks = [b for b in valid_blocks if b[3] <= y_split]
        bot_blocks = [b for b in valid_blocks if b[1] >= y_split]
        
        t_left = sorted([b for b in top_blocks if (b[0]+b[2])/2 < 305], key=lambda b: b[1])
        t_right = sorted([b for b in top_blocks if (b[0]+b[2])/2 >= 305], key=lambda b: b[1])
        b_left = sorted([b for b in bot_blocks if (b[0]+b[2])/2 < 305], key=lambda b: b[1])
        b_right = sorted([b for b in bot_blocks if (b[0]+b[2])/2 >= 305], key=lambda b: b[1])
        
        ordered = t_left + t_right + b_left + b_right
    else:
        left = sorted([b for b in valid_blocks if (b[0]+b[2])/2 < 305], key=lambda b: b[1])
        right = sorted([b for b in valid_blocks if (b[0]+b[2])/2 >= 305], key=lambda b: b[1])
        ordered = left + right
        
    return "\n".join(b[4] for b in ordered)

def extract_full_text(doc):
    full = ""
    for p_idx in range(1, len(doc)):
        full += "\n" + extract_page_blocks_smart(doc[p_idx])
    return full

def parse_100_questions(doc):
    full_text = extract_full_text(doc)
    
    # Locate all 100 questions by 1..100
    # To handle 01. or 1.
    matches = list(re.finditer(r"(?:^|\n)\s*(?:0(?=[1-9]\.))?(\d{1,3})\.\s*", full_text))
    
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
        next_start = q_spans[i + 1][1] if i + 1 < len(q_spans) else len(full_text)
        block = full_text[end:next_start].strip()
        
        # Ans regex: "Ans: A" or "Ans : (A)"
        ans_m = re.search(r"(?:^|\n|\s)\s*Ans\s*[:\-]\s*\(?([A-D])\)?", block, re.I)
        ans = ans_m.group(1).upper() if ans_m else "A"
        
        body = re.sub(r"(?:^|\n|\s)\s*Ans\s*[:\-]\s*\(?[A-D]\)?.*", "", block, flags=re.I).strip()
        
        # Clean page headers and section headings
        lines = [l.strip() for l in body.split("\n") if l.strip() and not re.match(r"^SSC CGL \d{4}", l.strip(), re.I)]
        clean_body = "\n".join(lines)
        
        # Find Option Markers: (A), (B), (C), (D)
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
            # Fallback 1: Split on (A), (B), (C), (D)
            parts = re.split(r"(?:^|\n|\s)\([A-D]\)\s*", clean_body)
            if len(parts) >= 5:
                q_text = parts[0].strip()
                opts['A'] = parts[1].strip()
                opts['B'] = parts[2].strip()
                opts['C'] = parts[3].strip()
                opts['D'] = parts[4].strip()
            else:
                q_text = clean_body
                
        # If question text is empty (diagram / figure questions):
        if not q_text.strip():
            # Check if this is an image/diagram problem
            q_text = "Refer to the given figure / diagram and select the correct option:"
            
        # Clean up options
        for k in ['A', 'B', 'C', 'D']:
            opts[k] = opts[k].replace("\n", " ").strip()
            # If option text empty or just whitespace
            if not opts[k]:
                opts[k] = f"Option {k}"
                
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

test_files = [
    r"F:\startup  send mail\2026\SSC CGL 2026 (Held On_ 30 Sep 2026 Shift 2).pdf",
    r"F:\startup  send mail\2026\SSC CGL 2026 (Held On_ 30 Sep 2026 Shift 3).pdf",
    r"F:\startup  send mail\2026\SSC CGL 2026 (Held On_ 1 Oct 2026 Shift 2).pdf",
    r"F:\startup  send mail\2026\SSC CGL 2026 (Held On_ 1 Oct 2026 Shift 3).pdf"
]

for f in test_files:
    fname = os.path.basename(f)
    doc = fitz.open(f)
    qs = parse_100_questions(doc)
    valid = sum(1 for q in qs if q["question_text"] and q["option_a"] and q["option_b"] and q["option_c"] and q["option_d"] and q["correct_answer"])
    print(f"{fname}: {valid} / {len(qs)} valid questions")
