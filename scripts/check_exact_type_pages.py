import fitz
from PIL import Image
import numpy as np
from rapidocr_onnxruntime import RapidOCR
import sys

sys.stdout.reconfigure(encoding='utf-8', line_buffering=True)
engine = RapidOCR()
doc = fitz.open(r'C:\ssczone\analogy_chapter2.pdf')

test_pages = [27, 28, 33, 34, 37, 38, 39, 40, 50, 60, 68] # 0-indexed

for pno in test_pages:
    page = doc[pno]
    pix = page.get_pixmap(dpi=80)
    img = Image.frombytes("RGB", [pix.width, pix.height], pix.samples)
    w, h = img.size
    
    # Check top strip (y < 200)
    top_strip = img.crop((0, 0, w, 200))
    res, _ = engine(np.array(top_strip))
    
    print(f"\nPage {pno+1}:", flush=True)
    if res:
        for b, t, s in res:
            if any(k in t.upper() for k in ['TYPE', 'ANSWER', 'EXPLANATION', 'HINTS', 'SET']):
                print(f"  TOP: '{t}'", flush=True)

    # Check whole page for any occurrence of 'TYPE-IV' or 'TYPE-V'
    res_full, _ = engine(np.array(img))
    if res_full:
        for b, t, s in res_full:
            if 'TYPE-IV' in t.upper() or 'TYPE-V' in t.upper() or 'TYPE -IV' in t.upper() or 'TYPE -V' in t.upper():
                print(f"  BODY: '{t}' at y={b[0][1]:.1f}", flush=True)
