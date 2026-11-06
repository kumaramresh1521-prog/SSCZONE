import fitz
import sys

sys.stdout.reconfigure(encoding='utf-8')

pdf_path = r"F:\startup  send mail\2026\SSC CGL 2026 (Held On_ 30 Sep 2026 Shift 3).pdf"
doc = fitz.open(pdf_path)
page = doc[1] # Page 2

print("=== TEXT BLOCKS ===")
for b in page.get_text("blocks"):
    if "05." in b[4] or "(A)" in b[4] or "Ans:" in b[4]:
        print(f"Text ({b[0]:.1f}, {b[1]:.1f}, {b[2]:.1f}, {b[3]:.1f}):\n{repr(b[4])}")

print("\n=== IMAGES ===")
for img in page.get_images():
    xref = img[0]
    rects = page.get_image_rects(xref)
    for r in rects:
        print(f"Image xref {xref} rect: ({r.x0:.1f}, {r.y0:.1f}, {r.x1:.1f}, {r.y1:.1f})")
