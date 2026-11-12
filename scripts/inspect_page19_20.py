import fitz
from PIL import Image
import numpy as np
from rapidocr_onnxruntime import RapidOCR
import sys

sys.stdout.reconfigure(encoding='utf-8', line_buffering=True)
engine = RapidOCR()

pdf_path = r'F:\startup  send mail\pdf\analogy question 2-70.pdf'
doc = fitz.open(pdf_path)

# Let's inspect Page 19 and 20 (0-indexed: 18 and 19)
for pno in [18, 19]:
    page = doc[pno]
    pix = page.get_pixmap(dpi=150)
    img = Image.frombytes("RGB", [pix.width, pix.height], pix.samples)
    w, h = img.size
    print(f"\n================ PAGE {pno+1} ({w}x{h}) ================")
    for half_name, box in [('LEFT', (0, 0, w//2, h)), ('RIGHT', (w//2, 0, w, h))]:
        sub = img.crop(box)
        res, _ = engine(np.array(sub))
        if not res: continue
        headers = [text for b, text, s in res if 'TYPE' in text.upper()]
        print(f"--- {half_name} HALF ---")
        print("  Headers:", headers)
        for b, text, s in res[:10]:
            print(f"  first: {text}")
        for b, text, s in res[-5:]:
            print(f"  last: {text}")
