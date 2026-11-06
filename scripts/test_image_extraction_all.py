import fitz
import sys

sys.stdout.reconfigure(encoding='utf-8')

pdf_path = r"F:\startup  send mail\2026\SSC CGL 2026 (Held On_ 30 Sep 2026 Shift 3).pdf"
doc = fitz.open(pdf_path)

# Let's inspect all images across all pages of this PDF
total_imgs = 0
for p_idx, page in enumerate(doc):
    imgs = page.get_images()
    valid_imgs = []
    for img in imgs:
        xref = img[0]
        rects = page.get_image_rects(xref)
        for r in rects:
            # Skip header banner (y < 60) and footer banner (y > 780)
            if r.y0 > 55 and r.y1 < 770 and (r.x1 - r.x0) > 30 and (r.y1 - r.y0) > 30:
                valid_imgs.append((xref, r))
    if valid_imgs:
        print(f"Page {p_idx+1}: {len(valid_imgs)} content images")
        for x, r in valid_imgs:
            print(f"   xref {x}: ({r.x0:.1f}, {r.y0:.1f}, {r.x1:.1f}, {r.y1:.1f}), w={r.x1-r.x0:.1f}, h={r.y1-r.y0:.1f}")
        total_imgs += len(valid_imgs)

print("Total content images in this PDF:", total_imgs)
