import fitz
from PIL import Image

doc = fitz.open('analogy_chapter2.pdf')
page = doc[31] # Page 32
pix = page.get_pixmap(dpi=150)
im = Image.frombytes('RGB', [pix.width, pix.height], pix.samples)
w, h = im.size
mid_x = w // 2

# Right half
im_r = im.crop((mid_x, 0, w, h))
c0 = im_r.crop((35, 60, 280, h - 60))
c1 = im_r.crop((280, 60, 550, h - 60))
c2 = im_r.crop((550, 60, 825, h - 60))

c0.save('scripts/pdf_samples/p32_r_c0.png')
c1.save('scripts/pdf_samples/p32_r_c1.png')
c2.save('scripts/pdf_samples/p32_r_c2.png')
print("Saved p32_r_c0.png, c1, c2. Sizes:", c0.size, c1.size, c2.size)
