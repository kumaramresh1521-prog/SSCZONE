import fitz
from PIL import Image
import numpy as np
from rapidocr_onnxruntime import RapidOCR
import sys

sys.stdout.reconfigure(encoding='utf-8', line_buffering=True)
engine = RapidOCR()
doc = fitz.open('analogy_chapter2.pdf')

for pno in [36, 37, 38, 39]: # Pages 37, 38, 39, 40
    page = doc[pno]
    pix = page.get_pixmap(dpi=100)
    im = Image.frombytes('RGB', [pix.width, pix.height], pix.samples)
    w, h = im.size
    
    # Crop bottom 15%
    bot = im.crop((0, int(h * 0.85), w, h))
    res, _ = engine(np.array(bot))
    footers = [t for b, t, s in (res or []) if 'K5279' in t or any(c.isdigit() for c in t)]
    print(f"Page {pno+1} footers: {footers}")
