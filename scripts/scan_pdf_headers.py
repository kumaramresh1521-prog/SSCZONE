import fitz
from PIL import Image
import numpy as np
from rapidocr_onnxruntime import RapidOCR
import sys

sys.stdout.reconfigure(encoding='utf-8')
engine = RapidOCR()

pdf_path = r'F:\startup  send mail\pdf\analogy question 2-70.pdf'
doc = fitz.open(pdf_path)

print(f"Scanning 69 pages of {pdf_path}...")

# Check top of each page for headers
for pno in range(len(doc)):
    page = doc[pno]
    # Check top 25% of the page
    pix = page.get_pixmap(dpi=100)
    img = Image.frombytes("RGB", [pix.width, pix.height], pix.samples)
    w, h = img.size
    top = img.crop((0, 0, w, int(h * 0.35)))
    res, _ = engine(np.array(top))
    
    if res:
        for b, text, s in res:
            t_up = text.upper()
            if any(k in t_up for k in ['TYPE-I', 'TYPE-II', 'TYPE-III', 'TYPE-IV', 'TYPE-V', 'TYPE -', 'ANSWERS', 'EXPLANATION']):
                print(f"Page {pno+1}: Header '{text}'")
