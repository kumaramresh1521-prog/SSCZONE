import fitz
import re
import sys
import json
import os

sys.stdout.reconfigure(encoding='utf-8')

pdf_path = r"C:\Users\Admin\Downloads\SSC CGL, 2025 Official Paper (Held On_ 13 Sept, 2025 Shift 1).pdf"
print(f"Loading: {pdf_path}")
doc = fitz.open(pdf_path)
print(f"Total Pages: {len(doc)}")

# Check for images / drawings on pages
image_count = 0
for pno in range(len(doc)):
    imgs = doc[pno].get_images()
    # Filter testbook ads
    for img in imgs:
        base_img = doc.extract_image(img[0])
        if base_img["width"] not in [595, 4066] and base_img["height"] not in [50, 5750]:
            print(f"Question image found on page {pno+1}: {base_img['width']}x{base_img['height']}")
            image_count += 1

print(f"Total question diagrams found: {image_count}")
