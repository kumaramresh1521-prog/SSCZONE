import fitz
from PIL import Image
import numpy as np
from rapidocr_onnxruntime import RapidOCR
import sys

sys.stdout.reconfigure(encoding='utf-8', line_buffering=True)
engine = RapidOCR()
doc = fitz.open(r'F:\startup  send mail\pdf\analogy question 2-70.pdf')

print("=== CHECKING QUESTIONS SECTION (Pages 20-38) ===")
# Pages 20 to 38 (0-indexed 19 to 37)
for pno in range(19, 38):
    page = doc[pno]
    pix = page.get_pixmap(dpi=100)
    img = Image.frombytes("RGB", [pix.width, pix.height], pix.samples)
    w, h = img.size
    
    # Check top third
    top = img.crop((0, 0, w, int(h * 0.4)))
    res, _ = engine(np.array(top))
    if res:
        for b, text, s in res:
            t = text.upper()
            if any(k in t for k in ['TYPE-III', 'TYPE-IV', 'TYPE-V', 'TYPE IV', 'TYPE V', 'TYPE-3', 'TYPE-4', 'TYPE-5']):
                print(f"Page {pno+1}: {text}")
