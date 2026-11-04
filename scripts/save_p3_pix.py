import fitz
from PIL import Image

doc = fitz.open(r"E:\pyq pdf\SSC CGL, 2025 Official Paper (Held On_ 12 Sept, 2025 Shift 1).pdf")
p3 = doc[2]
pix = p3.get_pixmap(dpi=150)
pix.save("tmp/inspect_imgs/page3_full.png")

# Also let's inspect what img 146 is
im = Image.open("tmp/inspect_imgs/img_146.png")
print("im size:", im.size)
# Save a small version of img_146 to inspect
im.resize((800, 1131)).save("tmp/inspect_imgs/img_146_small.png")
