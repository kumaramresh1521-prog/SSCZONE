import fitz
import re
import os

from check_18_pdf_pages import matches

for c in sorted(os.listdir("c:/ssczone/scripts")):
    if c.startswith("debug_crop_") and c.endswith(".png"):
        pass
