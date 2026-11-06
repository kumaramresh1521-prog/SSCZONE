import fitz
import re
import sys

sys.stdout.reconfigure(encoding='utf-8')

pdf_path = r"F:\startup  send mail\2026\SSC CGL 2026 (Held On_ 30 Sep 2026 Shift 2).pdf"
doc = fitz.open(pdf_path)
page = doc[7] # Page 8

# Let's inspect all lines in page.get_text("words") or line structure
# In PyMuPDF, page.get_text("words") gives each word with bbox:
# Let's group words into visual lines!
words = page.get_text("words")
# A word: (x0, y0, x1, y1, text, block_no, line_no, word_no)

# Separate into Left column (x < 305) and Right column (x >= 305)
left_words = [w for w in words if (w[0]+w[2])/2 < 305 and w[1] > 60 and w[3] < 780]
right_words = [w for w in words if (w[0]+w[2])/2 >= 305 and w[1] > 60 and w[3] < 780]

def group_words_to_lines(col_words):
    # Sort words primarily by y0, secondarily by x0
    # Group words whose y-overlap is significant (e.g. abs(y0_a - y0_b) < 6)
    col_words = sorted(col_words, key=lambda w: (w[1], w[0]))
    lines = []
    for w in col_words:
        placed = False
        for line in lines:
            # Check if w fits vertically in line
            line_y0 = min(item[1] for item in line)
            line_y1 = max(item[3] for item in line)
            line_mid = (line_y0 + line_y1) / 2
            w_mid = (w[1] + w[3]) / 2
            if abs(w_mid - line_mid) < 5 or abs(w[1] - line_y0) < 5:
                line.append(w)
                placed = True
                break
        if not placed:
            lines.append([w])
            
    # Sort lines vertically
    lines.sort(key=lambda l: min(item[1] for item in l))
    
    # Within each line, sort words horizontally by x0
    res = []
    for l in lines:
        l.sort(key=lambda item: item[0])
        line_str = " ".join(item[4] for item in l)
        res.append(line_str)
    return "\n".join(res)

print("--- LEFT COLUMN (Bottom) ---")
l_text = group_words_to_lines([w for w in left_words if w[1] > 690])
print(l_text)

print("\n--- RIGHT COLUMN (Top) ---")
r_text = group_words_to_lines([w for w in right_words if w[1] < 140])
print(r_text)
