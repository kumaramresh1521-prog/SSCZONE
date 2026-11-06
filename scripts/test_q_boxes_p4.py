import fitz
import re
import sys
import os

sys.stdout.reconfigure(encoding='utf-8')

pdf_path = r"F:\startup  send mail\2026\SSC CGL 2026 (Held On_ 30 Sep 2026 Shift 3).pdf"
doc = fitz.open(pdf_path)
page = doc[3] # Page 4

words = page.get_text("words")
# Find Q numbers
for w in words:
    if re.match(r"^0?\d{1,2}\.$", w[4]):
        print(f"Q num: {w[4]} at ({w[0]:.1f}, {w[1]:.1f}), col={0 if (w[0]+w[2])/2 < 305 else 1}")
    elif w[4] in ["Ans:"]:
        print(f"  Ans at ({w[0]:.1f}, {w[1]:.1f}), col={0 if (w[0]+w[2])/2 < 305 else 1}")
