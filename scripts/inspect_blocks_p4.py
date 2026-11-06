import fitz
import sys

sys.stdout.reconfigure(encoding='utf-8')

pdf_path = r'F:\startup  send mail\2026\SSC CGL 2026 (Held On_ 30 Sep 2026 Shift 3).pdf'
doc = fitz.open(pdf_path)

page = doc[3] # page 4
blocks = page.get_text("blocks")
for b in blocks:
    # b: (x0, y0, x1, y1, text, block_no, block_type)
    text = b[4].strip()
    if text:
        first_line = text.split('\n')[0]
        print(f"Block at y={b[1]:.1f}-{b[3]:.1f}, x={b[0]:.1f}-{b[2]:.1f}: {first_line[:80]}")
