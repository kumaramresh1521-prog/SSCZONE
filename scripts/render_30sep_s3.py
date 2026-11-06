import fitz
import sys

sys.stdout.reconfigure(encoding='utf-8')

pdf_path = r'F:\startup  send mail\2026\SSC CGL 2026 (Held On_ 30 Sep 2026 Shift 3).pdf'
doc = fitz.open(pdf_path)

for pno in [1, 3]: # page 2 and page 4
    page = doc[pno]
    mat = fitz.Matrix(2.0, 2.0)
    pix = page.get_pixmap(matrix=mat)
    pix.save(f"c:\\ssczone\\scripts\\scratch_imgs\\p{pno+1}_30sep_s3.png")
    print(f"Rendered page {pno+1}")
