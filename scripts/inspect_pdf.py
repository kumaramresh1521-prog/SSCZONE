import fitz
import os

pdf_path = r"E:\pyq pdf\SSC CGL, 2025 Official Paper (Held On_ 12 Sept, 2025 Shift 1).pdf"
doc = fitz.open(pdf_path)
os.makedirs("tmp/inspect_imgs", exist_ok=True)

for xref in [32, 33, 34, 101, 112, 146]:
    try:
        img = doc.extract_image(xref)
        ext = img["ext"]
        path = f"tmp/inspect_imgs/img_{xref}.{ext}"
        with open(path, "wb") as f:
            f.write(img["image"])
        print(f"Saved {path}: {img['width']}x{img['height']}")
    except Exception as e:
        print(f"Error for xref {xref}: {e}")
