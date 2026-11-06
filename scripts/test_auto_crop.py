import fitz
import numpy as np
import os

pdf_path = r"F:\startup  send mail\2026\SSC CGL 2026 (Held On_ 30 Sep 2026 Shift 3).pdf"
doc = fitz.open(pdf_path)
page = doc[3]

# Question rect
q_rect = fitz.Rect(65, 105, 300, 168)
pix_q = page.get_pixmap(clip=q_rect, dpi=150)
pix_q.save(r"c:\ssczone\public\images\pyq\2026\test_q13_fig.png")
print(f"Saved Q.13 fig: {pix_q.width}x{pix_q.height}")

for let, r in [('A', fitz.Rect(87, 168, 190, 200)), ('B', fitz.Rect(192, 168, 295, 200)),
               ('C', fitz.Rect(87, 202, 190, 235)), ('D', fitz.Rect(192, 202, 295, 235))]:
    pix = page.get_pixmap(clip=r, dpi=150)
    out = f"c:\\ssczone\\public\\images\\pyq\\2026\\test_q13_opt_{let}.png"
    pix.save(out)
    arr = np.frombuffer(pix.samples, dtype=np.uint8)
    print(f"Saved {let}: {pix.width}x{pix.height}, non-white={np.sum(arr < 240)}")
