import fitz
from PIL import Image
import numpy as np
from rapidocr_onnxruntime import RapidOCR
import re
import json
import os
import sys
import time

sys.stdout.reconfigure(encoding='utf-8')

pdf_path = r'F:\startup  send mail\pdf\analogy question 2-70.pdf'
doc = fitz.open(pdf_path)
engine = RapidOCR()

# Load ground-truth answer key
with open('type1_answers_final.json', 'r') as f:
    answers_map = json.load(f)

print(f"Loaded {len(answers_map)} verified answers for Type-I.")

def cluster_and_sort(items, y_tolerance=9):
    items = sorted(items, key=lambda it: (it[0][0][1] + it[0][2][1]) / 2.0)
    lines = []
    current_line = []
    current_y = None
    
    for it in items:
        y_mid = (it[0][0][1] + it[0][2][1]) / 2.0
        if current_y is None or abs(y_mid - current_y) <= y_tolerance:
            current_line.append(it)
            current_y = y_mid if current_y is None else (current_y + y_mid) / 2.0
        else:
            current_line.sort(key=lambda it: it[0][0][0])
            lines.append(" ".join([it[1] for it in current_line]))
            current_line = [it]
            current_y = y_mid
            
    if current_line:
        current_line.sort(key=lambda it: it[0][0][0])
        lines.append(" ".join([it[1] for it in current_line]))
        
    return lines

def get_page_columns(pix_img, num_cols=3):
    # pix_img is PIL Image
    w, h = pix_img.size
    res, _ = engine(np.array(pix_img))
    if not res:
        return []
        
    # filter top header line (y < 40 or 'ANALOGY' in text)
    filtered = [it for it in res if it[0][0][1] > 35 and 'ANALOGY' not in it[1] and '@apna' not in it[1]]
    
    col_w = w / float(num_cols)
    cols = [[] for _ in range(num_cols)]
    for it in filtered:
        x_mid = (it[0][0][0] + it[0][1][0]) / 2.0
        col_idx = min(num_cols - 1, max(0, int(x_mid / col_w)))
        cols[col_idx].append(it)
        
    page_lines = []
    for c in cols:
        page_lines.extend(cluster_and_sort(c))
    return page_lines

# --- STEP 1: EXTRACT EXPLANATIONS (Pages 40 to 44) ---
print("\n================== STEP 1: EXTRACTING EXPLANATIONS ==================")
expl_targets = [
    (39, 'right'),  # p40 right
    (40, 'left'),   # p41 left
    (40, 'right'),  # p41 right
    (41, 'left'),   # p42 left
    (41, 'right'),  # p42 right
    (42, 'left'),   # p43 left
    (42, 'right'),  # p43 right
    (43, 'left'),   # p44 left
]

