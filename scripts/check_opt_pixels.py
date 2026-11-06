import fitz
import numpy as np

pdf_path = r"F:\startup  send mail\2026\SSC CGL 2026 (Held On_ 30 Sep 2026 Shift 3).pdf"
doc = fitz.open(pdf_path)
page = doc[3] # Page 4

opt_rects = {
    'A': fitz.Rect(102, 168, 185, 200),
    'B': fitz.Rect(206, 168, 290, 200),
    'C': fitz.Rect(102, 202, 185, 235),
    'D': fitz.Rect(206, 202, 290, 235)
}

for let, r in opt_rects.items():
    pix = page.get_pixmap(clip=r, dpi=150)
    arr = np.frombuffer(pix.samples, dtype=np.uint8)
    non_white = np.sum(arr < 240)
    print(f"Option {let} rect {r}: {pix.width}x{pix.height}, non-white pixels={non_white}")
    pix.save(f"c:\\ssczone\\public\\images\\pyq\\2026\\test_opt_{let}.png")
