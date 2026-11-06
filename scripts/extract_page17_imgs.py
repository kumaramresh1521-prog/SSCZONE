import fitz
import os
import sys

sys.stdout.reconfigure(encoding='utf-8')

doc = fitz.open(r"F:\startup  send mail\SSC CGL, 2025 Official Paper (Held On_ 16 Sept, 2025 Shift 1).pdf")
page = doc[16] # Page 17
images = page.get_images()
print(f"Total images on page 17: {len(images)}")

os.makedirs("tmp/page17_extracted_imgs", exist_ok=True)
for i, img in enumerate(images):
    xref = img[0]
    base_img = doc.extract_image(xref)
    img_bytes = base_img["image"]
    ext = base_img["ext"]
    out_path = f"tmp/page17_extracted_imgs/img_{i}_xref_{xref}.{ext}"
    with open(out_path, "wb") as f:
        f.write(img_bytes)
    print(f"Image {i}: saved to {out_path}, format={ext}, dimensions={base_img['width']}x{base_img['height']}")
