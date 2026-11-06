import fitz
import re
import sys

sys.stdout.reconfigure(encoding='utf-8')

pdf_path = r"F:\startup  send mail\2026\SSC CGL 2026 (Held On_ 30 Sep 2026 Shift 2).pdf"
doc = fitz.open(pdf_path)

# Extract page-by-page, column-by-column or section-by-section
# Notice each page has two columns: Left and Right.
# Within each section, questions flow:
# Let's inspect block sequence for each question:
all_questions = []

# To make text extraction 100% robust for 2 columns:
# For each page, split blocks into sections or columns:
# A block is left if (x0+x1)/2 < 305 else right.
# But if there is a full-width header (like GENERAL AWARENESS), it divides the page into Top and Bottom!
# Let's test a simple, elegant algorithm:
full_doc_text = ""
for page_idx in range(1, len(doc)):
    page = doc[page_idx]
    blocks = page.get_text("blocks")
    valid_blocks = [b for b in blocks if b[4].strip()]
    
    # Check if there is a horizontal divider/section title
    # e.g. "GENERAL AWARENESS", "QUANTITATIVE APTITUDE", "ENGLISH LANGUAGE"
    section_headers = [b for b in valid_blocks if any(h in b[4].strip().upper() for h in [
        "GENERAL INTELLIGENCE", "GENERAL AWARENESS", "QUANTITATIVE APTITUDE", "ENGLISH LANGUAGE"
    ])]
    
    # If a section header exists, sort blocks before it, then header, then blocks after it!
    # Let's see: on Page 4, GENERAL AWARENESS header is at some y:
    y_split = None
    for h in section_headers:
        # if header is not at the very top (y > 150)
        if h[1] > 150:
            y_split = h[1]
            break
            
    if y_split:
        top_blocks = [b for b in valid_blocks if b[3] <= y_split]
        bottom_blocks = [b for b in valid_blocks if b[1] >= y_split]
        
        # Sort top: left then right
        top_left = sorted([b for b in top_blocks if (b[0]+b[2])/2 < 305], key=lambda b: b[1])
        top_right = sorted([b for b in top_blocks if (b[0]+b[2])/2 >= 305], key=lambda b: b[1])
        
        # Sort bottom: left then right
        bot_left = sorted([b for b in bottom_blocks if (b[0]+b[2])/2 < 305], key=lambda b: b[1])
        bot_right = sorted([b for b in bottom_blocks if (b[0]+b[2])/2 >= 305], key=lambda b: b[1])
        
        page_ordered = top_left + top_right + bot_left + bot_right
    else:
        left = sorted([b for b in valid_blocks if (b[0]+b[2])/2 < 305], key=lambda b: b[1])
        right = sorted([b for b in valid_blocks if (b[0]+b[2])/2 >= 305], key=lambda b: b[1])
        page_ordered = left + right
        
    for b in page_ordered:
        full_doc_text += b[4] + "\n"

print("Ordered full text length:", len(full_doc_text))

# Now test finding 1 to 100 in this text!
matches = list(re.finditer(r"(?:^|\n)\s*0?(\d{1,3})\.\s*", full_doc_text))
matched_nums = [int(m.group(1)) for m in matches]

q_spans = []
expected = 1
for m in matches:
    n = int(m.group(1))
    if n == expected:
        q_spans.append((n, m.start(), m.end()))
        expected += 1
        if expected > 100:
            break

print(f"Sequentially found: {len(q_spans)} / 100")

# Parse each question
parsed = []
for i in range(len(q_spans)):
    q_num, start, end = q_spans[i]
    next_start = q_spans[i + 1][1] if i + 1 < len(q_spans) else len(full_doc_text)
    block = full_doc_text[end:next_start].strip()
    
    # Extract Ans
    ans_m = re.search(r"(?:^|\n|\s)\s*Ans\s*[:\-]\s*\(?([A-D])\)?", block, re.I)
    ans = ans_m.group(1).upper() if ans_m else "A"
    
    body = re.sub(r"(?:^|\n|\s)\s*Ans\s*[:\-]\s*\(?[A-D]\)?.*", "", block, flags=re.I).strip()
    
    # Extract options (A), (B), (C), (D)
    opt_matches = list(re.finditer(r"(?:^|\n|\s)\(([A-D])\)\s*", body))
    
    q_text = ""
    opts = {}
    if len(opt_matches) >= 4:
        q_text = body[:opt_matches[0].start()].strip()
        for o_i in range(len(opt_matches)):
            letter = opt_matches[o_i].group(1).upper()
            o_start = opt_matches[o_i].end()
            o_end = opt_matches[o_i + 1].start() if o_i + 1 < len(opt_matches) else len(body)
            opts[letter] = body[o_start:o_end].strip()
    else:
        # Fallback splitting
        parts = re.split(r"(?:^|\n|\s)\([A-D]\)\s*", body)
        if len(parts) >= 5:
            q_text = parts[0].strip()
            opts['A'] = parts[1].strip()
            opts['B'] = parts[2].strip()
            opts['C'] = parts[3].strip()
            opts['D'] = parts[4].strip()
        else:
            q_text = body
            
    parsed.append({
        "q_num": q_num,
        "q_text": q_text,
        "opt_a": opts.get("A", ""),
        "opt_b": opts.get("B", ""),
        "opt_c": opts.get("C", ""),
        "opt_d": opts.get("D", ""),
        "ans": ans
    })

valid = sum(1 for q in parsed if q["q_text"] and q["opt_a"] and q["opt_b"] and q["opt_c"] and q["opt_d"] and q["ans"])
print(f"VALID QUESTIONS: {valid} / {len(parsed)}")
if valid < 100:
    for q in parsed:
        if not (q["q_text"] and q["opt_a"] and q["opt_b"] and q["opt_c"] and q["opt_d"]):
            print(f"Q.{q['q_num']}: text_len={len(q['q_text'])}, A='{q['opt_a'][:20]}', B='{q['opt_b'][:20]}', C='{q['opt_c'][:20]}', D='{q['opt_d'][:20]}'")
