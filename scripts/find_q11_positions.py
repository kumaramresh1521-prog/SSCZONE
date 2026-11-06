import fitz
from PIL import Image
import sys, os
sys.stdout.reconfigure(encoding='utf-8')

pdf_path = r'F:\startup  send mail\2026\SSC CGL 2026 (Held On_ 12 Oct 2026 Shift 3).pdf'
doc = fitz.open(pdf_path)

out_dir = r'c:\ssczone\scripts\scratch_imgs'
os.makedirs(out_dir, exist_ok=True)

# Page 3 (index 2), Q.11 area and Q.14 Figure(X) area
# Full page rendered at 3x, size is 1785x2526
# Need to find approximate y-positions of Q.11 diagram and Q.14 Figure(X)

# Render page 3 at 4x for better quality crop
page = doc[2]
mat = fitz.Matrix(4.0, 4.0)
pix = page.get_pixmap(matrix=mat)
img = Image.frombytes("RGB", [pix.width, pix.height], pix.samples)

print(f"Full page size: {img.width}x{img.height}")

# Page 3 PDF size
page_rect = page.rect
print(f"PDF page rect: {page_rect}")  # Usually 595x842 for A4

# Find text positions for Q.11 and Q.14
blocks = page.get_text("blocks")
for b in blocks:
    text = b[4].strip()
    if 'squares' in text.lower() or 'Q.11' in text or '11.' in text or 'pattern in fig' in text.lower() or 'Figure(X)' in text:
        print(f"Block: '{text[:80]}' at rect={b[:4]}")

print("\nAll text blocks with positions:")
for b in blocks:
    text = b[4].strip()[:60]
    print(f"  y={b[1]:.0f}-{b[3]:.0f}: '{text}'")
