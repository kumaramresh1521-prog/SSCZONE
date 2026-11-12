import fitz
import os

pdf_path = r'F:\startup  send mail\pdf\analogy question 2-70.pdf'
doc = fitz.open(pdf_path)

out_dir = r'c:\ssczone\scripts\pdf_samples'
os.makedirs(out_dir, exist_ok=True)

# Render pages 1, 2, 3, 4, 68, 69
sample_pages = [0, 1, 2, 3, 67, 68]
for pno in sample_pages:
    page = doc[pno]
    pix = page.get_pixmap(dpi=150)
    out_path = os.path.join(out_dir, f"page_{pno+1}.png")
    pix.save(out_path)
    print(f"Saved {out_path} (size: {pix.width}x{pix.height})")
