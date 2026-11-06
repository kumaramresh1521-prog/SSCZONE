import fitz
import re
import os
import sys
import json

sys.stdout.reconfigure(encoding='utf-8')

folder = r"F:\startup  send mail"
pdf_files = [f for f in sorted(os.listdir(folder)) if f.lower().endswith(".pdf")]

def extract_pure_english_statement(raw_text):
    if not raw_text:
        return ""
    
    # If no Devanagari characters, it's pure English already
    if not re.search(r'[\u0900-\u097F]', raw_text):
        return " ".join(raw_text.split())
        
    # Split text into lines
    lines = raw_text.split('\n')
    en_lines = []
    
    for line in lines:
        stripped = line.strip()
        if not stripped:
            continue
        # Check percentage of Devanagari characters in this line
        devanagari_chars = len(re.findall(r'[\u0900-\u097F]', stripped))
        total_letters = len(re.findall(r'[a-zA-Z\u0900-\u097F]', stripped))
        
        # If line has mostly Devanagari, this is where Hindi translation begins
        if total_letters > 0 and (devanagari_chars / total_letters) > 0.35:
            # Check if there was English before the Devanagari in this line
            m = re.search(r'[\u0900-\u097F]', stripped)
            if m and m.start() > 10:
                prefix = stripped[:m.start()].strip()
                if len(prefix) > 5:
                    en_lines.append(prefix)
            break
        else:
            # Check if line contains inline Devanagari at the end
            m = re.search(r'[\u0900-\u097F]', stripped)
            if m:
                # If there's substantial Devanagari following English
                prefix = stripped[:m.start()].strip()
                if prefix:
                    en_lines.append(prefix)
                break
            else:
                en_lines.append(stripped)
                
    result = " ".join(" ".join(en_lines).split())
    # Fallback if result is too short
    if len(result) < 10:
        # Just take before first devanagari
        m = re.search(r'[\u0900-\u097F]', raw_text)
        if m:
            result = " ".join(raw_text[:m.start()].split())
        else:
            result = " ".join(raw_text.split())
            
    return result

def extract_pure_english_option(opt_text):
    if not opt_text:
        return ""
    opt = opt_text.strip()
    
    # If option has " / ", e.g. "Chile / चिली" or "15.5 litres / 15.5 लीटर"
    if " / " in opt:
        parts = opt.split(" / ")
        # Find the first part that doesn't have Devanagari
        for p in parts:
            if not re.search(r'[\u0900-\u097F]', p):
                cleaned = p.strip()
                if cleaned:
                    return " ".join(cleaned.split())
        # Fallback to first part
        return " ".join(parts[0].split())
        
    # If option contains Devanagari without " / "
    if re.search(r'[\u0900-\u097F]', opt):
        m = re.search(r'[\u0900-\u097F]', opt)
        en_part = opt[:m.start()].strip()
        if en_part:
            return " ".join(en_part.split())
            
    return " ".join(opt.split())

papers_extracted = []

for idx, fname in enumerate(pdf_files):
    pdf_path = os.path.join(folder, fname)
    doc = fitz.open(pdf_path)
    
    # Paper title parsing: e.g. "SSC CGL, 2025 Official Paper (Held On_ 16 Sept, 2025 Shift 1).pdf"
    # Match date and shift
    m_info = re.search(r'(\d+)\s*Sept(?:ember)?,?\s*2025\s*Shift\s*(\d)', fname, re.IGNORECASE)
    if m_info:
        day = m_info.group(1)
        shift = m_info.group(2)
        title = f"SSC CGL 2025 Tier-I (Held On {day} September 2025 Shift {shift})"
        slug = f"ssc-cgl-2025-{day}-september-2025-shift-{shift}"
    else:
        title = fname.replace(".pdf", "")
        slug = title.lower().replace(" ", "-")

    start_pno = 0
    for pno in range(min(5, len(doc))):
        txt = doc[pno].get_text()
        if "Q1." in txt or "General Intelligence" in txt:
            start_pno = pno
            break

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
    
    questions = []
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
                en_opt = extract_pure_english_option(val)
                # If option is empty or just dashes, provide clean label
                if not en_opt or en_opt in ["-", "—", "/"]:
                    en_opt = f"Option {label}"
                opts[label] = en_opt

            statement_clean = re.sub(r'^Q\d+\.\s*', '', statement).strip()
            en_statement = extract_pure_english_statement(statement_clean)
            if not en_statement or len(en_statement) < 5:
                en_statement = f"[Question {len(questions)+1}]"

            q_num = len(questions) + 1
            questions.append({
                "question_number": q_num,
                "question_text": en_statement,
                "option_a": opts.get("A", "Option A"),
                "option_b": opts.get("B", "Option B"),
                "option_c": opts.get("C", "Option C"),
                "option_d": opts.get("D", "Option D"),
                "correct_answer": ans
            })

    print(f"Extracted {len(questions)} pure English questions for: {title}")
    papers_extracted.append({
        "paper_id": 15 + idx, # IDs starting from 15
        "title": title,
        "slug": slug,
        "year": 2025,
        "source_pdf": fname,
        "questions": questions
    })

# Save to tmp JSON for inspection
with open("tmp_9_papers_pure_english.json", "w", encoding="utf-8") as f:
    json.dump(papers_extracted, f, ensure_ascii=False, indent=2)

print("\nSaved all 9 extracted papers to tmp_9_papers_pure_english.json.")
