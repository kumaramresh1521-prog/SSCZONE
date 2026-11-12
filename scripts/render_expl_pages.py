import fitz
import os

doc = fitz.open(r'F:\startup  send mail\pdf\analogy question 2-70.pdf')
out_dir = r'c:\ssczone\scripts\pdf_samples\expl_pages'
os.makedirs(out_dir, exist_ok=True)

# Pages 40 to 44 (0-indexed: 39, 40, 41, 42, 43)
for pno in range(39, 44):
    page = doc[pno]
    pix = page.get_pixmap(dpi=150)
    out_path = os.path.join(out_dir, f"expl_p{pno+1}.png")
    pix.save(out_path)
    print(f"Saved {out_path} ({pix.width}x{pix.height})")
