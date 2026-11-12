import fitz
from PIL import Image
import numpy as np
from rapidocr_onnxruntime import RapidOCR
import sys
import re

sys.stdout.reconfigure(encoding='utf-8', line_buffering=True)
engine = RapidOCR()
doc = fitz.open('analogy_chapter2.pdf')

print("=== CHECKING PAGES 28 to 38 FOR QUESTIONS ===")
for pno in range(27, 39):
    page = doc[pno]
    pix = page.get_pixmap(dpi=100)
    img = Image.frombytes("RGB", [pix.width, pix.height], pix.samples)
    w, h = img.size
    
    # Check top
    top_res, _ = engine(np.array(img.crop((0, 0, w, int(h * 0.15)))))
    top_txt = " | ".join([t for b, t, s in (top_res or [])])
    print(f"Page {pno+1} Top: {top_txt[:100]}")
    
    # Check for TYPE-IV or TYPE-V anywhere on page
    full_res, _ = engine(np.array(img))
    if full_res:
        for b, t, s in full_res:
            if any(k in t.upper() for k in ['TYPE-IV', 'TYPE -IV', 'TYPE-V', 'TYPE -V']):
                print(f"   >>> FOUND {t} on Page {pno+1} at bbox: {b}")
