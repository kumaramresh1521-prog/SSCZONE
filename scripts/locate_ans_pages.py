import fitz
from PIL import Image, ImageDraw
import io

doc = fitz.open('analogy_chapter2.pdf')
print(f"Total pages: {len(doc)}")

def make_grid(p_indices, out_path):
    thumbs = []
    for p in p_indices:
        if p >= len(doc):
            continue
        pix = doc[p].get_pixmap(dpi=55)
        im = Image.open(io.BytesIO(pix.tobytes('png')))
        d = ImageDraw.Draw(im)
        d.text((8, 8), f"P{p+1}", fill=(255, 0, 0))
        thumbs.append(im)
    w = max(t.width for t in thumbs)
    h = max(t.height for t in thumbs)
    cols = 3
    rows = (len(thumbs) + cols - 1) // cols
    canvas = Image.new('RGB', (w * cols, h * rows), (240, 240, 240))
    for i, t in enumerate(thumbs):
        canvas.paste(t, ((i % cols) * w, (i // cols) * h))
    canvas.save(out_path)
    print(f"Saved {out_path}")

make_grid(range(38, 47), 'scripts/pdf_samples/ans_search_1.png')
make_grid(range(47, 57), 'scripts/pdf_samples/ans_search_2.png')
