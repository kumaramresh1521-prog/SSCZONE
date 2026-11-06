import fitz
import sys

sys.stdout.reconfigure(encoding='utf-8')

pdf_path = r"F:\startup  send mail\2026\SSC CGL 2026 (Held On_ 30 Sep 2026 Shift 3).pdf"
doc = fitz.open(pdf_path)
page = doc[3] # Page 4

drawings = page.get_drawings()
q13_drawings = [d for d in drawings if d["rect"].x0 < 300 and d["rect"].y0 > 100 and d["rect"].y1 < 240]
print(f"Total drawings in page 4: {len(drawings)}")
print(f"Drawings inside Q.13 rect: {len(q13_drawings)}")
if q13_drawings:
    print("Sample drawing:", q13_drawings[0])
