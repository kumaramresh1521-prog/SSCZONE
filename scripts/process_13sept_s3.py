import fitz
import re
import sys
import json
import os

sys.stdout.reconfigure(encoding='utf-8')

pdf_path = r"C:\Users\Admin\Downloads\SSC CGL, 2025 Official Paper (Held On_ 13 Sept, 2025 Shift 3).pdf"
print(f"Loading: {pdf_path}")
doc = fitz.open(pdf_path)
print(f"Total Pages: {len(doc)}")

start_pno = 0
for pno in range(min(4, len(doc))):
    txt = doc[pno].get_text()
    if "Q1." in txt or "General Intelligence" in txt:
        start_pno = pno
        break

print(f"Questions start on page: {start_pno + 1}")

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

all_questions = []
for j in range(0, len(parts) - 1, 2):
    q_raw = parts[j].strip()
    ans = parts[j+1].strip().upper()

    opt_matches = list(re.finditer(r'(?:^|\n)\s*([A-D])[\)\.]', q_raw))
    if len(opt_matches) >= 4:
        last_4_opts = opt_matches[-4:]
        statement = q_raw[:last_4_opts[0].start()].strip()

        opts = {}
        for o_i, m in enumerate(last_4_opts):
            label = m.group(1).upper()
            start_p = m.end()
            end_p = last_4_opts[o_i + 1].start() if o_i + 1 < len(last_4_opts) else len(q_raw)
            val = q_raw[start_p:end_p].strip().replace('\n', ' ')
            opts[label] = val if val else f"Option {label}"

        statement_clean = re.sub(r'^Q\d+\.\s*', '', statement).strip()

        q_num = len(all_questions) + 1
        all_questions.append({
            "question_number": q_num,
            "question_text": statement_clean.replace('\n', ' '),
            "option_a": opts.get("A", "Option A"),
            "option_b": opts.get("B", "Option B"),
            "option_c": opts.get("C", "Option C"),
            "option_d": opts.get("D", "Option D"),
            "correct_answer": ans
        })

print(f"Extracted {len(all_questions)} questions.")

# Audit Pass 1
issues = []
for q in all_questions:
    n = q["question_number"]
    txt = q["question_text"]
    opts = [q["option_a"], q["option_b"], q["option_c"], q["option_d"]]
    
    if len(txt) < 15:
        issues.append((n, f"Very short text: '{txt}'"))
    for o_lbl, o_val in zip(["A", "B", "C", "D"], opts):
        if not o_val or o_val.strip() == "" or o_val == f"Option {o_lbl}":
            issues.append((n, f"Empty or placeholder option {o_lbl}: '{o_val}'"))
    if "  of " in txt or " =   " in txt or "( )" in txt:
        issues.append((n, f"Likely missing math fraction / blank: '{txt[:80]}'"))

print(f"\n=== AUDIT PASS 1 (13 Sept Shift 3): {len(issues)} flagged items ===")
for iss in issues:
    print(f"  • Q{iss[0]}: {iss[1]}")

os.makedirs("tmp", exist_ok=True)
with open("tmp/13sept_s3_raw.json", "w", encoding="utf-8") as f:
    json.dump(all_questions, f, ensure_ascii=False, indent=2)
