import fitz
import re
import json

doc = fitz.open(r"E:\pyq pdf\SSC_CGL_2025_Tier_1_12_Sept_Shift_1_SSC_ZONE.pdf")

# Extract all text from question pages (pages 1 to 26)
full_text = ""
for pno in range(1, len(doc)):
    full_text += doc[pno].get_text() + "\n"

# Let's split on Q(\d+)\.
pattern = re.compile(r'(?:^|\n)\s*Q(\d+)\.\s*', re.MULTILINE)
splits = pattern.split(full_text)

questions = []
# splits[0] is preamble before Q1.
# After that, alternating: splits[1] = "1", splits[2] = question block, splits[3] = "2", splits[4] = question block...
for i in range(1, len(splits), 2):
    q_no = int(splits[i])
    block = splits[i+1].strip()
    
    # Extract Correct Answer
    # e.g. 'Correct Answer: C' or 'Correct Answer: A'
    ans_match = re.search(r'Correct Answer:\s*([A-D])', block, re.IGNORECASE)
    ans = ans_match.group(1).upper() if ans_match else "A"
    
    # Strip everything after 'Correct Answer: ...'
    if ans_match:
        content = block[:ans_match.start()].strip()
    else:
        content = block
    
    # Extract options: A) ... B) ... C) ... D) ...
    # We look for A) or A. or [A]
    opt_matches = list(re.finditer(r'(?:^|\n)\s*([A-D])[\)\.]\s*', content))
    
    if len(opt_matches) >= 4:
        # Find which matches are A, B, C, D
        # The question text is everything before the first option match
        first_opt = opt_matches[0]
        q_text = content[:first_opt.start()].strip()
        
        # Options
        opts = {}
        for idx_m, m in enumerate(opt_matches):
            label = m.group(1).upper()
            start_pos = m.end()
            end_pos = opt_matches[idx_m + 1].start() if idx_m + 1 < len(opt_matches) else len(content)
            opts[label] = content[start_pos:end_pos].strip().replace('\n', ' ')
        
        op_a = opts.get("A", "")
        op_b = opts.get("B", "")
        op_c = opts.get("C", "")
        op_d = opts.get("D", "")
    else:
        # Fallback if options didn't split nicely
        q_text = content.replace('\n', ' ')
        op_a = "Option A"
        op_b = "Option B"
        op_c = "Option C"
        op_d = "Option D"
    
    # Clean header/footer artifacts if any leaked into q_text
    q_text = re.sub(r'SSC CGL 2025 Tier-I[^\n]*', '', q_text)
    q_text = re.sub(r'SSC ZONE[^\n]*', '', q_text)
    q_text = re.sub(r'Page \d+ of \d+[^\n]*', '', q_text)
    q_text = re.sub(r'www\.ssczone\.in[^\n]*', '', q_text)
    q_text = q_text.strip()
    
    questions.append({
        "question_number": q_no,
        "question_text": q_text,
        "option_a": op_a,
        "option_b": op_b,
        "option_c": op_c,
        "option_d": op_d,
        "correct_answer": ans
    })

print(f"Parsed {len(questions)} questions.")

# Verify first 3 and last 3
for q in questions[:2] + questions[-2:]:
    print(f"Q{q['question_number']}: {q['question_text'][:60]}... | Ans: {q['correct_answer']}")

# Save to JSON
json_path = r"E:\pyq pdf\SSC_CGL_2025_Tier_1_12_Sept_Shift_1_bulk_import.json"
with open(json_path, "w", encoding="utf-8") as f:
    json.dump(questions, f, ensure_ascii=False, indent=2)

print(f"Saved bulk import JSON at: {json_path}")
