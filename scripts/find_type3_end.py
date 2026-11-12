import fitz
from PIL import Image
import numpy as np
from rapidocr_onnxruntime import RapidOCR
import sys

sys.stdout.reconfigure(encoding='utf-8', line_buffering=True)
engine = RapidOCR()

doc = fitz.open(r'F:\startup  send mail\pdf\analogy question 2-70.pdf')

# Check pages 20 to 30 (0-indexed: 19 to 29)
for pno in range(19, 30):
    page = doc[pno]
    pix = page.get_pixmap(dpi=120)
    img = Image.frombytes("RGB", [pix.width, pix.height], pix.samples)
    w, h = img.size
    
    # Check left and right
    for half_name, box in [('LEFT', (0, 0, w//2, h)), ('RIGHT', (w//2, 0, w, h))]:
        sub = img.crop(box)
        res, _ = engine(np.array(sub))
        if not res: continue
        for b, text, s in res:
            if 'TYPE' in text.upper():
                print(f"Page {pno+1} {half_name}: HEADER '{text}' at y={b[0][1]}", flush=True)
