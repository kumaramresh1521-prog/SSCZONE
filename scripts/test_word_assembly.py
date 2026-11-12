import fitz
import sys

sys.stdout.reconfigure(encoding='utf-8')

doc = fitz.open(r'F:\startup  send mail\pdf\A New Approach to REASONING Verbal & Non-Verbal.pdf')
page = doc[0]

# Split words strictly by x coordinate
mid_x = 310.0

words = page.get_text('words')
# words: (x0, y0, x1, y1, word, block_no, line_no, word_no)
# filter vertical text or noise
words = [w for w in words if abs(w[3] - w[1]) < 30 and abs(w[2] - w[0]) < 200]

left_words = [w for w in words if w[2] < mid_x]
right_words = [w for w in words if w[0] >= mid_x]

def assemble_column(w_list):
    # Sort primarily by y0 (with a line clustering tolerance), then x0
    # Group words that have similar baseline
    lines = []
    # Cluster by baseline y1: words on the same line share approximately the same y1
    sorted_words = sorted(w_list, key=lambda w: w[1])
    
    current_line = []
    current_y = None
    
    for w in sorted_words:
        if current_y is None:
            current_line = [w]
            current_y = w[1]
        elif abs(w[1] - current_y) <= 4.0:
            current_line.append(w)
        else:
            # Sort words in line from left to right
            current_line.sort(key=lambda x: x[0])
            lines.append(" ".join(x[4] for x in current_line))
            current_line = [w]
            current_y = w[1]
            
    if current_line:
        current_line.sort(key=lambda x: x[0])
        lines.append(" ".join(x[4] for x in current_line))
        
    return lines

left_lines = assemble_column(left_words)
right_lines = assemble_column(right_words)

print("=== LEFT COLUMN LINES ===")
for l in left_lines:
    print(l)

print("\n=== RIGHT COLUMN LINES ===")
for l in right_lines:
    print(l)
