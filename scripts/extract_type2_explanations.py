import fitz
from PIL import Image
import numpy as np
from rapidocr_onnxruntime import RapidOCR
import json
import time
import sys

sys.stdout.reconfigure(encoding='utf-8', line_buffering=True)

pdf_path = r'F:\startup  send mail\pdf\analogy question 2-70.pdf'
doc = fitz.open(pdf_path)
engine = RapidOCR()

def cluster_and_sort(items, y_tolerance=8):
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

def get_page_half_columns(pix_img, num_cols=3):
    # Explanation pages have 3 columns per half page!
    w, h = pix_img.size
    res, _ = engine(np.array(pix_img))
    if not res:
        return []
        
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

# Explanations targets: Page 44 left to Page 52 right
expl_targets = [
    (43, 'left'),
    (43, 'right'),
]
for pno in range(44, 52):
    expl_targets.append((pno, 'left'))
    expl_targets.append((pno, 'right'))

print(f"Total explanation half-pages to process: {len(expl_targets)}", flush=True)

all_expl_lines = []
stop_expl = False

for pno, half in expl_targets:
    if stop_expl:
        break
    t0 = time.time()
    page = doc[pno]
    pix = page.get_pixmap(dpi=150)
    img = Image.frombytes("RGB", [pix.width, pix.height], pix.samples)
    w, h = img.size
    half_img = img.crop((w // 2, 0, w, h)) if half == 'right' else img.crop((0, 0, w // 2, h))
    lines = get_page_half_columns(half_img, num_cols=3)
    
    for l in lines:
        if 'TYPE-III' in l or 'TYPE -III' in l:
            print(f"Reached TYPE-III in explanations on Page {pno+1} {half}! Stopping.", flush=True)
            stop_expl = True
            break
        all_expl_lines.append(l)
        
    print(f"Page {pno+1} {half}: Extracted {len(lines)} lines in {time.time()-t0:.1f}s (Total: {len(all_expl_lines)})", flush=True)

with open('type2_expl_lines_cache.json', 'w', encoding='utf-8') as f:
    json.dump(all_expl_lines, f, ensure_ascii=False, indent=2)

print(f"\nSUCCESS: Extracted all Type-II explanation lines! Total lines: {len(all_expl_lines)}", flush=True)
