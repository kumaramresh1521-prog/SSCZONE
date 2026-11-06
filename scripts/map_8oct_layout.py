import fitz
import sys
import re

sys.stdout.reconfigure(encoding='utf-8')

# In fitz, let's look at page 3 and 4 of "8 Oct Shift 3" and map the EXACT bounding box of each question
# to the EXACT image located inside that question's box!
doc = fitz.open(r"F:\startup  send mail\2026\SSC CGL 2026 (Held On_ 8 Oct 2026 Shift 3).pdf")

for pno in [2, 3]: # page 3 and 4
    page = doc[pno]
    print(f"=== PAGE {pno+1} ===")
    
    # Get all text blocks
    blocks = page.get_text("blocks")
    for b in blocks:
        # b is (x0, y0, x1, y1, text, block_no, block_type)
        txt = b[4].strip()
        if re.search(r'^\d+\.', txt):
            print(f"  Question Block at Y=({b[1]:.1f} - {b[3]:.1f}), X=({b[0]:.1f} - {b[2]:.1f}): {repr(txt[:60])}")
            
    # Get all images
    for img in page.get_images(full=True):
        bbox = page.get_image_bbox(img)
        print(f"  IMAGE xref {img[0]} at Y=({bbox.y0:.1f} - {bbox.y1:.1f}), X=({bbox.x0:.1f} - {bbox.x1:.1f})")
    print("-" * 60)
