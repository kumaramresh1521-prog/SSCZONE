import fitz
from rapidocr_onnxruntime import RapidOCR
import json
import re

doc = fitz.open('analogy_chapter2.pdf')
engine = RapidOCR()

# In page 32 (idx 31):
# Col 0 is x: 25 to 155, y: 35 to 580
# Q12 is around y=210 to 260
# Q13 is around y=250 to 295
# Q14 is around y=295 to 345
# Q16 is around y=380 to 430
# Q18 is around y=470 to 520

page = doc[31]

test_targets = [
    (12, fitz.Rect(25, 215, 155, 260)),
    (13, fitz.Rect(25, 255, 155, 300)),
    (14, fitz.Rect(25, 295, 155, 345)),
    (16, fitz.Rect(25, 385, 155, 435)),
    (18, fitz.Rect(25, 470, 155, 520)),
]

for qn, r in test_targets:
    pix = page.get_pixmap(dpi=200, clip=r)
    res, _ = engine(pix.tobytes("png"))
    lines = [b[1] for b in res] if res else []
    print(f"\n=== Q{qn} ===")
    for l in lines:
        print(f"  {l}")
