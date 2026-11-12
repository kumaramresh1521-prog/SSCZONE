import fitz
import sys

sys.stdout.reconfigure(encoding='utf-8')
doc = fitz.open(r'F:\startup  send mail\pdf\A New Approach to REASONING Verbal & Non-Verbal.pdf')

for i in range(len(doc)):
    txt = doc[i].get_text('text')[:200].replace('\n', ' ')
    print(f"Page {i+1}: {txt}")
