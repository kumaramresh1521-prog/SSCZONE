import fitz
import sys

sys.stdout.reconfigure(encoding='utf-8')

pdf_path = r"C:\Users\Admin\Downloads\SSC CGL, 2025 Official Paper (Held On_ 14 Sept, 2025 Shift 3).pdf"
doc = fitz.open(pdf_path)

for pno in [19, 20]:
    page = doc[pno - 1]
    blocks = page.get_text("blocks")
    print(f"\n--- PAGE {pno} BLOCKS ---")
    for b in blocks:
        text = b[4].strip()
        if any(w in text for w in ["central angle", "Given", "radians", "radius of 10"]):
            print(f"BBox: {b[:4]} -> Text: {repr(text)}")

    # Check images on page
    imgs = page.get_images()
    print(f"Page {pno} has {len(imgs)} images")
    
    # Check drawings (vector paths)
    drawings = page.get_drawings()
    print(f"Page {pno} has {len(drawings)} vector drawings")
