import fitz
from PIL import Image
import numpy as np
from rapidocr_onnxruntime import RapidOCR
import re, gc

engine = RapidOCR()
doc = fitz.open('analogy_chapter2.pdf')

# Page 32 is 0-indexed page 31
page = doc[31]
pix = page.get_pixmap(dpi=150)
im = Image.frombytes('RGB', [pix.width, pix.height], pix.samples)
w, h = im.size

# Left half is from x=0 to w//2
# Col 0 on left half: x from ~60 to ~290 of left half
im_left = im.crop((0, 0, w//2, h))
w_l, h_l = im_left.size

# Crop Col 0 (x: 50 to 280, y: 50 to h_l - 50)
col0 = im_left.crop((50, 60, 290, h_l - 60))
col0.save('scripts/pdf_samples/col0_150dpi.png')

res, _ = engine(np.array(col0))
print(f"Col 0 at 150 DPI: {len(res)} boxes")
for b, t, s in res:
    print(f"  {t}")
