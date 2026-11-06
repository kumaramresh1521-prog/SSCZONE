import fitz
import sys

sys.stdout.reconfigure(encoding='utf-8')

pdf_path = r"C:\Users\Admin\Downloads\SSC CGL, 2025 Official Paper (Held On_ 12 Sept, 2025 Shift 3).pdf"
doc = fitz.open(pdf_path)

page = doc[15]
# Let's inspect character by character on page 16 around y in [280, 330]
# PyMuPDF page.get_textpage()
tp = page.get_textpage()
# Extract words / rects
words = page.get_text("words")
for w in words:
    if 280 <= w[1] <= 340:
        print(f"y={w[1]:.1f}, x={w[0]:.1f}-{w[2]:.1f}: '{w[4]}'")
