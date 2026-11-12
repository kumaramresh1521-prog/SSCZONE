import fitz
import sys

sys.stdout.reconfigure(encoding='utf-8')
doc = fitz.open(r'F:\startup  send mail\pdf\A New Approach to REASONING Verbal & Non-Verbal.pdf')

for pno in [4, 5]: # pages 5 and 6
    print(f"==================== PAGE {pno+1} ====================")
    page = doc[pno]
    rect = page.rect
    blocks = page.get_text('blocks')
    # sort blocks vertically
    for b in sorted(blocks, key=lambda x: (x[0] > rect.width * 0.5, x[1])):
        txt = b[4].strip()
        if any(f"{n}." in txt for n in range(94, 106)):
            print(f"[{b[0]:.1f}, {b[1]:.1f}] -> {txt}\n")
