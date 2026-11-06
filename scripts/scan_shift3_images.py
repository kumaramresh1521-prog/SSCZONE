import fitz
import sys
import os

sys.stdout.reconfigure(encoding='utf-8')

pdf_path = r"E:\pyq pdf\ssc-cgl-2025-12-september-2025-shift-3_SSC_ZONE.pdf"
if not os.path.exists(pdf_path):
    pdf_path = r"C:\ssczone\public\papers\ssc-cgl-2025-12-september-2025-shift-3.pdf"

print(f"Opening: {pdf_path}")
doc = fitz.open(pdf_path)

total_images = 0
image_details = []

for pno in range(len(doc)):
    page = doc[pno]
    images = page.get_images()
    # Filter out logo or full-page vendor backgrounds if any
    for img_idx, img in enumerate(images):
        xref = img[0]
        base_img = doc.extract_image(xref)
        w = base_img["width"]
        h = base_img["height"]
        # Skip small icons or header lines
        image_details.append({
            "page": pno + 1,
            "xref": xref,
            "width": w,
            "height": h,
            "format": base_img["ext"]
        })
    
    # Check text for visual cues
    text = page.get_text()
    visual_terms = ["चित्र", "आकृति", "दर्पण", "figure", "image", "mirror", "fold", "cube", "dice", "pattern", "embedded", "venn", "त्रिभुज", "triangle"]
    matched = [t for t in visual_terms if t in text.lower()]
    if matched:
        print(f"Page {pno + 1} has visual terms: {matched}")

print(f"\nTotal image references found across document: {len(image_details)}")
for im in image_details:
    print(f"  Page {im['page']}: {im['width']}x{im['height']} ({im['format']}) - xref {im['xref']}")