all_expl_lines = []
for pno, half in expl_targets:
    t0 = time.time()
    page = doc[pno]
    pix = page.get_pixmap(dpi=150)
    img = Image.frombytes("RGB", [pix.width, pix.height], pix.samples)
    w, h = img.size
    half_img = img.crop((w // 2, 0, w, h)) if half == 'right' else img.crop((0, 0, w // 2, h))
    lines = get_page_columns(half_img, num_cols=3)
    all_expl_lines.extend(lines)
    print(f"Extracted Page {pno+1} {half} ({len(lines)} lines in {time.time()-t0:.1f}s)")

# Parse explanations stream
expl_text = "\n".join(all_expl_lines)
# Stop before TYPE-II
t2_idx = expl_text.find("TYPE-II")
if t2_idx != -1:
    expl_text = expl_text[:t2_idx]

# Split on headers: \n<num>. (<digit>) or ^<num>. (<digit>)
expl_matches = list(re.finditer(r'(?:^|\n|\s)(\d{1,3})\s*[\.\)]\s*\(?([1-4])\)?', expl_text))
explanations_dict = {}
for i in range(len(expl_matches)):
    q_num = int(expl_matches[i].group(1))
    if 1 <= q_num <= 284:
        start_idx = expl_matches[i].end()
        end_idx = expl_matches[i+1].start() if i + 1 < len(expl_matches) else len(expl_text)
        txt = expl_text[start_idx:end_idx].strip()
        txt = re.sub(r'\s+', ' ', txt)
        # clean stray page labels like "K5279/..."
        txt = re.sub(r'K5279/\d+', '', txt).strip()
        explanations_dict[q_num] = txt

print(f"\nTotal Explanations parsed: {len(explanations_dict)} / 284")
missing_expl = [i for i in range(1, 285) if i not in explanations_dict]
print(f"Missing explanations: {missing_expl}")

with open('type1_explanations.json', 'w', encoding='utf-8') as f:
    json.dump(explanations_dict, f, ensure_ascii=False, indent=2)

# --- STEP 2: EXTRACT QUESTIONS (Pages 1 to 9) ---
print("\n================== STEP 2: EXTRACTING QUESTIONS ==================")
q_targets = [
    (0, 'right'),  # p1 right
    (1, 'left'),   # p2 left
    (1, 'right'),  # p2 right
    (2, 'left'),   # p3 left
    (2, 'right'),  # p3 right
    (3, 'left'),   # p4 left
    (3, 'right'),  # p4 right
    (4, 'left'),   # p5 left
    (4, 'right'),  # p5 right
    (5, 'left'),   # p6 left
    (5, 'right'),  # p6 right
    (6, 'left'),   # p7 left
    (6, 'right'),  # p7 right
    (7, 'left'),   # p8 left
    (7, 'right'),  # p8 right
    (8, 'left'),   # p9 left
    (8, 'right'),  # p9 right
]

all_q_lines = []
for pno, half in q_targets:
    t0 = time.time()
    page = doc[pno]
    pix = page.get_pixmap(dpi=150)
    img = Image.frombytes("RGB", [pix.width, pix.height], pix.samples)
    w, h = img.size
    half_img = img.crop((w // 2, 0, w, h)) if half == 'right' else img.crop((0, 0, w // 2, h))
    lines = get_page_columns(half_img, num_cols=3)
    all_q_lines.extend(lines)
    print(f"Extracted Page {pno+1} {half} ({len(lines)} lines in {time.time()-t0:.1f}s)")

# Parse questions stream
full_q_text = "\n".join(all_q_lines)
# Stop before TYPE-II on page 9 right
t2_q_idx = full_q_text.find("TYPE-II")
if t2_q_idx != -1:
    full_q_text = full_q_text[:t2_q_idx]

# Clean telegram & directions
full_q_text = re.sub(r'@apna_[a-z_]+', '', full_q_text)
full_q_text = re.sub(r'Directions\s*:.*?(?=\d+\.|\Z)', '', full_q_text, flags=re.DOTALL)

# Split on "\n<num>. "
q_blocks = list(re.finditer(r'(?:^|\n)\s*(\d{1,3})\s*[\.\)]\s+', full_q_text))
print(f"\nFound {len(q_blocks)} question headers in questions text.")

questions_dict = {}
for i in range(len(q_blocks)):
    q_num = int(q_blocks[i].group(1))
    if 1 <= q_num <= 284:
        start_idx = q_blocks[i].end()
        end_idx = q_blocks[i+1].start() if i + 1 < len(q_blocks) else len(full_q_text)
        body = full_q_text[start_idx:end_idx].strip()
        
        # 1. Question text is before (1)
        m_opt1 = re.search(r'(?:\n|^|\s)\((?:1|[aA]|l|i)\)', body)
        if m_opt1:
            q_txt = body[:m_opt1.start()].strip()
            rest = body[m_opt1.start():].strip()
        else:
            q_txt = body
            rest = ""
            
        # 2. Exam tag at end
        exam_tag = ""
        m_exam = re.search(r'\(((?:SSC|Delhi Police|FCI|CAPF|CPO|CGL|CHSL|MTS|Stenographer)[^\)]+)\)\s*$', rest, flags=re.I)
        if not m_exam:
            m_exam = re.search(r'\[((?:SSC|Delhi Police|FCI|CAPF|CPO|CGL|CHSL|MTS|Stenographer)[^\]]+)\]\s*$', rest, flags=re.I)
        if m_exam:
            exam_tag = m_exam.group(1).strip()
            rest = rest[:m_exam.start()].strip()
            
        # 3. Parse options (1), (2), (3), (4)
        opt_matches = list(re.finditer(r'(?:\n|^|\s)\(([1-4])\)', rest))
        opts = {}
        for oi in range(len(opt_matches)):
            opt_num = int(opt_matches[oi].group(1))
            st = opt_matches[oi].end()
            en = opt_matches[oi+1].start() if oi + 1 < len(opt_matches) else len(rest)
            val = rest[st:en].strip()
            # clean internal newlines
            val = re.sub(r'\s+', ' ', val).strip()
            opts[opt_num] = val
            
        questions_dict[q_num] = {
            'question_number': q_num,
            'question_text': re.sub(r'\s+', ' ', q_txt).strip(),
            'option_a': opts.get(1, ''),
            'option_b': opts.get(2, ''),
            'option_c': opts.get(3, ''),
            'option_d': opts.get(4, ''),
            'exam_tag': exam_tag
        }

print(f"Total Questions parsed: {len(questions_dict)} / 284")
missing_q = [i for i in range(1, 285) if i not in questions_dict]
print(f"Missing questions: {missing_q}")

with open('type1_questions.json', 'w', encoding='utf-8') as f:
    json.dump(questions_dict, f, ensure_ascii=False, indent=2)

print("\nSaved type1_explanations.json and type1_questions.json successfully!")
