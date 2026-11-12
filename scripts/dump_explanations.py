import fitz
import sys

sys.stdout.reconfigure(encoding='utf-8')

pdf_path = r'F:\startup  send mail\pdf\A New Approach to REASONING Verbal & Non-Verbal.pdf'
doc = fitz.open(pdf_path)

with open('all_explanations_raw.txt', 'w', encoding='utf-8') as out:
    for page_idx in range(7, len(doc)):  # Page 8 is index 7
        page = doc[page_idx]
        text = page.get_text('text')
        out.write(f"\n{'='*30} PAGE {page_idx+1} {'='*30}\n")
        out.write(text)

print("Dumped explanations raw text to all_explanations_raw.txt")
