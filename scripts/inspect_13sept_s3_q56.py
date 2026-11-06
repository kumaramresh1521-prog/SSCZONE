import fitz
import sys
import os

sys.stdout.reconfigure(encoding='utf-8')

pdf_path = r"C:\Users\Admin\Downloads\SSC CGL, 2025 Official Paper (Held On_ 13 Sept, 2025 Shift 3).pdf"
doc = fitz.open(pdf_path)

out_dir = r"tmp\inspect_13sept_s3"
os.makedirs(out_dir, exist_ok=True)

for pno in range(len(doc)):
    text = doc[pno].get_text()
    if "Q56." in text:
        print(f"Found Q56 on page {pno+1}")
        rects = doc[pno].search_for("Q56.")
        for r in rects:
            clip = fitz.Rect(40, max(0, r.y0 - 20), 560, min(doc[pno].rect.height, r.y1 + 180))
            pix = doc[pno].get_pixmap(clip=clip, dpi=200)
            fname = os.path.join(out_dir, "q56.png")
            pix.save(fname)
            print(f"Saved: {fname}")
        print(text[max(0, text.find("Q56.") - 50):min(len(text), text.find("Q56.") + 500)])
