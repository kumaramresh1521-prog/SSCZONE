import fitz
from PIL import Image
import numpy as np
from rapidocr_onnxruntime import RapidOCR
import sys

sys.stdout.reconfigure(encoding='utf-8', line_buffering=True)

pdf_path = r'F:\startup  send mail\pdf\analogy question 2-70.pdf'
doc = fitz.open(pdf_path)
engine = RapidOCR()

print("Scanning pages 8 to 25 to locate TYPE-II and TYPE-III boundaries...", flush=True)

# Page indices 8 to 22 (PDF Pages 9 to 23)
for pno in range(8, 23):
    page = doc[pno]
    pix = page.get_pixmap(dpi=100)
    img = Image.frombytes("RGB", [pix.width, pix.height], pix.samples)
    w, h = img.size
    
    # Check left half
    left_img = img.crop((0, 0, w // 2, h))
    res_l, _ = engine(np.array(left_img))
    txt_l = " ".join([it[1] for it in res_l if 'TYPE' in it[1].upper()]) if res_l else ""
    
    # Check right half
    right_img = img.crop((w // 2, 0, w, h))
    res_r, _ = engine(np.array(right_img))
    txt_r = " ".join([it[1] for it in res_r if 'TYPE' in it[1].upper()]) if res_r else ""
    
    if txt_l or txt_r:
        print(f"Page {pno+1}: Left='{txt_l}' | Right='{txt_r}'", flush=True)
