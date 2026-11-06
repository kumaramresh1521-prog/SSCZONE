import fitz
import sys

sys.stdout.reconfigure(encoding='utf-8')

pdf_path = r"F:\startup  send mail\2026\SSC CGL 2026 (Held On_ 30 Sep 2026 Shift 3).pdf"
doc = fitz.open(pdf_path)
page = doc[8] # Page 9
images = page.get_images()

for img in images:
    xref = img[0]
    rects = page.get_image_rects(xref)
    print(f"xref={xref}: rects={rects}")
