import fitz
from PIL import Image
import io

doc = fitz.open('analogy_chapter2.pdf')

# 1. P40 Type-IV 1..28 + col 4 (32..128)
p_top = doc[39].get_pixmap(dpi=280, clip=fitz.Rect(152, 175, 298, 295))
p_col4 = doc[39].get_pixmap(dpi=280, clip=fitz.Rect(250, 260, 298, 585))
im_t = Image.open(io.BytesIO(p_top.tobytes('png')))
im_c = Image.open(io.BytesIO(p_col4.tobytes('png')))
h = max(im_t.height, im_c.height)
out1 = Image.new('RGB', (im_t.width + im_c.width + 10, h), (255, 255, 255))
out1.paste(im_t, (0, 0))
out1.paste(im_c, (im_t.width + 10, 0))
out1.save('scripts/pdf_samples/p40_t4_ans_1_28_and_col4.png')

# 2. Spine edge strips for Q153-155 (p35=doc[34]), Q182-187 (p36=doc[35]), Q214-217 (p37=doc[36]), Q245-249 (p38=doc[37])
crops = []
for pno, y0, y1 in [(34, 300, 565), (35, 190, 565), (36, 170, 565), (37, 35, 565)]:
    px = doc[pno].get_pixmap(dpi=230, clip=fitz.Rect(375, y0, 456, y1))
    crops.append(Image.open(io.BytesIO(px.tobytes('png'))))
W = sum(c.width + 8 for c in crops)
H = max(c.height for c in crops)
out2 = Image.new('RGB', (W, H), (255, 255, 255))
dx = 0
for c in crops:
    out2.paste(c, (dx, 0))
    dx += c.width + 8
out2.save('scripts/pdf_samples/spine_shifts_check.png')
print("Saved both check images.")
