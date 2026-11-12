import fitz
from rapidocr_onnxruntime import RapidOCR

doc = fitz.open('analogy_chapter2.pdf')
page = doc[31]

engine = RapidOCR()
rect_col0 = fitz.Rect(25, 40, 160, 580)
pix = page.get_pixmap(dpi=150, clip=rect_col0)
res, _ = engine(pix.tobytes("png"))
if res:
    for idx, (b, t, s) in enumerate(res):
        print(f"{idx:2d}: {t}")
