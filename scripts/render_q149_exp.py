import fitz, io, json, re, os
from PIL import Image, ImageDraw

doc = fitz.open('analogy_chapter2.pdf')
# Render p64_right (doc[63] right) and p65_left (doc[64] left) into 2-panel check image to locate Q149 exp
p64_r = doc[63].get_pixmap(dpi=160, clip=fitz.Rect(doc[63].rect.width*0.48, 25, doc[63].rect.width-10, doc[63].rect.height-20))
p65_l = doc[64].get_pixmap(dpi=160, clip=fitz.Rect(10, 25, doc[64].rect.width*0.52, doc[64].rect.height-20))
im1 = Image.open(io.BytesIO(p64_r.tobytes('png')))
im2 = Image.open(io.BytesIO(p65_l.tobytes('png')))
mw = im1.width + im2.width + 10
mh = max(im1.height, im2.height) + 10
c = Image.new('RGB', (mw, mh), (255,255,255))
c.paste(im1, (5, 5)); c.paste(im2, (im1.width+10, 5))
c.save('scripts/pdf_samples/t4_p64r_p65l_exp.png')
print("Saved t4_p64r_p65l_exp.png", c.size)
