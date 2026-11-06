import fitz
from PIL import Image
import numpy as np

doc = fitz.open(r"F:\startup  send mail\2026\SSC CGL 2026 (Held On_ 10 Oct 2026 Shift 2).pdf")
page = doc[2] # Page 3

# Options box is (80, 100, 260, 135)
pix = page.get_pixmap(clip=fitz.Rect(80, 100, 260, 135), dpi=150)
pix.save(r"c:\ssczone\public\images\pyq\2026\q7_options_rendered.png")
print("Saved q7_options_rendered.png")
