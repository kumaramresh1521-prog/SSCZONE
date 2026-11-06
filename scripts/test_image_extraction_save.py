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
slug = "ssc-cgl-2026-30-september-2026-shift-3"

# 1. Collect all content images per page
page_images = {}
for p_idx in range(1, len(doc)):
    page = doc[p_idx]
    images = page.get_images()
    page_images[p_idx] = []
    for img in images:
        xref = img[0]
        rects = page.get_image_rects(xref)
        for r in rects:
            if r.y0 > 55 and r.y1 < 780 and (r.x1 - r.x0) > 30 and (r.y1 - r.y0) > 30:
                if not ((r.x1 - r.x0) > 400 and (r.y1 - r.y0) > 400):
                    # Save image if not exists
                    base = doc.extract_image(xref)
                    ext = base["ext"]
                    img_name = f"{slug}_p{p_idx+1}_x{xref}.{ext}"
                    img_path = os.path.join(out_dir, img_name)
                    if not os.path.exists(img_path):
                        with open(img_path, "wb") as f:
                            f.write(base["image"])
                    page_images[p_idx].append({
                        "xref": xref,
                        "rect": r,
                        "url": f"/images/pyq/2026/{img_name}",
                        "w": r.x1 - r.x0,
                        "h": r.y1 - r.y0,
                        "col": 0 if (r.x0 + r.x1)/2 < 305 else 1,
                        "p_idx": p_idx
                    })

print(f"Extracted content images across pages: {sum(len(v) for v in page_images.values())}")

# Print on page 2 and page 4
for p in [1, 3]:
    print(f"Page {p+1} images count: {len(page_images[p])}")
    for im in page_images[p]:
        print(f"   Col {im['col']}, rect=({im['rect'].x0:.1f}, {im['rect'].y0:.1f}, {im['rect'].x1:.1f}, {im['rect'].y1:.1f}), w={im['w']:.1f}, url={im['url']}")
