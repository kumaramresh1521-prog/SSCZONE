import fitz
from PIL import Image
import numpy as np
from rapidocr_onnxruntime import RapidOCR
import sys

sys.stdout.reconfigure(encoding='utf-8')

pdf_path = r'F:\startup  send mail\pdf\analogy question 2-70.pdf'
doc = fitz.open(pdf_path)
engine = RapidOCR()

print("Scanning page headers for TYPE-II and TYPE-III boundaries...")

# Check pages 8 to 22 for questions
for pno in range(7, 22):
    page = doc[pno]
    pix = page.get_pixmap(dpi=100)
    img = Image.frombytes("RGB", [pix.width, pix.height], pix.samples)
    # Check top 35% of the page
    top_img = img.crop((0, 0, img.width, int(img.height * 0.35)))
    res, _ = engine(np.array(top_img))
    txt = " ".join([it[1] for it in res]) if res else ""
    if 'TYPE' in txt.upper():
        print(f"Page {pno+1}: {txt[:100]}")
