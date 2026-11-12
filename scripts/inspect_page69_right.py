import fitz
from PIL import Image
import numpy as np
from rapidocr_onnxruntime import RapidOCR

engine = RapidOCR()
doc = fitz.open(r'C:\ssczone\analogy_chapter2.pdf')

page = doc[68] # Page 69 (last page)
pix = page.get_pixmap(dpi=150)
img = Image.frombytes("RGB", [pix.width, pix.height], pix.samples)
w, h = img.size

right = img.crop((w // 2, 0, w, h))
res, _ = engine(np.array(right))

print("=== PAGE 69 RIGHT (TYPE-V START IN EXPLANATIONS) ===")
for b, t, s in res:
    print(f"y={b[0][1]:.1f}: '{t}'")
