import fitz
from PIL import Image
import numpy as np
from rapidocr_onnxruntime import RapidOCR
import json
import os
import sys
import gc
import time

sys.stdout.reconfigure(encoding='utf-8', line_buffering=True)
engine = RapidOCR()
doc = fitz.open('analogy_chapter2.pdf')

os.makedirs('scripts/pdf_samples/t4_robust', exist_ok=True)

def ocr_half(im_half, page_name, half_name):
    cache_path = f'scripts/pdf_samples/t4_robust/{page_name}_{half_name}.json'
    if os.path.exists(cache_path):
        print(f"  {page_name} {half_name} already cached.", flush=True)
        return
    t0 = time.time()
    res, _ = engine(np.array(im_half))
    items = [[b, t, s] for b, t, s in (res or [])]
    with open(cache_path, 'w', encoding='utf-8') as f:
        json.dump(items, f, ensure_ascii=False, indent=2)
    print(f"  {page_name} {half_name} done in {time.time()-t0:.1f}s ({len(items)} boxes)", flush=True)
    del res, items
    gc.collect()

# 1. Questions: Pages 31 to 38 (0-indexed: 30 to 37)
print("=== EXTRACTING TYPE-IV QUESTIONS (Pages 31-38) ===", flush=True)
for pno in range(30, 38):
    pname = f"q_p{pno+1}"
    page = doc[pno]
    pix = page.get_pixmap(dpi=75)
    im = Image.frombytes('RGB', [pix.width, pix.height], pix.samples)
    w, h = im.size
    mid_x = w // 2
    
    # Page 31 only needs right half (where Type-IV starts)
    if pno == 30:
        ocr_half(im.crop((mid_x, 0, w, h)), pname, "right")
    else:
        ocr_half(im.crop((0, 0, mid_x, h)), pname, "left")
        ocr_half(im.crop((mid_x, 0, w, h)), pname, "right")
        
    del im, pix
    gc.collect()

# 2. Explanations: Pages 58 to 69 (0-indexed: 57 to 68)
print("\n=== EXTRACTING TYPE-IV EXPLANATIONS (Pages 58-69) ===", flush=True)
for pno in range(57, 69):
    pname = f"exp_p{pno+1}"
    page = doc[pno]
    pix = page.get_pixmap(dpi=75)
    im = Image.frombytes('RGB', [pix.width, pix.height], pix.samples)
    w, h = im.size
    mid_x = w // 2
    
    # Page 58: Type-IV explanations start on right half
    if pno == 57:
        ocr_half(im.crop((mid_x, 0, w, h)), pname, "right")
    # Page 69: Type-IV explanations end on left half (right half is Type-V)
    elif pno == 68:
        ocr_half(im.crop((0, 0, mid_x, h)), pname, "left")
    else:
        ocr_half(im.crop((0, 0, mid_x, h)), pname, "left")
        ocr_half(im.crop((mid_x, 0, w, h)), pname, "right")
        
    del im, pix
    gc.collect()

print("\n=== ALL TYPE-IV PAGES EXTRACTED AND CACHED SUCCESSFULLY ===", flush=True)
