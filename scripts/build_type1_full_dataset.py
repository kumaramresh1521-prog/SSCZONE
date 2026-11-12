import fitz
from PIL import Image
import numpy as np
from rapidocr_onnxruntime import RapidOCR
import re
import json
import time
import sys
import os

sys.stdout.reconfigure(encoding='utf-8')

pdf_path = r'F:\startup  send mail\pdf\analogy question 2-70.pdf'
doc = fitz.open(pdf_path)
engine = RapidOCR()

# Load ground-truth answer key
with open('type1_answers_final.json', 'r', encoding='utf-8') as f:
    answers_map = json.load(f)

# Load existing explanations
with open('type1_explanations.json', 'r', encoding='utf-8') as f:
    explanations_map = json.load(f)

print(f"Loaded {len(answers_map)} answers and {len(explanations_map)} explanations.")

q_pages = [
    (0, 'right'),
    (1, 'left'), (1, 'right'),
    (2, 'left'), (2, 'right'),
    (3, 'left'), (3, 'right'),
    (4, 'left'), (4, 'right'),
    (5, 'left'), (5, 'right'),
    (6, 'left'), (6, 'right'),
    (7, 'left'), (7, 'right'),
    (8, 'left'), (8, 'right'),
]

def get_col_lines(items, x_min, x_max, y_tol=8):
    col_items = [it for it in items if x_min <= (it[0][0][0] + it[0][1][0]) / 2.0 < x_max]
    col_items.sort(key=lambda it: it[0][0][1])
    lines = []
    curr_line = []
    curr_y = None
    for it in col_items:
        y = it[0][0][1]
        if curr_y is None or abs(y - curr_y) <= y_tol:
            curr_line.append(it)
            curr_y = y if curr_y is None else (curr_y + y) / 2.0
        else:
            curr_line.sort(key=lambda it: it[0][0][0])
            lines.append(" ".join(it[1] for it in curr_line))
            curr_line = [it]
            curr_y = y
    if curr_line:
        curr_line.sort(key=lambda it: it[0][0][0])
        lines.append(" ".join(it[1] for it in curr_line))
    return lines

all_extracted_lines = []
cache_file = 'type1_raw_lines_cache.json'

if os.path.exists(cache_file):
    print("Loading raw lines from cache...")
    with open(cache_file, 'r', encoding='utf-8') as f:
        all_extracted_lines = json.load(f)
    print(f"Loaded {len(all_extracted_lines)} lines from cache.")
