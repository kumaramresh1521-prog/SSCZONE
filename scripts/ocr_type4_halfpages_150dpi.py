import fitz
from rapidocr_onnxruntime import RapidOCR
import json
import os
import time
import gc
import sys

sys.stdout.reconfigure(encoding='utf-8', line_buffering=True)

out_dir = 'scripts/pdf_samples/t4_half_150dpi'
os.makedirs(out_dir, exist_ok=True)

doc = fitz.open('analogy_chapter2.pdf')
engine = RapidOCR(params={'use_angle_cls': False})

tasks = []
# Page 31 (idx 30): right half col 2 only
tasks.append((30, 'p31_r', fitz.Rect(670, 165, 835, 585)))

# Pages 32 to 37 (idx 31 to 36): full left & right halves
for pno in range(31, 37):
    pname = f"p{pno+1}"
    tasks.append((pno, f"{pname}_l", fitz.Rect(15, 25, 426, 585)))
    tasks.append((pno, f"{pname}_r", fitz.Rect(418, 25, 835, 585)))

# Page 38 (idx 37): full left half, and right col 0 only (Q250 ends on left/right border, Q251-254 in right col 0)
tasks.append((37, 'p38_l', fitz.Rect(15, 25, 426, 585)))
tasks.append((37, 'p38_r', fitz.Rect(418, 25, 570, 585)))

print(f"Total half-pages to OCR at 150 DPI: {len(tasks)}", flush=True)

for idx, (pno, name, rect) in enumerate(tasks):
    out_file = os.path.join(out_dir, f"{name}.json")
    if os.path.exists(out_file):
        print(f"[{idx+1}/{len(tasks)}] {name} already cached. Skipping.", flush=True)
        continue
        
    t0 = time.time()
    page = doc[pno]
    pix = page.get_pixmap(dpi=150, clip=rect)
    img_bytes = pix.tobytes("png")
    w, h = pix.width, pix.height
    res, _ = engine(img_bytes)
    
    items = []
    if res:
        for b, t, s in res:
            # Also store PDF-point-adjusted coords relative to clip rect origin so column splitting is uniform!
            # Scale from 150 DPI pixels back to PDF points: * (72.0 / 150.0)
            scale = 72.0 / 150.0
            pdf_box = [[rect.x0 + pt[0]*scale, rect.y0 + pt[1]*scale] for pt in b]
            items.append({
                'box': pdf_box,
                'text': t,
                'score': float(s) if isinstance(s, (int, float, str)) and str(s).replace('.', '', 1).isdigit() else 0.95
            })
            
    with open(out_file, 'w', encoding='utf-8') as f:
        json.dump(items, f, ensure_ascii=False, indent=2)
        
    del pix, img_bytes, res
    gc.collect()
    print(f"[{idx+1}/{len(tasks)}] {name} ({w}x{h}): {len(items)} boxes in {time.time()-t0:.1f}s", flush=True)

print("ALL 15 HALF-PAGES COMPLETED!", flush=True)
