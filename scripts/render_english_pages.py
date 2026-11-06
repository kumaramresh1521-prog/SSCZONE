import fitz
import sys

sys.stdout.reconfigure(encoding='utf-8')
pdf_path = r'F:\startup  send mail\2026\SSC CGL 2026 (Held On_ 12 Oct 2026 Shift 3).pdf'
doc = fitz.open(pdf_path)

# Render pages 10, 11, 12
for pno in [9, 10, 11]:
    page = doc[pno]
    mat = fitz.Matrix(2.5, 2.5)
    pix = page.get_pixmap(matrix=mat)
    pix.save(f"c:\\ssczone\\scripts\\scratch_imgs\\page_{pno+1}_render.png")
    print(f"Rendered page {pno+1}")