else:
    print("Running OCR on all 17 question half-pages...")
    t_start = time.time()
    for pno, half in q_pages:
        t0 = time.time()
        page = doc[pno]
        pix = page.get_pixmap(dpi=150)
        img = Image.frombytes("RGB", [pix.width, pix.height], pix.samples)
        w, h = img.size
        half_img = img.crop((w // 2, 0, w, h)) if half == 'right' else img.crop((0, 0, w // 2, h))
        
        res, _ = engine(np.array(half_img))
        if not res:
            continue
            
        items = [it for it in res if it[0][0][1] > 35 and '@apna' not in it[1] and 'ANALOGY' not in it[1]]
        
        # Stop if TYPE-II is reached on page 8 right
        half_w = half_img.width
        col_w = half_w / 3.0
        
        page_lines = []
        for ci in range(3):
            x0 = ci * col_w
            x1 = (ci + 1) * col_w
            col_lines = get_col_lines(items, x0, x1)
            for l in col_lines:
                if 'TYPE-II' in l:
                    break
                page_lines.append(l)
                
        all_extracted_lines.extend(page_lines)
        print(f"Page {pno+1} {half} done in {time.time()-t0:.1f}s ({len(page_lines)} lines)")
        
    print(f"All pages extracted in {time.time()-t_start:.1f}s. Total lines: {len(all_extracted_lines)}")
    with open(cache_file, 'w', encoding='utf-8') as f:
        json.dump(all_extracted_lines, f, ensure_ascii=False, indent=2)

print("\n--- Parsing Questions from Raw Lines ---")

# Filter out promo lines
filtered_lines = []
skip_promo = False
for l in all_extracted_lines:
    if 'Directions' in l and 'follow' in l:
        continue
    if 'given alternatives' in l:
        continue
    if '2025 Latest' in l or 'LatestQuestion' in l:
        skip_promo = True
        continue
    if skip_promo:
        if 'See Inside' in l or re.match(r'^\s*11[\.\)]', l):
            skip_promo = False
            if re.match(r'^\s*11[\.\)]', l):
                filtered_lines.append(l)
        continue
    filtered_lines.append(l)

print(f"Filtered lines: {len(filtered_lines)}")

# Find question boundaries
# Look for line starting with number and dot/paren e.g. "1.", "2.", "284."
q_indices = []
for idx, l in enumerate(filtered_lines):
    # Match ^\s*(\d{1,3})[\.\)]
    m = re.match(r'^\s*(\d{1,3})[\.\)]', l)
    if m:
        num = int(m.group(1))
        # Ensure it is not an option like (1) or a year
        if not re.match(r'^\s*\([1-4]\)', l) and num <= 300:
            q_indices.append((idx, num))

print(f"Initial question markers found: {len(q_indices)}")

# Deduplicate / filter spurious markers
valid_blocks = []
expected_num = 1
for i in range(len(q_indices)):
    idx, num = q_indices[i]
    # Check if this marker looks like a valid question start
    # Line must have colon or analogy format or letter words or options following
    valid_blocks.append((idx, num))

print(f"Total potential question blocks: {len(valid_blocks)}")

# Parse each question block
parsed_questions = {}

for bi in range(len(valid_blocks)):
    start_idx, declared_num = valid_blocks[bi]
    end_idx = valid_blocks[bi+1][0] if bi + 1 < len(valid_blocks) else len(filtered_lines)
    
    block_lines = filtered_lines[start_idx:end_idx]
    if not block_lines:
        continue
        
    first_line = block_lines[0]
    # Strip question number from first line
    q_first = re.sub(r'^\s*\d+[\.\)]\s*', '', first_line).strip()
    
    q_lines = [q_first]
    opt_lines = []
    exam_lines = []
    
    in_options = False
    in_exam = False
    
    for l in block_lines[1:]:
        # Option line detection
        if re.search(r'\((?:1|I|i|l|n|2|3|4|S)\)', l) or re.match(r'^\([1-4]\)', l):
            in_options = True
            
        # Exam line detection
        if in_options and (
            re.search(r'\(?(?:SSC|Exam|Shift|CBE|Tier|Sitting|Graduate|CHSL|CGL|MTS|CAPF|Delhi|Stenographer|FCI)', l, re.I) or
            re.search(r'\d{2}\.\d{2}\.\d{4}', l)
        ):
            in_exam = True
            in_options = False
            
        if in_exam:
            exam_lines.append(l)
        elif in_options:
            opt_lines.append(l)
        else:
            q_lines.append(l)
            
    q_text = " ".join(q_lines).strip()
    opt_raw = " ".join(opt_lines).strip()
    exam_raw = " ".join(exam_lines).strip()
    
    # Clean exam tag
    exam_tag = re.sub(r'^[\[\(]\s*|\s*[\]\)]$', '', exam_raw).strip()
    exam_tag = re.sub(r'\s+', ' ', exam_tag)
    
    # Normalize options: (1), (2), (3), (4)
    norm_opt = re.sub(r'\((?:1|I|i|l|n)\)', '(1)', opt_raw)
    norm_opt = re.sub(r'\((?:3|S)\)', '(3)', norm_opt)
    
    m1 = re.search(r'\(1\)(.*?)(?=\(2\)|\(3\)|\(4\)|\Z)', norm_opt)
    m2 = re.search(r'\(2\)(.*?)(?=\(3\)|\(4\)|\Z)', norm_opt)
    m3 = re.search(r'\(3\)(.*?)(?=\(4\)|\Z)', norm_opt)
    m4 = re.search(r'\(4\)(.*)', norm_opt)
    
    opt_a = m1.group(1).strip() if m1 else ''
    opt_b = m2.group(1).strip() if m2 else ''
    opt_c = m3.group(1).strip() if m3 else ''
    opt_d = m4.group(1).strip() if m4 else ''
    
    # Use sequential question number
    q_num = bi + 1
    if q_num > 284:
        break
        
    parsed_questions[q_num] = {
        'question_number': q_num,
        'question_text': q_text,
        'option_a': opt_a,
        'option_b': opt_b,
        'option_c': opt_c,
        'option_d': opt_d,
        'exam_tag': exam_tag
    }

print(f"\nTotal parsed questions: {len(parsed_questions)} / 284")
with open('type1_questions_parsed_all.json', 'w', encoding='utf-8') as f:
    json.dump(parsed_questions, f, ensure_ascii=False, indent=2)

print("Saved to type1_questions_parsed_all.json")
