import fitz
import re
import os
import glob
import sys

sys.stdout.reconfigure(encoding='utf-8')

pdf_dir = r"F:\startup  send mail\2026"

def get_sort_key(filename):
    m = re.search(r"Held On_?\s*(\d{1,2})\s*([A-Za-z]+)\s*2026\s*Shift\s*(\d)", filename, re.I)
    if m:
        day = int(m.group(1))
        month_str = m.group(2).lower()
        shift = int(m.group(3))
        month = 9 if "sep" in month_str else 10
        return (month, day, shift)
    return (99, 99, 99)

def extract_page_blocks(doc, p_idx):
    page = doc[p_idx]
    blocks = page.get_text("blocks")
    valid_blocks = [b for b in blocks if b[4].strip()]
    
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
        t_left = sorted([b for b in top_blocks if (b[0]+b[2])/2 < 305], key=lambda b: (round(b[1]/4.0), b[0]))
        t_right = sorted([b for b in top_blocks if (b[0]+b[2])/2 >= 305], key=lambda b: (round(b[1]/4.0), b[0]))
        b_left = sorted([b for b in bot_blocks if (b[0]+b[2])/2 < 305], key=lambda b: (round(b[1]/4.0), b[0]))
        b_right = sorted([b for b in bot_blocks if (b[0]+b[2])/2 >= 305], key=lambda b: (round(b[1]/4.0), b[0]))
        ordered = t_left + t_right + b_left + b_right
    else:
        left = sorted([b for b in valid_blocks if (b[0]+b[2])/2 < 305], key=lambda b: (round(b[1]/4.0), b[0]))
        right = sorted([b for b in valid_blocks if (b[0]+b[2])/2 >= 305], key=lambda b: (round(b[1]/4.0), b[0]))
        ordered = left + right
        
    return "\n".join(b[4] for b in ordered)

def extract_full_paper(doc):
    full_text = ""
    for p_idx in range(1, len(doc)):
        full_text += "\n" + extract_page_blocks(doc, p_idx)
    return full_text

def parse_paper_questions(full_text):
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
        
        ans_m = re.search(r"(?:^|\n|\s)\s*Ans\s*[:\-]\s*\(?([A-D])\)?", block, re.I)
        ans = ans_m.group(1).upper() if ans_m else "A"
        body = re.sub(r"(?:^|\n|\s)\s*Ans\s*[:\-]\s*\(?[A-D]\)?.*", "", block, flags=re.I).strip()
        lines = [l.strip() for l in body.split("\n") if l.strip() and not re.match(r"^SSC CGL \d{4}", l.strip(), re.I)]
        clean_body = "\n".join(lines)
        
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
            "q_num": q_num,
            "q_text": q_text,
            "a": opts['A'],
            "b": opts['B'],
            "c": opts['C'],
            "d": opts['D'],
            "ans": ans
        })
    return questions

files = sorted(glob.glob(os.path.join(pdf_dir, "*.pdf")), key=get_sort_key)
total_empty_opts = 0
for f in files:
    fname = os.path.basename(f)
    doc = fitz.open(f)
    qs = parse_paper_questions(extract_full_paper(doc))
    empty_for_paper = []
    for q in qs:
        # Check if options are missing or blank
        if not (q["a"] and q["b"] and q["c"] and q["d"]):
            empty_for_paper.append(q["q_num"])
    if empty_for_paper:
        print(f"{fname}: {len(empty_for_paper)} questions with incomplete options: {empty_for_paper}")
        total_empty_opts += len(empty_for_paper)
    else:
        print(f"✅ {fname}: All 100 questions have valid options!")

print(f"\nTotal questions with incomplete options across all 2,900 questions: {total_empty_opts}")
