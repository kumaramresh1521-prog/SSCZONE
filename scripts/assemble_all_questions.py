import fitz
import sys
import re

sys.stdout.reconfigure(encoding='utf-8')

pdf_path = r'F:\startup  send mail\pdf\A New Approach to REASONING Verbal & Non-Verbal.pdf'
doc = fitz.open(pdf_path)

def assemble_column(w_list):
    sorted_words = sorted(w_list, key=lambda w: w[1])
    lines = []
    current_line = []
    current_y = None
    
    for w in sorted_words:
        if current_y is None:
            current_line = [w]
            current_y = w[1]
        elif abs(w[1] - current_y) <= 4.0:
            current_line.append(w)
        else:
            current_line.sort(key=lambda x: x[0])
            lines.append(" ".join(x[4] for x in current_line))
            current_line = [w]
            current_y = w[1]
            
    if current_line:
        current_line.sort(key=lambda x: x[0])
        lines.append(" ".join(x[4] for x in current_line))
        
    return lines

all_page_lines = []

for page_idx in range(8):  # Pages 1 to 8 have questions
    page = doc[page_idx]
    rect = page.rect
    split_x = 308.0
    
    words = page.get_text('words')
    # Filter out header/footer noise: top margin < 40, bottom margin > height - 30
    body_words = [w for w in words if w[1] >= 40 and w[3] <= rect.height - 30]
    
    # Also ignore vertical text
    body_words = [w for w in body_words if abs(w[3] - w[1]) < 30 and abs(w[2] - w[0]) < 250]
    
    left_words = [w for w in body_words if (w[0] + w[2])/2.0 < split_x]
    right_words = [w for w in body_words if (w[0] + w[2])/2.0 >= split_x]
    
    left_lines = assemble_column(left_words)
    right_lines = assemble_column(right_words)
    
    all_page_lines.append((page_idx + 1, left_lines, right_lines))

with open('all_questions_clean_lines.txt', 'w', encoding='utf-8') as out:
    for page_num, left, right in all_page_lines:
        out.write(f"\n{'='*25} PAGE {page_num} LEFT {'='*25}\n")
        out.write("\n".join(left))
        out.write(f"\n\n{'='*25} PAGE {page_num} RIGHT {'='*25}\n")
        out.write("\n".join(right))

print("Saved all_questions_clean_lines.txt with split_x = 308.0")
