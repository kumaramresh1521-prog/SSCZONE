import fitz
from PIL import Image, ImageDraw
import io

doc = fitz.open('analogy_chapter2.pdf')
for pno in range(30, 38):
    page = doc[pno]
    print(f"Page {pno+1} (doc[{pno}]): rect={page.rect}, rotation={page.rotation}")

# Let's inspect spine gutter and right edge of _l_c2 on p34..p38 (doc[33..37]), plus Q249/Q250 and gaps
# Render wide strips x=280..470, y=20..580 for p34..p38 at 150 DPI? Wait let's inspect y=20..160 at 200 DPI for p34..p38 (x=280..465) and y=430..565 for p38 (x=280..560)
strips = []
for pno in range(33, 38):
    page = doc[pno]
    clip = fitz.Rect(280, 20, 470, 145)
    pix = page.get_pixmap(dpi=200, clip=clip)
    img = Image.open(io.BytesIO(pix.tobytes("png")))
    strips.append((f"p{pno+1}_top_c2", img))

# Also p38 bottom-right of left page + top-left of right page for Q249/Q250
p38 = doc[37]
strips.append(("p38_c2_full", Image.open(io.BytesIO(p38.get_pixmap(dpi=150, clip=fitz.Rect(280, 25, 455, 565)).tobytes("png")))))
strips.append(("p38_r_c0_top", Image.open(io.BytesIO(p38.get_pixmap(dpi=200, clip=fitz.Rect(420, 25, 555, 160)).tobytes("png")))))

# Stack top strips side-by-side
w_top = sum(s[1].width + 10 for s in strips[:5])
h_top = max(s[1].height for s in strips[:5])
canvas = Image.new('RGB', (w_top, h_top + 25), (255, 255, 255))
draw = ImageDraw.Draw(canvas)
x = 0
for label, im in strips[:5]:
    draw.text((x + 5, 2), label, fill=(255, 0, 0))
    canvas.paste(im, (x, 20))
    # draw vertical guide at PDF x=421 and x=426
    for gx, col in [(421, (0, 180, 0)), (426, (255, 0, 0))]:
        px = x + int((gx - 280) * 200 / 72.0)
        draw.line([(px, 20), (px, 20 + im.height)], fill=col, width=2)
    x += im.width + 10
canvas.save('scripts/pdf_samples/t4_c2_top_spine_check.png')

# Save p38 check image separately
im1 = strips[5][1]
im2 = strips[6][1]
c38 = Image.new('RGB', (im1.width + im2.width + 20, max(im1.height, im2.height) + 25), (255, 255, 255))
d38 = ImageDraw.Draw(c38)
d38.text((5, 2), "p38_c2 (x=280..455, green=421 red=426)", fill=(255, 0, 0))
c38.paste(im1, (0, 20))
for gx, col in [(421, (0, 180, 0)), (426, (255, 0, 0))]:
    px = int((gx - 280) * 150 / 72.0)
    d38.line([(px, 20), (px, 20 + im1.height)], fill=col, width=2)
d38.text((im1.width + 15, 2), "p38_r_c0_top (x=420..555, y=25..160)", fill=(255, 0, 0))
c38.paste(im2, (im1.width + 15, 20))
c38.save('scripts/pdf_samples/t4_p38_check.png')
print("Saved spine check images.")
