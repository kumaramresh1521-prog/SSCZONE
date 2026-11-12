import fitz
from PIL import Image
import numpy as np
from rapidocr_onnxruntime import RapidOCR

engine = RapidOCR()
doc = fitz.open(r'C:\ssczone\analogy_chapter2.pdf')

# Check explanations pages: 62, 63, 64, 65, 66, 67, 68
for pno in range(61, 69):
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
                if 'TYPE-V' in t.upper() or 'TYPE -V' in t.upper() or 'TYPE - V' in t.upper() or 'TYPE V' in t.upper():
                    print(f"EXPLANATIONS: Found '{t}' on Page {pno+1} {half_name} at y={b[0][1]}")
