import fitz
from PIL import Image
import numpy as np
from rapidocr_onnxruntime import RapidOCR
import sys

sys.stdout.reconfigure(encoding='utf-8')

pdf_path = r'F:\startup  send mail\pdf\analogy question 2-70.pdf'
doc = fitz.open(pdf_path)
engine = RapidOCR()

# Pages 16 to 22 (0-indexed: 15 to 21)
for pno in range(15, 22):
    page = doc[pno]
    pix = page.get_pixmap(dpi=100)
    img = Image.frombytes("RGB", [pix.width, pix.height], pix.samples)
    w, h = img.size
    
    # Check top 20% of both halves
    for half_name, box in [('left', (0, 0, w//2, int(h*0.25))), ('right', (w//2, 0, w, int(h*0.25)))]:
        sub = img.crop(box)
        res, _ = engine(np.array(sub))
        if res:
            for it in res:
                if 'TYPE' in it[1].upper() or 'ANALOGY' in it[1].upper():
                    print(f"Page {pno+1} {half_name}: {it[1]}")
