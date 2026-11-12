import fitz
from PIL import Image
import numpy as np
from rapidocr_onnxruntime import RapidOCR
import sys

sys.stdout.reconfigure(encoding='utf-8', line_buffering=True)
engine = RapidOCR()
doc = fitz.open(r'F:\startup  send mail\pdf\analogy question 2-70.pdf')

print("=== LOCATING EXACT TYPE-IV & TYPE-V BOUNDARIES ===")

# Pages 25 to 69
# Let's check page headers (top 15% and bottom 15% where headers appear)
for pno in range(24, 69):
    page = doc[pno]
    pix = page.get_pixmap(dpi=80)
    img = Image.frombytes("RGB", [pix.width, pix.height], pix.samples)
    w, h = img.size
    
    # Just sample a few strips
    top = img.crop((0, 0, w, int(h * 0.25)))
    res, _ = engine(np.array(top))
    if res:
        for b, text, s in res:
            t = text.upper()
            if any(k in t for k in ['TYPE-IV', 'TYPE-V', 'TYPE IV', 'TYPE V', 'TYPE -IV', 'TYPE -V', 'ANSWERS', 'EXPLANATION']):
                print(f"Page {pno+1}: '{text}' at y={b[0][1]:.1f}")
