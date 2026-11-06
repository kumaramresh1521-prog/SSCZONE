import fitz
import os

pdf_path = r"C:\Users\Admin\Downloads\SSC CGL, 2025 Official Paper (Held On_ 12 Sept, 2025 Shift 3).pdf"
doc = fitz.open(pdf_path)

out_dir = r"tmp\inspect_images"
os.makedirs(out_dir, exist_ok=True)

# Page 15 bottom (Q51)
p15 = doc[14]
pix15 = p15.get_pixmap(clip=fitz.Rect(50, 700, 550, 820), dpi=200)
pix15.save(os.path.join(out_dir, "q51.png"))

# Page 16 Q53
p16 = doc[15]
pix53 = p16.get_pixmap(clip=fitz.Rect(50, 260, 550, 380), dpi=200)
pix53.save(os.path.join(out_dir, "q53.png"))

# Page 16 Q56
pix56 = p16.get_pixmap(clip=fitz.Rect(50, 600, 550, 820), dpi=200)
pix56.save(os.path.join(out_dir, "q56.png"))

# Page 17 Q56 options and Q57
p17 = doc[16]
pix57 = p17.get_pixmap(clip=fitz.Rect(50, 50, 550, 350), dpi=200)
pix57.save(os.path.join(out_dir, "q57.png"))

print("Cropped images saved in tmp/inspect_images!")
