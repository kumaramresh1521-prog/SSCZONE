import fitz
from PIL import Image
import numpy as np
from rapidocr_onnxruntime import RapidOCR
import json
import time
import sys

sys.stdout.reconfigure(encoding='utf-8')

pdf_path = r'F:\startup  send mail\pdf\analogy question 2-70.pdf'
doc = fitz.open(pdf_path)
engine = RapidOCR()

# 1. Question Pages: Page 0 to 8
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

print("Starting Question Pages OCR cache dump...")
q_cache = {}
for pno, half in q_pages:
    t0 = time.time()
    page = doc[pno]
    pix = page.get_pixmap(dpi=150)
    img = Image.frombytes('RGB', [pix.width, pix.height], pix.samples)
    w, h = img.size
    half_img = img.crop((w // 2, 0, w, h)) if half == 'right' else img.crop((0, 0, w // 2, h))
    res, _ = engine(np.array(half_img))
    
    # Store box as [x0, y0, x1, y1], text, score
    items = []
    if res:
        for box, txt, score in res:
            # box has 4 corners: [[x0,y0],[x1,y1],[x2,y2],[x3,y3]]
            items.append({
                'box': [[float(p[0]), float(p[1])] for p in box],
                'text': txt,
                'score': float(score)
            })
    key = f"p{pno}_{half}"
    q_cache[key] = {
        'page': pno,
        'half': half,
        'width': half_img.width,
        'height': half_img.height,
        'items': items
    }
    print(f"Dumped {key}: {len(items)} items in {time.time()-t0:.2f}s")

with open('cache_ocr_questions.json', 'w', encoding='utf-8') as f:
    json.dump(q_cache, f, ensure_ascii=False)

print("\nStarting Explanation Pages OCR cache dump...")
expl_pages = [
    (39, 'right'),
    (40, 'left'), (40, 'right'),
    (41, 'left'), (41, 'right'),
    (42, 'left'), (42, 'right'),
    (43, 'left')
]

expl_cache = {}
for pno, half in expl_pages:
    t0 = time.time()
    page = doc[pno]
    pix = page.get_pixmap(dpi=150)
    img = Image.frombytes('RGB', [pix.width, pix.height], pix.samples)
    w, h = img.size
    half_img = img.crop((w // 2, 0, w, h)) if half == 'right' else img.crop((0, 0, w // 2, h))
    res, _ = engine(np.array(half_img))
    
    items = []
    if res:
        for box, txt, score in res:
            items.append({
                'box': [[float(p[0]), float(p[1])] for p in box],
                'text': txt,
                'score': float(score)
            })
    key = f"p{pno}_{half}"
    expl_cache[key] = {
        'page': pno,
        'half': half,
        'width': half_img.width,
        'height': half_img.height,
        'items': items
    }
    print(f"Dumped {key}: {len(items)} items in {time.time()-t0:.2f}s")

with open('cache_ocr_explanations.json', 'w', encoding='utf-8') as f:
    json.dump(expl_cache, f, ensure_ascii=False)

print("\nAll OCR Cache dumped successfully!")
