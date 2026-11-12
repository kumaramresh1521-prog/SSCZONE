import fitz
from PIL import Image
import numpy as np
from rapidocr_onnxruntime import RapidOCR
import sys
import time

sys.stdout.reconfigure(encoding='utf-8', line_buffering=True)
engine = RapidOCR()
t0 = time.time()
doc = fitz.open(r'C:\ssczone\analogy_chapter2.pdf')
print(f"Opened PDF in {time.time()-t0:.2f}s", flush=True)

for pno in [25, 26]: # Page 26 and 27
    t1 = time.time()
    page = doc[pno]
    pix = page.get_pixmap(dpi=120)
    print(f"Rendered Page {pno+1} pixmap ({pix.width}x{pix.height}) in {time.time()-t1:.2f}s", flush=True)
    img = Image.frombytes("RGB", [pix.width, pix.height], pix.samples)
    w, h = img.size
    
    # Left and Right halves
    for half_name, box in [('LEFT', (0, 0, w//2, h)), ('RIGHT', (w//2, 0, w, h))]:
        t2 = time.time()
        sub = img.crop(box)
        res, _ = engine(np.array(sub))
        print(f"OCR Page {pno+1} {half_name} ({len(res) if res else 0} blocks) in {time.time()-t2:.2f}s:", flush=True)
        if res:
            for b, t, s in res:
                if 'TYPE' in t.upper() or '257' in t or '256' in t or '1.' in t or '2.' in t:
                    print(f"  y={b[0][1]:.1f}: '{t}'", flush=True)
