import fitz
import sys

sys.stdout.reconfigure(encoding='utf-8')

pdf_path = r"F:\startup  send mail\2026\SSC CGL 2026 (Held On_ 30 Sep 2026 Shift 2).pdf"
doc = fitz.open(pdf_path)
page = doc[7] # Page 8
blocks = page.get_text("blocks")
for b in blocks:
    if b[1] >= 360 and b[3] <= 450 and b[0] < 300:
        print(f"y0={b[1]:.1f}, y1={b[3]:.1f}, x0={b[0]:.1f}: {repr(b[4])}")
