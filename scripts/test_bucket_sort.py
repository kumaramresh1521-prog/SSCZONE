import fitz
import sys

sys.stdout.reconfigure(encoding='utf-8')

pdf_path = r"F:\startup  send mail\2026\SSC CGL 2026 (Held On_ 30 Sep 2026 Shift 2).pdf"
doc = fitz.open(pdf_path)
page = doc[7] # Page 8
blocks = [b for b in page.get_text("blocks") if b[1] >= 360 and b[3] <= 450 and b[0] < 300]

# Standard sort by y
blocks_strict = sorted(blocks, key=lambda b: b[1])
print("Strict y:")
for b in blocks_strict:
    print(f"  y0={b[1]:.1f}, x0={b[0]:.1f}: {repr(b[4].strip())}")

# Bucket sort by round(y / 4.0), then x
blocks_bucket = sorted(blocks, key=lambda b: (round(b[1] / 4.0), b[0]))
print("\nBucket y / 4.0, x:")
for b in blocks_bucket:
    print(f"  y0={b[1]:.1f}, x0={b[0]:.1f}: {repr(b[4].strip())}")
