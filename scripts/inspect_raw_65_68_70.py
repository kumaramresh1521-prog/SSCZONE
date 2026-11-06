import fitz
import re
import sys

sys.stdout.reconfigure(encoding='utf-8')

pdf_path = r"F:\startup  send mail\2026\SSC CGL 2026 (Held On_ 30 Sep 2026 Shift 2).pdf"
doc = fitz.open(pdf_path)

page = doc[7] # Page 8
blocks = page.get_text("blocks")
valid_blocks = [b for b in blocks if b[4].strip()]
left = sorted([b for b in valid_blocks if (b[0]+b[2])/2 < 305], key=lambda b: b[1])
right = sorted([b for b in valid_blocks if (b[0]+b[2])/2 >= 305], key=lambda b: b[1])

print("=== LEFT BLOCKS ===")
for i, b in enumerate(left):
    if any(q in b[4] for q in ["64.", "65.", "66.", "67.", "68."]):
        print(f"L{i}: {repr(b[4])}")
    elif any(b[1] > 370 and b[1] < 480 for _ in [1]):
        print(f"L{i} (near 65): {repr(b[4])}")

print("\n=== RIGHT BLOCKS ===")
for i, b in enumerate(right):
    if any(q in b[4] for q in ["68.", "69.", "70.", "71."]):
        print(f"R{i}: {repr(b[4])}")
    elif any(b[1] < 340 for _ in [1]):
        print(f"R{i} (near 68-70): {repr(b[4])}")
