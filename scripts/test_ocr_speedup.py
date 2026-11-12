import fitz
from rapidocr_onnxruntime import RapidOCR
import time

doc = fitz.open('analogy_chapter2.pdf')
page = doc[31]
r = fitz.Rect(25, 35, 155, 580)
pix = page.get_pixmap(dpi=150, clip=r)

# Test with use_angle_cls=False
engine = RapidOCR(params={'use_angle_cls': False})
t0 = time.time()
res, _ = engine(pix.tobytes("png"))
print(f"Processed in {time.time()-t0:.2f}s with {len(res) if res else 0} boxes")
if res:
    print("Sample:", res[0][1], "...", res[5][1])
