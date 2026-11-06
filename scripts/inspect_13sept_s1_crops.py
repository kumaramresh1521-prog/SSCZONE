import fitz
import sys
import os

sys.stdout.reconfigure(encoding='utf-8')

pdf_path = r"C:\Users\Admin\Downloads\SSC CGL, 2025 Official Paper (Held On_ 13 Sept, 2025 Shift 1).pdf"
doc = fitz.open(pdf_path)

out_dir = r"tmp\inspect_13sept_s1"
os.makedirs(out_dir, exist_ok=True)

targets = ["Q67.", "Q73.", "Q75."]

for pno in range(len(doc)):
    text = doc[pno].get_text()
    for t in targets:
        if t in text:
            print(f"\n================ PAGE {pno+1}: {t} ================")
            # Find coordinates of target
            rects = doc[pno].search_for(t)
            for r in rects:
                clip = fitz.Rect(40, max(0, r.y0 - 20), 560, min(doc[pno].rect.height, r.y1 + 180))
                pix = doc[pno].get_pixmap(clip=clip, dpi=200)
                fname = os.path.join(out_dir, f"{t.replace('.', '')}_p{pno+1}.png")
                pix.save(fname)
                print(f"Saved crop: {fname}")
            print(text[max(0, text.find(t) - 50):min(len(text), text.find(t) + 600)])
