import fitz
import sys

sys.stdout.reconfigure(encoding='utf-8')

pdf_path = r"F:\startup  send mail\2026\SSC CGL 2026 (Held On_ 8 Oct 2026 Shift 3).pdf"
doc = fitz.open(pdf_path)
page = doc[2] # page 3

print("Text on page 3:")
lines = [l.strip() for l in page.get_text().split("\n") if l.strip()]
for l in lines[:40]:
    print("  ", l)

print("\nImages on page 3 and their bboxes:")
for img in page.get_images(full=True):
    xref = img[0]
    bbox = page.get_image_bbox(img)
    print(f"Xref {xref}: bbox={bbox}")
