import fitz
from PIL import Image
import numpy as np
from rapidocr_onnxruntime import RapidOCR
import sys

sys.stdout.reconfigure(encoding='utf-8', line_buffering=True)
engine = RapidOCR()
doc = fitz.open('analogy_chapter2.pdf')

for pno in range(27, 39):
    page = doc[pno]
    pix = page.get_pixmap(dpi=80)
    img = Image.frombytes("RGB", [pix.width, pix.height], pix.samples)
    w, h = img.size
    
    # Check top strip
    top = img.crop((0, 0, w, int(h * 0.15)))
    res_t, _ = engine(np.array(top))
    headings = []
    if res_t:
        for b, t, s in res_t:
            if any(k in t.upper() for k in ['TYPE', 'ANALOGY', 'CHAPTER', 'LETTER', 'MIXED', 'NUMBER']):
                headings.append(t)
    
    # Check full page for any occurrence of TYPE-IV or TYPE-V
    full, _ = engine(np.array(img))
    body_types = []
    max_q = 0
    if full:
        for b, t, s in full:
            if 'TYPE' in t.upper():
                body_types.append(f"{t} (y={b[0][1]:.0f})")
    print(f"Page {pno+1}: Top={headings} | Types={body_types}", flush=True)
