import fitz
from PIL import Image
import numpy as np
from rapidocr_onnxruntime import RapidOCR
import sys

sys.stdout.reconfigure(encoding='utf-8', line_buffering=True)

pdf_path = r'F:\startup  send mail\pdf\analogy question 2-70.pdf'
doc = fitz.open(pdf_path)
engine = RapidOCR()

# Pages 38, 39, 40 (0-indexed: 37, 38, 39)
for pno in [37, 38, 39]:
    page = doc[pno]
    pix = page.get_pixmap(dpi=150)
    img = Image.frombytes("RGB", [pix.width, pix.height], pix.samples)
    res, _ = engine(np.array(img))
    print(f"=== Page {pno+1} ({len(res)} text blocks) ===", flush=True)
    for box, txt, score in res:
        if any(k in txt.upper() for k in ['TYPE-I', 'TYPE-II', 'TYPE-III', 'TYPE-IV', 'ANSWERS']):
            print(f"  y={box[0][1]:.1f}, x={box[0][0]:.1f}: {txt}", flush=True)
