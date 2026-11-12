import fitz
from rapidocr_onnxruntime import RapidOCR
import json
import os
import time
import sys

sys.stdout.reconfigure(encoding='utf-8', line_buffering=True)

out_dir = 'scripts/pdf_samples/t4_col_ocr'
os.makedirs(out_dir, exist_ok=True)

doc = fitz.open('analogy_chapter2.pdf')
engine = RapidOCR(params={'use_angle_cls': False})

# Define the columns for Type-IV: Pages 31 to 38 (0-indexed 30 to 37)
# For each page:
# Left half: x from 25 to 415, y from 35 to 580
#   col 0: 25 to 155
#   col 1: 155 to 285
#   col 2: 285 to 415
# Right half: x from 425 to 815, y from 35 to 580
#   col 0: 425 to 555
#   col 1: 555 to 685
#   col 2: 685 to 815

tasks = []

# Page 31 right half, col 2 only (Type-IV starts at y ~ 170)
tasks.append((30, 'p31_r_c2', fitz.Rect(685, 170, 815, 580)))

# Pages 32 to 37: all 6 columns
for pno in range(31, 37):
    pname = f"p{pno+1}"
    tasks.append((pno, f"{pname}_l_c0", fitz.Rect(25, 35, 155, 580)))
    tasks.append((pno, f"{pname}_l_c1", fitz.Rect(155, 35, 285, 580)))
    tasks.append((pno, f"{pname}_l_c2", fitz.Rect(285, 35, 415, 580)))
    tasks.append((pno, f"{pname}_r_c0", fitz.Rect(425, 35, 555, 580)))
    tasks.append((pno, f"{pname}_r_c1", fitz.Rect(555, 35, 685, 580)))
    tasks.append((pno, f"{pname}_r_c2", fitz.Rect(685, 35, 815, 580)))

# Page 38 (0-indexed 37): left 3 cols, and right col 0 only (Type-IV ends on right col 0)
tasks.append((37, "p38_l_c0", fitz.Rect(25, 35, 155, 580)))
tasks.append((37, "p38_l_c1", fitz.Rect(155, 35, 285, 580)))
tasks.append((37, "p38_l_c2", fitz.Rect(285, 35, 415, 580)))
tasks.append((37, "p38_r_c0", fitz.Rect(425, 35, 555, 250))) # Type-IV ends early in col 0

print(f"Total columns to process: {len(tasks)}", flush=True)

for idx, (pno, name, rect) in enumerate(tasks):
    out_file = os.path.join(out_dir, f"{name}.json")
    if os.path.exists(out_file):
        print(f"[{idx+1}/{len(tasks)}] {name} already exists. Skipping.", flush=True)
        continue
        
    t0 = time.time()
    page = doc[pno]
    pix = page.get_pixmap(dpi=150, clip=rect)
    res, _ = engine(pix.tobytes("png"))
    items = []
    if res:
        for b, t, s in res:
            items.append({
                'box': b,
                'text': t,
                'score': float(s) if isinstance(s, (int, float, str)) and str(s).replace('.', '', 1).isdigit() else 0.95
            })
            
    with open(out_file, 'w', encoding='utf-8') as f:
        json.dump(items, f, ensure_ascii=False, indent=2)
        
    print(f"[{idx+1}/{len(tasks)}] {name}: {len(items)} boxes in {time.time()-t0:.1f}s", flush=True)

print("ALL COLUMNS COMPLETED SUCCESSFULLY!", flush=True)
