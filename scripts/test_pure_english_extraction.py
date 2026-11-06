import fitz
import re
import sys
import json

sys.stdout.reconfigure(encoding='utf-8')

pdf_path = r"F:\startup  send mail\SSC CGL, 2025 Official Paper (Held On_ 16 Sept, 2025 Shift 1).pdf"
doc = fitz.open(pdf_path)

# Detect start page
start_pno = 0
for pno in range(min(5, len(doc))):
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

print(f"Total parts split by Correct Answer: {len(parts)} (expected 201 for 100 questions)")

def extract_pure_english(text):
    if not text:
        return ""
    # In bilingual question text, English is typically before the Hindi translation.
    # Hindi text starts with Devanagari characters: [\u0900-\u097F].
    # But sometimes Hindi text quotes an English word, e.g. वाक्य "Reflections..."
    # So we find the first significant chunk of Hindi or where Hindi starts.
    # Let's inspect by lines or paragraphs.
    lines = text.split('\n')
    en_lines = []
    
    # Check if this question is purely English (e.g. Q76-Q100)
    has_hindi = bool(re.search(r'[\u0900-\u097F]', text))
    if not has_hindi:
        return " ".join(text.split())
        
    # If bilingual: find where Hindi text starts
    # Find the first index where a Devanagari character appears
    # However, sometimes an English passage has a stray character or none.
    # Usually: English statement ends, then Hindi statement begins.
    # Let's check the first char with ord >= 0x0900 and ord <= 0x097F
    m = re.search(r'[\u0900-\u097F]', text)
    if m:
        first_hi_idx = m.start()
        # English is before first_hi_idx
        en_part = text[:first_hi_idx].strip()
        # Clean up any trailing labels like "Statement 1", punctuation etc. if appropriate
        return " ".join(en_part.split())
    return " ".join(text.split())

def extract_pure_english_option(opt_text):
    if not opt_text:
        return ""
    opt = opt_text.strip()
    # If option has " / ", e.g. "Chile / चिली" or "15.5 litres / 15.5 लीटर"
    if " / " in opt:
        parts = opt.split(" / ")
        # English part is usually the first part if it doesn't contain Devanagari
        first_part = parts[0].strip()
        if not re.search(r'[\u0900-\u097F]', first_part):
            return first_part
        # Otherwise find part without Devanagari
        for p in parts:
            if not re.search(r'[\u0900-\u097F]', p):
                return p.strip()
    # If option contains Devanagari without " / "
    if re.search(r'[\u0900-\u097F]', opt):
        m = re.search(r'[\u0900-\u097F]', opt)
        en_part = opt[:m.start()].strip()
        if en_part:
            return en_part
    return " ".join(opt.split())

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
            opts[label] = extract_pure_english_option(val) if val else f"Option {label}"

        statement_clean = re.sub(r'^Q\d+\.\s*', '', statement).strip()
        en_statement = extract_pure_english(statement_clean)

        q_num = len(all_questions) + 1
        all_questions.append({
            "question_number": q_num,
            "question_text": en_statement,
            "option_a": opts.get("A", "Option A"),
            "option_b": opts.get("B", "Option B"),
            "option_c": opts.get("C", "Option C"),
            "option_d": opts.get("D", "Option D"),
            "correct_answer": ans
        })

print(f"Extracted {len(all_questions)} questions.")

print("\n--- SAMPLE EXTRACTED QUESTIONS (PURE ENGLISH) ---")
for q in all_questions[:5]:
    print(f"Q{q['question_number']}. {q['question_text']}")
    print(f"  A) {q['option_a']} | B) {q['option_b']} | C) {q['option_c']} | D) {q['option_d']}")
    print(f"  Correct: {q['correct_answer']}\n")

# Check questions around 26 (General Awareness)
print("\n--- SAMPLE GA QUESTIONS (PURE ENGLISH) ---")
for q in all_questions[25:29]:
    print(f"Q{q['question_number']}. {q['question_text']}")
    print(f"  A) {q['option_a']} | B) {q['option_b']} | C) {q['option_c']} | D) {q['option_d']}")
    print(f"  Correct: {q['correct_answer']}\n")

# Check questions around 51 (Quant)
print("\n--- SAMPLE MATH QUESTIONS (PURE ENGLISH) ---")
for q in all_questions[50:54]:
    print(f"Q{q['question_number']}. {q['question_text']}")
    print(f"  A) {q['option_a']} | B) {q['option_b']} | C) {q['option_c']} | D) {q['option_d']}")
    print(f"  Correct: {q['correct_answer']}\n")

# Check questions around 76 (English)
print("\n--- SAMPLE ENGLISH COMPREHENSION QUESTIONS ---")
for q in all_questions[75:78]:
    print(f"Q{q['question_number']}. {q['question_text']}")
    print(f"  A) {q['option_a']} | B) {q['option_b']} | C) {q['option_c']} | D) {q['option_d']}")
    print(f"  Correct: {q['correct_answer']}\n")
