import fitz
from PIL import Image
import numpy as np
from rapidocr_onnxruntime import RapidOCR
import json
import os
import sys
import time

sys.stdout.reconfigure(encoding='utf-8', line_buffering=True)
engine = RapidOCR()
doc = fitz.open('analogy_chapter2.pdf')

os.makedirs('scripts/pdf_samples/t4_ocr', exist_ok=True)

# 1. Questions: Pages 31 to 38 (0-indexed: 30 to 37)
print("=== EXTRACTING TYPE-IV QUESTIONS (Pages 31-38) ===", flush=True)
q_pages = list(range(30, 38))
for pno in q_pages:
    cache_file = f'scripts/pdf_samples/t4_ocr/q_page_{pno+1}.json'
    if os.path.exists(cache_file):
        print(f"Page {pno+1} questions already cached.", flush=True)
        continue
    
    t0 = time.time()
    page = doc[pno]
    # DPI 100 is fast and high quality for printed text
    pix = page.get_pixmap(dpi=100)
    im = Image.frombytes('RGB', [pix.width, pix.height], pix.samples)
    
    # On Page 31, Type-IV starts on right half (x >= w//2)
    # On Pages 32-37, full page
    # On Page 38, ends at Q254 (before TYPE-V at y=96 on right half)
    res, _ = engine(np.array(im))
    items = [[b, t, s] for b, t, s in (res or [])]
    with open(cache_file, 'w', encoding='utf-8') as f:
        json.dump(items, f, ensure_ascii=False, indent=2)
    print(f"Page {pno+1} OCR done in {time.time()-t0:.1f}s ({len(items)} text boxes)", flush=True)

# 2. Explanations: Pages 58 to 69 (0-indexed: 57 to 68)
print("\n=== EXTRACTING TYPE-IV EXPLANATIONS (Pages 58-69) ===", flush=True)
exp_pages = list(range(57, 69))
for pno in exp_pages:
    cache_file = f'scripts/pdf_samples/t4_ocr/exp_page_{pno+1}.json'
    if os.path.exists(cache_file):
        print(f"Page {pno+1} explanations already cached.", flush=True)
        continue
    
    t0 = time.time()
    page = doc[pno]
    pix = page.get_pixmap(dpi=100)
    im = Image.frombytes('RGB', [pix.width, pix.height], pix.samples)
    
    res, _ = engine(np.array(im))
    items = [[b, t, s] for b, t, s in (res or [])]
    with open(cache_file, 'w', encoding='utf-8') as f:
        json.dump(items, f, ensure_ascii=False, indent=2)
    print(f"Page {pno+1} OCR done in {time.time()-t0:.1f}s ({len(items)} text boxes)", flush=True)

print("\nAll Type-IV pages extracted successfully!", flush=True)
