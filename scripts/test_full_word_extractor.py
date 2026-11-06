import fitz
import re
import sys
import os

sys.path.append(os.path.abspath("."))
sys.stdout.reconfigure(encoding='utf-8')

pdf_path = r"F:\startup  send mail\2026\SSC CGL 2026 (Held On_ 30 Sep 2026 Shift 2).pdf"
doc = fitz.open(pdf_path)

def group_words_to_lines(col_words):
    if not col_words:
        return ""
    col_words = sorted(col_words, key=lambda w: (w[1], w[0]))
    lines = []
    for w in col_words:
        placed = False
        for line in lines:
            line_y0 = min(item[1] for item in line)
            line_y1 = max(item[3] for item in line)
            line_mid = (line_y0 + line_y1) / 2
            w_mid = (w[1] + w[3]) / 2
            if abs(w_mid - line_mid) < 5 or abs(w[1] - line_y0) < 5:
                line.append(w)
                placed = True
                break
        if not placed:
            lines.append([w])
            
    lines.sort(key=lambda l: min(item[1] for item in l))
    res = []
    for l in lines:
        l.sort(key=lambda item: item[0])
        line_str = " ".join(item[4] for item in l)
        res.append(line_str)
    return "\n".join(res)

def extract_page_text(page):
    blocks = page.get_text("blocks")
    valid_blocks = [b for b in blocks if b[4].strip()]
    
    # Section header check (y > 140)
    y_split = None
    for b in valid_blocks:
        txt = b[4].strip().upper()
        if any(h in txt for h in ["GENERAL INTELLIGENCE", "GENERAL AWARENESS", "QUANTITATIVE APTITUDE", "ENGLISH LANGUAGE"]):
            if b[1] > 140:
                y_split = b[1]
                break
                
    words = page.get_text("words")
    # filter header and footer banner
    content_words = [w for w in words if w[1] > 55 and w[3] < 785]
    
    if y_split:
        top_words = [w for w in content_words if w[3] <= y_split]
        bot_words = [w for w in content_words if w[1] >= y_split]
        
        t_l = group_words_to_lines([w for w in top_words if (w[0]+w[2])/2 < 305])
        t_r = group_words_to_lines([w for w in top_words if (w[0]+w[2])/2 >= 305])
        b_l = group_words_to_lines([w for w in bot_words if (w[0]+w[2])/2 < 305])
        b_r = group_words_to_lines([w for w in bot_words if (w[0]+w[2])/2 >= 305])
        return f"{t_l}\n{t_r}\n{b_l}\n{b_r}"
    else:
        l = group_words_to_lines([w for w in content_words if (w[0]+w[2])/2 < 305])
        r = group_words_to_lines([w for w in content_words if (w[0]+w[2])/2 >= 305])
        return f"{l}\n{r}"

full_text = ""
for p in range(1, len(doc)):
    full_text += "\n" + extract_page_text(doc[p])

# Test question parsing
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

print(f"Sequentially found: {len(q_spans)} / 100")

parsed = []
for i in range(len(q_spans)):
    q_num, start, end = q_spans[i]
    next_start = q_spans[i + 1][1] if i + 1 < len(q_spans) else len(full_text)
    block = full_text[end:next_start].strip()
    
    ans_m = re.search(r"(?:^|\n|\s)\s*Ans\s*[:\-]\s*\(?([A-D])\)?", block, re.I)
    ans = ans_m.group(1).upper() if ans_m else "A"
    body = re.sub(r"(?:^|\n|\s)\s*Ans\s*[:\-]\s*\(?[A-D]\)?.*", "", block, flags=re.I).strip()
    
    # Filter header titles
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
            
    for k in ['A', 'B', 'C', 'D']:
        opts[k] = opts[k].replace("\n", " ").strip()
        if not opts[k]:
            opts[k] = f"Option {k}"
            
    parsed.append({
        "q_num": q_num,
        "q_text": q_text,
        "a": opts['A'],
        "b": opts['B'],
        "c": opts['C'],
        "d": opts['D'],
        "ans": ans
    })

valid = sum(1 for q in parsed if q["q_text"] and q["a"] != "Option A" and q["b"] != "Option B" and q["c"] != "Option C" and q["d"] != "Option D")
print(f"Questions with full text options: {valid} / 100")

# Check Q.65, Q.68, Q.70 specifically
for q in parsed:
    if q["q_num"] in [65, 68, 70]:
        print(f"\n--- Q.{q['q_num']} ---")
        print("Text:", q["q_text"])
        print("A:", q["a"])
        print("B:", q["b"])
        print("C:", q["c"])
        print("D:", q["d"])
        print("Ans:", q["ans"])
