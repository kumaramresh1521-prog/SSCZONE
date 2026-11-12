import fitz
from rapidocr_onnxruntime import RapidOCR
import time

doc = fitz.open('analogy_chapter2.pdf')
page = doc[31] # Page 32
r = fitz.Rect(20, 30, 422, 585)
pix = page.get_pixmap(dpi=150, clip=r)
print(f"Half page size: {pix.width} x {pix.height}")

engine = RapidOCR(params={'use_angle_cls': False})
t0 = time.time()
res, _ = engine(pix.tobytes("png"))
print(f"Done in {time.time()-t0:.2f}s, found {len(res) if res else 0} boxes!")
# Check if Q12 and Q14 options are ALL present!
if res:
    for b, t, s in res:
        if any(k in t for k in ['12.', 'EMS', 'KOC', 'EOU', 'RVH', '14.', 'JPG', 'LRI', 'LRJ', 'JQG']):
            print(f"  x={b[0][0]:.1f}, y={b[0][1]:.1f} -> {t}")
