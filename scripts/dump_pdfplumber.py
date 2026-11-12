import pdfplumber
import sys

sys.stdout.reconfigure(encoding='utf-8')

pdf_path = r'F:\startup  send mail\pdf\A New Approach to REASONING Verbal & Non-Verbal.pdf'

def group_into_lines(w_list):
    lines = []
    curr_line = []
    curr_top = None
    for w in sorted(w_list, key=lambda x: (round(x['top'] / 3.5) * 3.5, x['x0'])):
        if curr_top is None or abs(w['top'] - curr_top) > 4.5:
            if curr_line:
                lines.append(' '.join(x['text'] for x in curr_line))
            curr_line = [w]
            curr_top = w['top']
        else:
            curr_line.append(w)
    if curr_line:
        lines.append(' '.join(x['text'] for x in curr_line))
    return lines

with pdfplumber.open(pdf_path) as pdf, open('pdfplumber_extracted.txt', 'w', encoding='utf-8') as out:
    for page_idx, page in enumerate(pdf.pages):
        words = page.extract_words()
        page_w = page.width
        mid_x = page_w / 2.0
        
        # Check if page is 2-column or single-column
        # In this book, pages 1-8 are questions (2-column), pages 8-12 are explanations (2-column)
        left_words = [w for w in words if w['x1'] <= mid_x + 5]
        right_words = [w for w in words if w['x0'] >= mid_x - 5]
        
        left_lines = group_into_lines(left_words)
        right_lines = group_into_lines(right_words)
        
        out.write(f"\n{'='*30} PAGE {page_idx+1} {'='*30}\n")
        out.write("--- LEFT COLUMN ---\n")
        for l in left_lines:
            out.write(l + "\n")
        out.write("\n--- RIGHT COLUMN ---\n")
        for l in right_lines:
            out.write(l + "\n")

print("Generated pdfplumber_extracted.txt successfully!")
