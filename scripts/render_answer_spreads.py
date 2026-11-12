import fitz
from PIL import Image
import numpy as np
from rapidocr_onnxruntime import RapidOCR
import sys
import json

sys.stdout.reconfigure(encoding='utf-8')

pdf_path = r'F:\startup  send mail\pdf\analogy question 2-70.pdf'
doc = fitz.open(pdf_path)
engine = RapidOCR()

# Page 39 (0-indexed 38) and Page 40 (0-indexed 39)
p39 = doc[38]
pix39 = p39.get_pixmap(dpi=150)
im39 = Image.frombytes("RGB", [pix39.width, pix39.height], pix39.samples)
im39.save(r'c:\ssczone\scripts\pdf_samples\answers_spread_p39.png')

p40 = doc[39]
pix40 = p40.get_pixmap(dpi=150)
im40 = Image.frombytes("RGB", [pix40.width, pix40.height], pix40.samples)
im40.save(r'c:\ssczone\scripts\pdf_samples\answers_spread_p40.png')

print("Saved answers_spread_p39.png and answers_spread_p40.png")
