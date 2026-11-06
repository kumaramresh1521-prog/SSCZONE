import fitz
import os
import sys

sys.stdout.reconfigure(encoding='utf-8')

pdf_path = r"C:\Users\Admin\Downloads\SSC CGL, 2025 Official Paper (Held On_ 14 Sept, 2025 Shift 3).pdf"
doc = fitz.open(pdf_path)

os.makedirs("tmp_math_crops", exist_ok=True)

for pno in [19, 20]:
    page = doc[pno - 1]
    il = page.get_images()
    for idx, img_info in enumerate(il):
        xref = img_info[0]
        base_img = doc.extract_image(xref)
        img_bytes = base_img["image"]
        img_ext = base_img["ext"]
        out_name = f"tmp_math_crops/page_{pno}_img_{idx+1}_{xref}.{img_ext}"
        with open(out_name, "wb") as f:
            f.write(img_bytes)
        print(f"Extracted: {out_name} (width: {base_img['width']}, height: {base_img['height']})")
