import fitz
from PIL import Image
import numpy as np
from rapidocr_onnxruntime import RapidOCR
import re
import sys

sys.stdout.reconfigure(encoding='utf-8')
engine = RapidOCR()

doc = fitz.open(r'F:\startup  send mail\pdf\analogy question 2-70.pdf')

# Let's inspect Page 28, 29, 30 to see where Type-III ends and Type-IV starts in questions!
# In questions, 257 questions of Type-III would span roughly 7-8 pages (from p18 to ~p26).
for pno in [24, 25, 26, 27, 28, 29, 30]:
    page = doc[pno]
    pix = page.get_pixmap(dpi=120)
    img = Image.frombytes("RGB", [pix.width, pix.height], pix.samples)
    w, h = img.size
    
    # Check left and right
    for half_name, box in [('LEFT', (0, 0, w//2, h)), ('RIGHT', (w//2, 0, w, h))]:
        sub = img.crop(box)
        res, _ = engine(np.array(sub))
        if not res: continue
        for b, text, s in res:
            if 'TYPE' in text.upper():
                print(f"Page {pno+1} {half_name}: HEADER '{text}' at y={b[0][1]}")
            m = re.findall(r'(\d{1,3})\s*[\.\)]\s*([A-Za-z]+|\([1-4]\)|Select)', text)
            if '257' in text or '256' in text or '258' in text:
                print(f"Page {pno+1} {half_name}: Found {text}")
