import fitz
from PIL import Image
import numpy as np
from rapidocr_onnxruntime import RapidOCR

engine = RapidOCR()
doc = fitz.open(r'C:\ssczone\analogy_chapter2.pdf')

# Check explanations pages: 56, 57, 58, 59
for pno in [56, 57, 58, 59]:
    page = doc[pno]
    pix = page.get_pixmap(dpi=100)
    img = Image.frombytes("RGB", [pix.width, pix.height], pix.samples)
    w, h = img.size
    
    # Check left and right
    for half_name, box in [('LEFT', (0, 0, w//2, h)), ('RIGHT', (w//2, 0, w, h))]:
        sub = img.crop(box)
        res, _ = engine(np.array(sub))
        if res:
            for b, t, s in res:
                if 'TYPE-IV' in t.upper() or 'TYPE -IV' in t.upper():
                    print(f"EXPLANATIONS: Found '{t}' on Page {pno+1} {half_name} at y={b[0][1]}")
                if 'TYPE-V' in t.upper() or 'TYPE -V' in t.upper():
                    print(f"EXPLANATIONS: Found '{t}' on Page {pno+1} {half_name} at y={b[0][1]}")
