import fitz
import re
import json
import sys

sys.stdout.reconfigure(encoding='utf-8')

doc = fitz.open(r"E:\pyq pdf\SSC_CGL_2025_Tier_1_12_Sept_Shift_1_SSC_ZONE.pdf")

content_blocks = []
for pno in range(1, len(doc)):
    page = doc[pno]
    blocks = page.get_text("blocks")
    for b in blocks:
        text = b[4].strip()
        y0 = b[1]
        y1 = b[3]
        if y0 < 48 or y1 > 798:
            continue
        if "SSC ZONE" in text or "SSC CGL 2025 Tier-I" in text or "www.ssczone.in" in text:
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
    
    # Match A), B), C), D) even if there is no space after
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
        
        q_num = len(all_questions) + 1
        all_questions.append({
            "question_number": q_num,
            "question_text": statement.replace('\n', ' '),
            "option_a": opts.get("A", "Option A"),
            "option_b": opts.get("B", "Option B"),
            "option_c": opts.get("C", "Option C"),
            "option_d": opts.get("D", "Option D"),
            "correct_answer": ans
        })

print(f"Total extracted questions: {len(all_questions)}")
assert len(all_questions) == 100, f"Expected 100, got {len(all_questions)}"

# Save to JSON
with open(r"E:\pyq pdf\SSC_CGL_2025_Tier_1_12_Sept_Shift_1_bulk_import.json", "w", encoding="utf-8") as f:
    json.dump(all_questions, f, ensure_ascii=False, indent=2)

print("Saved all 100 questions perfectly to E:\\pyq pdf\\SSC_CGL_2025_Tier_1_12_Sept_Shift_1_bulk_import.json")
