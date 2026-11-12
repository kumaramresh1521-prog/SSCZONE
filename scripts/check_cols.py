from PIL import Image
import json
import re

im = Image.open(r'c:\ssczone\scripts\pdf_samples\expl_pages\expl_p40.png')
w, h = im.size
print(f"Image expl_p40.png size: {w} x {h}")
print(f"Col boundaries: 0 -> {w/3:.1f} -> {2*w/3:.1f} -> {w}")
