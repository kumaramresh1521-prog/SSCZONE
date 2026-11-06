import fitz
import sys, os
sys.stdout.reconfigure(encoding='utf-8')

pdf_path = r'F:\startup  send mail\2026\SSC CGL 2026 (Held On_ 12 Oct 2026 Shift 3).pdf'
doc = fitz.open(pdf_path)

out_dir = r'c:\ssczone\scripts\scratch_imgs'
os.makedirs(out_dir, exist_ok=True)

# Q.11 is on page 3 (index 2). Let's render the whole page at high DPI to find the diagram
page = doc[2]
mat = fitz.Matrix(3.0, 3.0)  # 3x zoom = ~216 DPI
pix = page.get_pixmap(matrix=mat)
full_page_path = os.path.join(out_dir, 'page3_full_3x.png')
pix.save(full_page_path)
print(f"Saved full page 3: {full_page_path}")
print(f"  Size: {pix.width}x{pix.height}")

# Also render page 2 for reference
page2 = doc[1]
pix2 = page2.get_pixmap(matrix=mat)
full_page2_path = os.path.join(out_dir, 'page2_full_3x.png')
pix2.save(full_page2_path)
print(f"Saved full page 2: {full_page2_path}")
print(f"  Size: {pix2.width}x{pix2.height}")
