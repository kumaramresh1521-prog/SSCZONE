import fitz
import sys

sys.stdout.reconfigure(encoding='utf-8')

pdf_path = r'F:\startup  send mail\pdf\A New Approach to REASONING Verbal & Non-Verbal.pdf'
doc = fitz.open(pdf_path)

with open('reasoning_column_sorted.txt', 'w', encoding='utf-8') as out:
    for page_idx in range(len(doc)):
        page = doc[page_idx]
        rect = page.rect
        mid_x = rect.width / 2.0
        
        # Get blocks: (x0, y0, x1, y1, text, block_no, block_type)
        blocks = page.get_text('blocks')
        # Filter text blocks (type 0)
        text_blocks = [b for b in blocks if b[6] == 0]
        
        # Separate into left column and right column
        # Let's check headers / footers (y0 < 50 or y1 > rect.height - 40)
        body_blocks = [b for b in text_blocks if b[1] >= 40 and b[3] <= rect.height - 30]
        header_blocks = [b for b in text_blocks if b[1] < 40]
        footer_blocks = [b for b in text_blocks if b[3] > rect.height - 30]
        
        left_col = [b for b in body_blocks if b[0] < mid_x]
        right_col = [b for b in body_blocks if b[0] >= mid_x]
        
        # Sort each column vertically by y0
        left_col.sort(key=lambda b: (b[1], b[0]))
        right_col.sort(key=lambda b: (b[1], b[0]))
        
        out.write(f"\n{'='*30} PAGE {page_idx+1} {'='*30}\n")
        out.write("--- LEFT COLUMN ---\n")
        for b in left_col:
            out.write(b[4].strip() + "\n")
        out.write("\n--- RIGHT COLUMN ---\n")
        for b in right_col:
            out.write(b[4].strip() + "\n")

print("Generated reasoning_column_sorted.txt successfully!")
