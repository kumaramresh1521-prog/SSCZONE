import fitz
from PIL import Image

doc = fitz.open('analogy_chapter2.pdf')
# Page 32 is 0-indexed page 31
page = doc[31]
pix = page.get_pixmap(dpi=150)
im = Image.frombytes('RGB', [pix.width, pix.height], pix.samples)
w, h = im.size
mid_x = w // 2

# Q69 is in right half, Col 2 (x: mid_x + 550 to mid_x + 840, y: 300 to 550)
crop_q69 = im.crop((mid_x + 540, 300, mid_x + 840, 560))
crop_q69.save('scripts/pdf_samples/q69_crop_150.png')
print("Saved q69_crop_150.png, size:", crop_q69.size)
