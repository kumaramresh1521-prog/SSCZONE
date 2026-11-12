import fitz
from PIL import Image

doc = fitz.open('analogy_chapter2.pdf')
# Page 36 is 0-indexed page 35
page = doc[35]
pix = page.get_pixmap(dpi=150)
im = Image.frombytes('RGB', [pix.width, pix.height], pix.samples)
w, h = im.size
mid_x = w // 2

# Right half, Col 0 (x: mid_x + 30 to mid_x + 300, y: 150 to 600)
crop = im.crop((mid_x + 25, 150, mid_x + 310, 600))
crop.save('scripts/pdf_samples/p36_col0_crop.png')
print("Saved p36_col0_crop.png, size:", crop.size)
