import fitz
import sys
import re

sys.stdout.reconfigure(encoding='utf-8')

pdf_path = r'F:\startup  send mail\pdf\A New Approach to REASONING Verbal & Non-Verbal.pdf'
doc = fitz.open(pdf_path)

def extract_page_column_text(page):
    rect = page.rect
    mid_x = rect.width / 2.0
    
    # Extract blocks
    blocks = page.get_text('blocks')
    # Filter text blocks
    text_blocks = [b for b in blocks if b[6] == 0]
    
    # Filter out page headers/footers
    body_blocks = []
    for b in text_blocks:
        t = b[4].strip()
        # skip header/footer noise
        if t in ['Master Exercise', 'Analogy', 'Verbal Reasoning'] or re.match(r'^\d{1,2}\s*Verbal Reasoning', t) or re.match(r'^Analogy\s*\d{1,2}', t) or re.match(r'^\d{1,2}$', t):
            continue
        body_blocks.append(b)
        
    # Check if a block spans across both columns (e.g. full width Directions)
    # A block spans if x0 < 150 and x1 > 500
    # Otherwise assign to left or right based on center
    left_blocks = []
    right_blocks = []
    
    for b in body_blocks:
        cx = (b[0] + b[2]) / 2.0
        # If it's a full width block (e.g. Directions)
        if b[0] < 180 and b[2] > 480:
            # We can attach to left or right depending on context, or if it precedes left column
            # In these pages, full-width Directions appear at top of the page before columns start
            if b[1] < 200:
                left_blocks.append(b)
            else:
                left_blocks.append(b)
        elif cx < mid_x:
            left_blocks.append(b)
        else:
            right_blocks.append(b)
            
    left_blocks.sort(key=lambda b: (b[1], b[0]))
    right_blocks.sort(key=lambda b: (b[1], b[0]))
    
    left_text = "\n".join(b[4].strip() for b in left_blocks)
    right_text = "\n".join(b[4].strip() for b in right_blocks)
    
    return left_text + "\n" + right_text

# Test on pages 1 to 8
full_question_text = ""
for p in range(8):
    full_question_text += f"\n\n=== PAGE {p+1} ===\n\n" + extract_page_column_text(doc[p])

with open("extracted_questions_stream.txt", "w", encoding="utf-8") as f:
    f.write(full_question_text)

print("Saved extracted_questions_stream.txt")
