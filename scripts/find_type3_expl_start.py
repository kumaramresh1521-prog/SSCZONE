import fitz
from PIL import Image
import numpy as np
from rapidocr_onnxruntime import RapidOCR
import sys

sys.stdout.reconfigure(encoding='utf-8', line_buffering=True)
engine = RapidOCR()

doc = fitz.open(r'F:\startup  send mail\pdf\analogy question 2-70.pdf')

# Check pages 51, 52, 53 (0-indexed: 50, 51, 52)
for pno in [50, 51, 52]:
    page = doc[pno]
    pix = page.get_pixmap(dpi=120)
    img = Image.frombytes("RGB", [pix.width, pix.height], pix.samples)
    w, h = img.size
    print(f"\n================ PAGE {pno+1} ================", flush=True)
    for half_name, box in [('LEFT', (0, 0, w//2, h)), ('RIGHT', (w//2, 0, w, h))]:
        sub = img.crop(box)
        res, _ = engine(np.array(sub))
        if not res: continue
        headers = [text for b, text, s in res if 'TYPE' in text.upper()]
        print(f"Page {pno+1} {half_name}: Headers: {headers}", flush=True)
        # Check first and last items
        for b, text, s in res[:5]:
            if '1.' in text or '2.' in text or '3.' in text or '307' in text:
                print(f"  first: {text}", flush=True)
        for b, text, s in res[-5:]:
            if '1.' in text or '2.' in text or '3.' in text or '307' in text:
                print(f"  last: {text}", flush=True)
