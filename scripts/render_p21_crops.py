import fitz
import os

pdf_path = r"C:\Users\Admin\Downloads\SSC CGL, 2025 Official Paper (Held On_ 13 Sept, 2025 Shift 1).pdf"
doc = fitz.open(pdf_path)

out_dir = r"tmp\inspect_13sept_s1"
os.makedirs(out_dir, exist_ok=True)

# Page 21 middle and bottom
p21 = doc[20]
pix_mid = p21.get_pixmap(clip=fitz.Rect(40, 350, 560, 580), dpi=200)
pix_mid.save(os.path.join(out_dir, "q73_detailed.png"))

pix_bot = p21.get_pixmap(clip=fitz.Rect(40, 550, 560, 800), dpi=200)
pix_bot.save(os.path.join(out_dir, "q75_detailed.png"))

print("Saved detailed crops for Q73 and Q75!")
