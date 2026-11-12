import fitz
from PIL import Image
import io

doc = fitz.open('analogy_chapter2.pdf')
# Wait doc[38] is P39: check size first!
print("P39 rect:", doc[38].rect, "P40 rect:", doc[39].rect)
pix1 = doc[38].get_pixmap(dpi=280, clip=fitz.Rect(680, 220, 841, 595))
pix2 = doc[39].get_pixmap(dpi=280, clip=fitz.Rect(0, 15, 52, 595))
im1 = Image.open(io.BytesIO(pix1.tobytes('png')))
im2 = Image.open(io.BytesIO(pix2.tobytes('png')))
h = max(im1.height, im2.height)
canvas = Image.new('RGB', (im1.width + im2.width + 10, h), (255, 255, 255))
canvas.paste(im1, (0, 0))
canvas.paste(im2, (im1.width + 10, 0))
canvas.save('scripts/pdf_samples/p39_t4_ans_1_128.png')
print("Saved scripts/pdf_samples/p39_t4_ans_1_128.png")
