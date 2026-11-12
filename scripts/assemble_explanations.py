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

all_expl_lines = []

for page_idx in range(7, len(doc)):  # Pages 8 to 12 (0-indexed 7 to 11)
    page = doc[page_idx]
    rect = page.rect
    split_x = 308.0
    
    words = page.get_text('words')
    # Filter header/footer
    body_words = [w for w in words if w[1] >= 40 and w[3] <= rect.height - 30]
    
    # On page 8, the explanation section starts below y ~ 430
    if page_idx == 7:
        body_words = [w for w in body_words if w[1] >= 320]
        
    left_words = [w for w in body_words if (w[0] + w[2])/2.0 < split_x]
    right_words = [w for w in body_words if (w[0] + w[2])/2.0 >= split_x]
    
    left_lines = assemble_column(left_words)
    right_lines = assemble_column(right_words)
    
    all_expl_lines.append((page_idx + 1, left_lines, right_lines))

with open('all_explanations_clean_lines.txt', 'w', encoding='utf-8') as out:
    for page_num, left, right in all_expl_lines:
        out.write(f"\n{'='*25} PAGE {page_num} LEFT {'='*25}\n")
        out.write("\n".join(left))
        out.write(f"\n\n{'='*25} PAGE {page_num} RIGHT {'='*25}\n")
        out.write("\n".join(right))

print("Saved all_explanations_clean_lines.txt")
