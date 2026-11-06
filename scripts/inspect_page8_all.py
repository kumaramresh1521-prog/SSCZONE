import fitz
import sys

sys.stdout.reconfigure(encoding='utf-8')

pdf_path = r"F:\startup  send mail\2026\SSC CGL 2026 (Held On_ 30 Sep 2026 Shift 2).pdf"
doc = fitz.open(pdf_path)
page = doc[7] # Page 8

# Let's inspect Q.68 blocks (which are on left column or right column?)
print("--- ALL BLOCKS ON PAGE 8 ---")
for b in sorted(page.get_text("blocks"), key=lambda b: (0 if (b[0]+b[2])/2 < 305 else 1, round(b[1]/4.0), b[0])):
    if b[4].strip():
        print(f"Col {'L' if (b[0]+b[2])/2 < 305 else 'R'} y0={b[1]:.1f}, x0={b[0]:.1f}: {repr(b[4].strip())[:60]}")
