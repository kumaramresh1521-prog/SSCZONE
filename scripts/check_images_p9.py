import fitz
import sys

sys.stdout.reconfigure(encoding='utf-8')

pdf_path = r"F:\startup  send mail\2026\SSC CGL 2026 (Held On_ 30 Sep 2026 Shift 3).pdf"
doc = fitz.open(pdf_path)
page = doc[8] # Page 9
images = page.get_images()
print("Images on Page 9:", len(images))
for img in images:
    xref = img[0]
    base_img = doc.extract_image(xref)
    print(f"xref={xref}: format={base_img['ext']}, width={base_img['width']}, height={base_img['height']}")
