import fitz
import os

pdf_path = r'F:\startup  send mail\pdf\analogy question 2-70.pdf'
doc = fitz.open(pdf_path)

out_dir = r'c:\ssczone\scripts\pdf_samples'

# Let's render pages 1 to 15 to locate Type-I questions
for pno in range(0, 16):
    page = doc[pno]
    pix = page.get_pixmap(dpi=90)
    out_path = os.path.join(out_dir, f"type1_p{pno+1}.png")
    pix.save(out_path)
    print(f"Rendered page {pno+1}")
