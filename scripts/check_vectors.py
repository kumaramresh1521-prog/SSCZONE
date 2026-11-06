import fitz
import sys, os
sys.stdout.reconfigure(encoding='utf-8')

pdf_path = r'F:\startup  send mail\2026\SSC CGL 2026 (Held On_ 12 Oct 2026 Shift 3).pdf'
doc = fitz.open(pdf_path)

out_dir = r'c:\ssczone\scripts\scratch_imgs'

# Try to render the Q.14 Figure(X) region more precisely
# Looking at Q.14 text positions:
# Q.14 text "Figure(X): DIAGRAM_OR_GEOMETRIC" ends at around y=557 in PDF units
# Options (A)(B) labels are at y=561-572
# So Figure(X) would be between y=557 and y=561 - but that's only 4 units!
# That means the diagram was replaced with text in the original PDF

# Let's look at the Q.17 image (xref=307) which I already extracted - that's on page 3 right column
# But that's already used for Q.17 in our JSON

# Let me also check pages 1-2 for any Q.11 squares diagram
for page_num in range(len(doc)):
    page = doc[page_num]
    # Get vector drawings (paths) count which could indicate diagrams
    drawings = page.get_drawings()
    text = page.get_text()
    if 'squares' in text.lower() or '11.' in text:
        print(f"Page {page_num+1}: {len(drawings)} vector drawings, has Q.11 text: {'11.' in text}")

# Let me also look for the squares figure in ALL pages by checking vector paths on page 3
page3 = doc[2]
drawings = page3.get_drawings()
print(f"\nPage 3 has {len(drawings)} vector drawings (paths)")
# If there are drawings in the Q.11 area (y=256-260), that's the diagram
q11_drawings = [d for d in drawings if d['rect'].y0 > 240 and d['rect'].y1 < 300 and d['rect'].x0 < 300]
print(f"Vector drawings in Q.11 area (y=240-300, x<300): {len(q11_drawings)}")
for d in q11_drawings[:5]:
    print(f"  rect={d['rect']}, type={d['type']}")
