import fitz
import re
import sys
import os

sys.path.append(os.path.abspath("."))
sys.stdout.reconfigure(encoding='utf-8')

pdf_path = r"F:\startup  send mail\2026\SSC CGL 2026 (Held On_ 30 Sep 2026 Shift 3).pdf"
doc = fitz.open(pdf_path)

out_dir = r"c:\ssczone\public\images\pyq\2026"
os.makedirs(out_dir, exist_ok=True)

# Test extracting and classifying images on page 2 and page 4
for p_idx in [1, 3]: # page 2 (idx 1), page 4 (idx 3)
    page = doc[p_idx]
    images = page.get_images()
    print(f"\n=== PAGE {p_idx+1} ===")
    content_imgs = []
    for img in images:
        xref = img[0]
        rects = page.get_image_rects(xref)
        for r in rects:
            if r.y0 > 55 and r.y1 < 780 and (r.x1 - r.x0) > 30 and (r.y1 - r.y0) > 30:
                if not ((r.x1 - r.x0) > 400 and (r.y1 - r.y0) > 400): # not watermark
                    content_imgs.append((xref, r))
                    
    # Sort images top-to-bottom, left-to-right
    content_imgs.sort(key=lambda item: (round(item[1].y0 / 15.0), item[1].x0))
    for x, r in content_imgs:
        print(f"  Img xref {x}: rect=({r.x0:.1f}, {r.y0:.1f}, {r.x1:.1f}, {r.y1:.1f}), w={r.x1-r.x0:.1f}, h={r.y1-r.y0:.1f}")
