import fitz
import os

pdf_path = r'F:\startup  send mail\pdf\analogy question 2-70.pdf'
doc = fitz.open(pdf_path)

out_dir = r'c:\ssczone\scripts\pdf_samples'

check_pages = [10, 20, 30, 40, 50, 60]
for pno in check_pages:
    page = doc[pno]
    pix = page.get_pixmap(dpi=100)
    out_path = os.path.join(out_dir, f"page_{pno+1}.png")
    pix.save(out_path)
    print(f"Saved {out_path}")
