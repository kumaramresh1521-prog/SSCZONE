import fitz
from PIL import Image
import numpy as np
from rapidocr_onnxruntime import RapidOCR
import sys

sys.stdout.reconfigure(encoding='utf-8', line_buffering=True)
engine = RapidOCR()

doc = fitz.open(r'F:\startup  send mail\pdf\analogy question 2-70.pdf')
page18 = doc[17] # 0-indexed 17 is page 18
pix = page18.get_pixmap(dpi=150)
img = Image.frombytes("RGB", [pix.width, pix.height], pix.samples)
w, h = img.size

# Check right half of Page 18
right_half = img.crop((w//2, 0, w, h))
res, _ = engine(np.array(right_half))
for b, text, s in res:
    if 'TYPE' in text.upper() or '307' in text or '306' in text or '305' in text or '1.' in text:
        print(f"Page 18 Right: {text} at y={b[0][1]}")
