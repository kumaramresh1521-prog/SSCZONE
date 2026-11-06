import fitz
import os
import sys

sys.stdout.reconfigure(encoding='utf-8')

pdf_path = r"F:\startup  send mail\2026\SSC CGL 2026 (Held On_ 30 Sep 2026 Shift 3).pdf"
doc = fitz.open(pdf_path)

out_dir = r"c:\ssczone\public\images\pyq\2026"
os.makedirs(out_dir, exist_ok=True)

# Test on page 9
page = doc[8]
for img in page.get_images():
    xref = img[0]
    rects = page.get_image_rects(xref)
    # Check non-header/footer images (y > 50 and y < 750)
    filtered = [r for r in rects if r.y0 > 50 and r.y1 < 750]
    if filtered:
        base = doc.extract_image(xref)
        img_bytes = base["image"]
        ext = base["ext"]
        out_path = os.path.join(out_dir, f"test_img_{xref}.{ext}")
        with open(out_path, "wb") as f:
            f.write(img_bytes)
        print(f"Extracted image {xref}: {out_path} ({len(img_bytes)} bytes, rect={filtered[0]})")
