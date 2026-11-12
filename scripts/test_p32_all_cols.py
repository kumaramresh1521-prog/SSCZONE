import fitz
from rapidocr_onnxruntime import RapidOCR
import time

doc = fitz.open('analogy_chapter2.pdf')
page = doc[31] # Page 32 (idx 31)

# In page 32:
# Left half: x from 25 to 415, y from 35 to 580
# Col 0: 25 to 155
# Col 1: 155 to 285
# Col 2: 285 to 415
# Right half: x from 425 to 815, y from 35 to 580
# Col 0: 425 to 555
# Col 1: 555 to 685
# Col 2: 685 to 815

cols_rects = [
    ("p32_l_c0", fitz.Rect(25, 35, 155, 580)),
    ("p32_l_c1", fitz.Rect(155, 35, 285, 580)),
    ("p32_l_c2", fitz.Rect(285, 35, 415, 580)),
    ("p32_r_c0", fitz.Rect(425, 35, 555, 580)),
    ("p32_r_c1", fitz.Rect(555, 35, 685, 580)),
    ("p32_r_c2", fitz.Rect(685, 35, 815, 580)),
]

engine = RapidOCR()
t_start = time.time()
for name, r in cols_rects:
    t0 = time.time()
    pix = page.get_pixmap(dpi=150, clip=r)
    res, _ = engine(pix.tobytes("png"))
    count = len(res) if res else 0
    first_txt = res[0][1] if count > 0 else "NONE"
    print(f"{name}: {count} boxes in {time.time()-t0:.2f}s | First: {first_txt}")

print(f"All 6 columns processed in {time.time()-t_start:.2f}s")
