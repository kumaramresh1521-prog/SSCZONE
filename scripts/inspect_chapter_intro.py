import fitz
from PIL import Image
import numpy as np
from rapidocr_onnxruntime import RapidOCR
import sys

sys.stdout.reconfigure(encoding='utf-8', line_buffering=True)
engine = RapidOCR()

doc = fitz.open(r'F:\startup  send mail\pdf\analogy question 2-70.pdf')

# Inspect Page 1 and Page 2 (0-indexed: 0 and 1)
for pno in [0, 1]:
    page = doc[pno]
    pix = page.get_pixmap(dpi=150)
    img = Image.frombytes("RGB", [pix.width, pix.height], pix.samples)
    res, _ = engine(np.array(img))
    print(f"\n================ PAGE {pno+1} ================")
    if res:
        for b, text, s in res:
            if any(k in text.upper() for k in ['TYPE', 'ANALOGY', 'CHAPTER', 'CONTENTS', 'SIMILARITY', 'सादृश्यता']):
                print(f"  {text}")
