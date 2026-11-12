import fitz
from PIL import Image
import numpy as np
from rapidocr_onnxruntime import RapidOCR
import sys

sys.stdout.reconfigure(encoding='utf-8', line_buffering=True)
engine = RapidOCR()
doc = fitz.open('analogy_chapter2.pdf')

print("Searching for K5279/91 or K5279/92...")
for pno in range(35, 45):
    page = doc[pno]
    pix = page.get_pixmap(dpi=100)
    im = Image.frombytes('RGB', [pix.width, pix.height], pix.samples)
    w, h = im.size
    
    # Check bottom 20%
    bot = im.crop((0, int(h * 0.8), w, h))
    res, _ = engine(np.array(bot))
    for b, t, s in (res or []):
        if 'K5279' in t or '90' in t or '91' in t or '92' in t:
            print(f"PDF Page {pno+1}: '{t}'")
