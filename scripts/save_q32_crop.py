import fitz
from PIL import Image

doc = fitz.open('analogy_chapter2.pdf')
# Page 32 is doc[31]
page = doc[31]
pix = page.get_pixmap(dpi=150)
im = Image.frombytes('RGB', [pix.width, pix.height], pix.samples)
w, h = im.size
mid_x = w // 2

# Left page, column 2 top: x from mid_x * 0.65 to mid_x, y from 0 to h * 0.15
crop_q32 = im.crop((int(mid_x * 0.65), 0, mid_x, int(h * 0.15)))
crop_q32.save('scripts/pdf_samples/q32_crop.png')
print("Saved q32_crop.png, size:", crop_q32.size)
