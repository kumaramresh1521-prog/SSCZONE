import fitz
import sys

sys.stdout.reconfigure(encoding='utf-8')

pdf_path = r"F:\startup  send mail\2026\SSC CGL 2026 (Held On_ 30 Sep 2026 Shift 2).pdf"
doc = fitz.open(pdf_path)
page = doc[7] # Page 8 (0-indexed 7)

blocks = page.get_text("blocks")
# Sort by y0, then x0
# But wait, page has 2 columns! Left column x < 300, Right column x >= 300!
print("Total blocks on Page 8:", len(blocks))

left_blocks = [b for b in blocks if (b[0] + b[2])/2 < 300]
right_blocks = [b for b in blocks if (b[0] + b[2])/2 >= 300]

left_blocks.sort(key=lambda b: b[1])
right_blocks.sort(key=lambda b: b[1])

print("--- LEFT COLUMN ---")
for b in left_blocks:
    print(f"y={b[1]:.1f}, x={b[0]:.1f}: {b[4][:80].replace(chr(10), ' ')}")

print("\n--- RIGHT COLUMN ---")
for b in right_blocks:
    print(f"y={b[1]:.1f}, x={b[0]:.1f}: {b[4][:80].replace(chr(10), ' ')}")
