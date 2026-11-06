import fitz
import sys

sys.stdout.reconfigure(encoding='utf-8')

pdf_path = r"F:\startup  send mail\2026\SSC CGL 2026 (Held On_ 30 Sep 2026 Shift 2).pdf"
doc = fitz.open(pdf_path)
page = doc[3] # Page 4

blocks = page.get_text("blocks")
for b in blocks:
    txt = b[4].strip()
    if txt and ("24." in txt or "25." in txt or "26." in txt or "27." in txt or "28." in txt):
        print(f"x0={b[0]:.1f}, y0={b[1]:.1f}, x1={b[2]:.1f}, y1={b[3]:.1f}: {txt[:60].replace(chr(10), ' ')}")
