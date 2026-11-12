import fitz
from PIL import Image

doc = fitz.open('analogy_chapter2.pdf')

# Page 36 (index 35): Question 176
p35 = doc[35]
pix = p35.get_pixmap(dpi=150)
im35 = Image.frombytes('RGB', [pix.width, pix.height], pix.samples)
w, h = im35.size
# Q176 is on left column near bottom
crop_q176 = im35.crop((0, int(h * 0.7), int(w * 0.25), int(h * 0.95)))
crop_q176.save('scripts/pdf_samples/q176_crop_150.png')

# Page 40 (index 39): Answer 176
p39 = doc[39]
pix40 = p39.get_pixmap(dpi=150)
im40 = Image.frombytes('RGB', [pix40.width, pix40.height], pix40.samples)
w40, h40 = im40.size
# Answer 176 is in Band C, top row (x around 800-880, y around 340-400 of crop)
crop_ans176 = im40.crop((int(w40 * 0.43), int(h40 * 0.27), int(w40 * 0.50), int(h40 * 0.35)))
crop_ans176.save('scripts/pdf_samples/ans176_crop_150.png')

print("Saved q176_crop_150.png and ans176_crop_150.png")
