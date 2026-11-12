import fitz
from PIL import Image

doc = fitz.open('analogy_chapter2.pdf')
# Page 35 is 0-indexed page 34
page = doc[34]
pix = page.get_pixmap(dpi=150)
im = Image.frombytes('RGB', [pix.width, pix.height], pix.samples)
w, h = im.size
mid_x = w // 2

# Right half, Col 2 (x: mid_x + 550 to mid_x + 830, y: 50 to 350)
crop_q167 = im.crop((mid_x + 540, 50, mid_x + 840, 350))
crop_q167.save('scripts/pdf_samples/q167_crop_150.png')
print("Saved q167_crop_150.png, size:", crop_q167.size)
