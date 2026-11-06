import fitz
import sys

sys.stdout.reconfigure(encoding='utf-8')

pdf_path = r"C:\Users\Admin\Downloads\SSC CGL, 2025 Official Paper (Held On_ 12 Sept, 2025 Shift 3).pdf"
doc = fitz.open(pdf_path)

page = doc[15] # Page 16
images = page.get_images()
print(f"Images on page 16: {len(images)}")
for img in images:
    print(img)

drawings = page.get_drawings()
print(f"Drawings on page 16: {len(drawings)}")
for d in drawings:
    rect = d.get("rect")
    if 270 <= rect.y0 <= 320:
        print(f"Drawing in Q53: rect={rect}, items={len(d['items'])}")
