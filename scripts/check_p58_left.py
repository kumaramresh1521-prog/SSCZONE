import fitz
from PIL import Image
from rapidocr_onnxruntime import RapidOCR
import numpy as np

engine = RapidOCR()
doc = fitz.open('analogy_chapter2.pdf')
page = doc[57] # Page 58
pix = page.get_pixmap(dpi=75)
im = Image.frombytes('RGB', [pix.width, pix.height], pix.samples)
w, h = im.size
mid_x = w // 2

# Left half bottom
left_bot = im.crop((0, int(h * 0.5), mid_x, h))
res, _ = engine(np.array(left_bot))

print("=== PAGE 58 LEFT HALF BOTTOM ===")
for b, t, s in res:
    if 'TYPE' in t or '1.' in t or '2.' in t:
        print(f"{t} at y={b[0][1]}")
