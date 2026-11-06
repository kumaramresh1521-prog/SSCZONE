import fitz
import re
import sys

sys.stdout.reconfigure(encoding='utf-8')

pdf_path = r"F:\startup  send mail\2026\SSC CGL 2026 (Held On_ 30 Sep 2026 Shift 2).pdf"
doc = fitz.open(pdf_path)

# Extract column-aware or block-aware text
full_text = ""
for page_num in range(1, len(doc)):
    page = doc[page_num]
    # get_text('text', sort=True) or default
    full_text += "\n" + page.get_text()

# Clean up header lines like "SSC CGL 2026 (HELD ON: ...)" and section names
lines = full_text.split("\n")
cleaned_lines = []
for l in lines:
    stripped = l.strip()
    if re.match(r"^SSC CGL \d{4}\s*\(HELD ON", stripped, re.I):
        continue
    if stripped.upper() in ["GENERAL INTELLIGENCE", "GENERAL AWARENESS", "QUANTITATIVE APTITUDE", "QUANTITATIVE APTITUDE (BASIC ARITHMETIC SKILL)", "ENGLISH LANGUAGE", "ENGLISH LANGUAGE (BASIC KNOWLEDGE)"]:
        continue
    cleaned_lines.append(l)

clean_text = "\n".join(cleaned_lines)

# Split into questions by looking for numbers 01., 02., ... 100.
# We find indices of each Q marker
matches = list(re.finditer(r"(?:^|\n)\s*(\d{1,3})\.\s*", clean_text))
print("Found matches count:", len(matches))

# Filter matches so that numbers are in sequential order 1..100
q_spans = []
expected_num = 1
for m in matches:
    num = int(m.group(1))
    if num == expected_num:
        q_spans.append((num, m.start(), m.end()))
        expected_num += 1

print(f"Sequentially aligned questions: {len(q_spans)} / 100")

questions = []
for idx in range(len(q_spans)):
    q_num, start, end = q_spans[idx]
    next_start = q_spans[idx + 1][1] if idx + 1 < len(q_spans) else len(clean_text)
    block = clean_text[end:next_start].strip()
    
    # Extract options and answer
    # Ans: Option or Ans: A / Ans: B
    ans_m = re.search(r"(?:^|\n)\s*Ans\s*[:\-]\s*\(?([A-D])\)?", block, re.I)
    correct_ans = ans_m.group(1).upper() if ans_m else None
    
    # Remove Ans line from block for option extraction
    content_without_ans = re.sub(r"(?:^|\n)\s*Ans\s*[:\-]\s*\(?[A-D]\)?.*", "", block, flags=re.I).strip()
    
    # Find options (A), (B), (C), (D)
    opt_matches = list(re.finditer(r"(?:^|\n|\s)\(([A-D])\)\s*", content_without_ans))
    
    q_text = ""
    opt_a, opt_b, opt_c, opt_d = "", "", "", ""
    
    if len(opt_matches) >= 4:
        # Sort option matches by position
        q_text = content_without_ans[:opt_matches[0].start()].strip()
        opts = {}
        for o_i in range(len(opt_matches)):
            letter = opt_matches[o_i].group(1).upper()
            o_start = opt_matches[o_i].end()
            o_end = opt_matches[o_i + 1].start() if o_i + 1 < len(opt_matches) else len(content_without_ans)
            opts[letter] = content_without_ans[o_start:o_end].strip()
        
        opt_a = opts.get("A", "")
        opt_b = opts.get("B", "")
        opt_c = opts.get("C", "")
        opt_d = opts.get("D", "")
    else:
        # Fallback regex
        pass

    questions.append({
        "q_num": q_num,
        "q_text": q_text,
        "opt_a": opt_a,
        "opt_b": opt_b,
        "opt_c": opt_c,
        "opt_d": opt_d,
        "ans": correct_ans
    })

valid_count = sum(1 for q in questions if q["q_text"] and q["opt_a"] and q["opt_b"] and q["opt_c"] and q["opt_d"] and q["ans"])
print(f"Valid questions extracted: {valid_count} / {len(questions)}")

if valid_count < 100:
    for q in questions:
        if not (q["q_text"] and q["opt_a"] and q["opt_b"] and q["opt_c"] and q["opt_d"] and q["ans"]):
            print(f"Issue with Q.{q['q_num']}: text_len={len(q['q_text'])}, A={bool(q['opt_a'])}, B={bool(q['opt_b'])}, C={bool(q['opt_c'])}, D={bool(q['opt_d'])}, Ans={q['ans']}")
