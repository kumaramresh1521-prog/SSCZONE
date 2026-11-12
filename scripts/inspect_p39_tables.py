import fitz
from PIL import Image
import numpy as np
from rapidocr_onnxruntime import RapidOCR
import sys

sys.stdout.reconfigure(encoding='utf-8')

pdf_path = r'F:\startup  send mail\pdf\analogy question 2-70.pdf'
doc = fitz.open(pdf_path)
engine = RapidOCR()

# Render page 39 (0-indexed 38)
page = doc[38]
pix = page.get_pixmap(dpi=150)
img = Image.frombytes("RGB", [pix.width, pix.height], pix.samples)

res, _ = engine(np.array(img))
# Find all lines containing TYPE or ANSWERS
for box, txt, score in res:
    if 'TYPE' in txt.upper() or 'ANS' in txt.upper():
        print(f"y={box[0][1]:.1f}, x={box[0][0]:.1f}: {txt}")
