import fitz
import sys, os
sys.stdout.reconfigure(encoding='utf-8')

pdf_path = r'F:\startup  send mail\2026\SSC CGL 2026 (Held On_ 12 Oct 2026 Shift 3).pdf'
doc = fitz.open(pdf_path)

# Page 3 (index 2) has Q.11 and Q.14
page = doc[2]
img_list = page.get_images(full=True)
print("All images on page 3:")
for img in img_list:
    xref = img[0]
    # Get image info
    base_image = doc.extract_image(xref)
    ext = base_image["ext"]
    w = base_image.get("width", "?")
    h = base_image.get("height", "?")
    print(f"  xref={xref}, ext={ext}, size={w}x{h}, name={img[7]}")

# Also get full page text with positions to understand layout
print("\n--- Full page 3 text ---")
print(page.get_text())
