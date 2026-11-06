import fitz
import sys

sys.stdout.reconfigure(encoding='utf-8')

pdf_path = r"F:\startup  send mail\2026\SSC CGL 2026 (Held On_ 30 Sep 2026 Shift 3).pdf"
doc = fitz.open(pdf_path)
page = doc[3] # Page 4

rect = fitz.Rect(60, 100, 300, 240)
pix = page.get_pixmap(clip=rect, dpi=150)
out_path = r"c:\ssczone\public\images\pyq\2026\test_q13_rendered.png"
pix.save(out_path)
print(f"Rendered Q.13 to {out_path} ({pix.width}x{pix.height})")
