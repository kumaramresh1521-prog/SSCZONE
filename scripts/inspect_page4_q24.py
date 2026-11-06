import fitz
import sys

sys.stdout.reconfigure(encoding='utf-8')

doc = fitz.open(r"F:\startup  send mail\2026\SSC CGL 2026 (Held On_ 1 Oct 2026 Shift 3).pdf")
page = doc[3] # page 4

# Let's find rect for "24."
rects = page.search_for("24. How many triangles")
print("Search rect for Q.24:", rects)

rects_ans = page.search_for("(A) 27")
print("Search rect for (A) 27:", rects_ans)

# Check all images on page 4 and their bbox
for img_info in page.get_images(full=True):
    xref = img_info[0]
    bbox = page.get_image_bbox(img_info)
    print(f"XObject image xref {xref}, bbox: {bbox}")

# Check all drawings on page 4
drawings = page.get_drawings()
print(f"Total drawings: {len(drawings)}")
for d in drawings:
    print(f"Drawing rect: {d['rect']}")
