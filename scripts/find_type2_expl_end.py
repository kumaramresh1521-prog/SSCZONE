import fitz
from PIL import Image
import numpy as np
from rapidocr_onnxruntime import RapidOCR
import sys

sys.stdout.reconfigure(encoding='utf-8')

pdf_path = r'F:\startup  send mail\pdf\analogy question 2-70.pdf'
doc = fitz.open(pdf_path)
engine = RapidOCR()

# Check pages 49 to 54 (0-indexed: 48 to 53)
for pno in range(48, 54):
    page = doc[pno]
    pix = page.get_pixmap(dpi=120)
    img = Image.frombytes("RGB", [pix.width, pix.height], pix.samples)
    w, h = img.size
    
    # Check top half of left and right
    for half_name, box in [('left', (0, 0, w//2, h//2)), ('right', (w//2, 0, w, h//2))]:
        sub = img.crop(box)
        res, _ = engine(np.array(sub))
        if res:
            for it in res:
                if 'TYPE' in it[1].upper():
                    print(f"Page {pno+1} {half_name}: {it[1]}")
