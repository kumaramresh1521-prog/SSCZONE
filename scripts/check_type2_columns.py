import fitz
from PIL import Image
import numpy as np
from rapidocr_onnxruntime import RapidOCR

doc = fitz.open(r'F:\startup  send mail\pdf\analogy question 2-70.pdf')
page = doc[8] # page 9
pix = page.get_pixmap(dpi=150)
img = Image.frombytes("RGB", [pix.width, pix.height], pix.samples)
w, h = img.size
half_img = img.crop((w // 2, 0, w, h))
hw, hh = half_img.size
print(f"half_img size: {hw} x {hh}")

engine = RapidOCR()
res, _ = engine(np.array(half_img))

x_coords = [(it[0][0][0] + it[0][1][0]) / 2.0 for it in res]
print(f"X min: {min(x_coords):.1f}, X max: {max(x_coords):.1f}, X mid: {hw/2:.1f}")

# Histogram of x coordinates
hist, bin_edges = np.histogram(x_coords, bins=10)
for count, edge in zip(hist, bin_edges):
    print(f"x around {edge:.1f}: {count} items")
