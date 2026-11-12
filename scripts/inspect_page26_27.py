import fitz
from PIL import Image
import numpy as np
from rapidocr_onnxruntime import RapidOCR
import sys

sys.stdout.reconfigure(encoding='utf-8', line_buffering=True)
engine = RapidOCR()
doc = fitz.open(r'F:\startup  send mail\pdf\analogy question 2-70.pdf')

for pno in [25, 26]: # 0-indexed: Page 26 and Page 27
    page = doc[pno]
    pix = page.get_pixmap(dpi=100)
    img = Image.frombytes("RGB", [pix.width, pix.height], pix.samples)
    w, h = img.size
    
    # Left and Right halves
    for half_name, box in [('LEFT', (0, 0, w//2, h)), ('RIGHT', (w//2, 0, w, h))]:
        sub = img.crop(box)
        res, _ = engine(np.array(sub))
        print(f"\n--- Page {pno+1} {half_name} ({len(res) if res else 0} blocks) ---", flush=True)
        if res:
            for b, t, s in res[:25]:
                print(f"  y={b[0][1]:.1f}: {t}", flush=True)
