import fitz
import sys
import os

sys.stdout.reconfigure(encoding='utf-8')

pdf_path = r'F:\startup  send mail\2026\SSC CGL 2026 (Held On_ 30 Sep 2026 Shift 3).pdf'
doc = fitz.open(pdf_path)

page = doc[3] # page 4
images = page.get_images(full=True)
print(f"Page 4 has {len(images)} images:")

for idx, img in enumerate(images):
    xref = img[0]
    base_img = doc.extract_image(xref)
    w = base_img.get('width', 0)
    h = base_img.get('height', 0)
    print(f"  Img {idx+1}: xref={xref}, size={w}x{h}, name={img[7]}")
    # Save image
    out_p = f"c:\\ssczone\\scripts\\scratch_imgs\\p4_img_{idx+1}_xref{xref}.png"
    with open(out_p, 'wb') as f:
        f.write(base_img['image'])
