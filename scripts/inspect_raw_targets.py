import fitz
import sys
import re

sys.stdout.reconfigure(encoding='utf-8')

pdf_path = r'F:\startup  send mail\pdf\A New Approach to REASONING Verbal & Non-Verbal.pdf'
doc = fitz.open(pdf_path)

targets = [27, 31, 37, 66, 78, 80, 96, 97, 98, 99, 100, 101, 102, 105, 106, 108, 118, 142, 143, 144, 145, 148]

for page_idx in range(8):
    text = doc[page_idx].get_text('text')
    for t in targets:
        # Search for target number
        m = re.search(r'(?:^|\n)\s*' + str(t) + r'\.\s*([^\n]+(?:\n[^\n]+){1,5})', text)
        if m:
            print(f"=== PAGE {page_idx+1} | Q{t} ===")
            print(m.group(0).strip()[:250])
            print("-" * 40)
