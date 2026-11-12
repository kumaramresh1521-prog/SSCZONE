import fitz
from PIL import Image
import numpy as np
from rapidocr_onnxruntime import RapidOCR
import sys

sys.stdout.reconfigure(encoding='utf-8')

pdf_path = r'F:\startup  send mail\pdf\analogy question 2-70.pdf'
doc = fitz.open(pdf_path)
engine = RapidOCR()

# Check page indices 15 to 22 (PDF Pages 16 to 23)
for pno in range(15, 23):
    page = doc[pno]
    pix = page.get_pixmap(dpi=100)
    img = Image.frombytes("RGB", [pix.width, pix.height], pix.samples)
    w, h = img.size
    
    # Check left half and right half for TYPE-III
    for half_name, box in [('left', (0, 0, w//2, h)), ('right', (w//2, 0, w, h))]:
        sub = img.crop(box)
        res, _ = engine(np.array(sub))
        if res:
            txt = " ".join([it[1] for it in res if 'TYPE' in it[1].upper()])
            if txt:
                print(f"Page {pno+1} {half_name}: {txt}")
