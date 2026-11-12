import fitz
import sys
import os

sys.stdout.reconfigure(encoding='utf-8')

pdf_path = r'F:\startup  send mail\pdf\A New Approach to REASONING Verbal & Non-Verbal.pdf'
doc = fitz.open(pdf_path)

print(f"Total pages: {len(doc)}")

for page_idx in range(len(doc)):
    page = doc[page_idx]
    rect = page.rect
    blocks = page.get_text('blocks')
    print(f"\n--- Page {page_idx+1} (Width: {rect.width}, Height: {rect.height}, Blocks: {len(blocks)}) ---")
    
    # Sort blocks by column: left column (x0 < width/2) then right column (x0 >= width/2)
    # or check how columns are laid out
    left_blocks = [b for b in blocks if b[0] < rect.width * 0.52]
    right_blocks = [b for b in blocks if b[0] >= rect.width * 0.48]
    print(f"  Left blocks: {len(left_blocks)}, Right blocks: {len(right_blocks)}")
    
    # Print sample text from left and right
    if left_blocks:
        first_left = left_blocks[0][4].strip().replace('\n', ' ')[:80]
        print(f"  Left top: {first_left}")
    if right_blocks:
        first_right = right_blocks[0][4].strip().replace('\n', ' ')[:80]
        print(f"  Right top: {first_right}")
