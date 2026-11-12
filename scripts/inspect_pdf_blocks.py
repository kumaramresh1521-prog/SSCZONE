import fitz
import sys

sys.stdout.reconfigure(encoding='utf-8')
doc = fitz.open(r'F:\startup  send mail\pdf\A New Approach to REASONING Verbal & Non-Verbal.pdf')

# Let's inspect pages 1 to 8 (where Q1-Q155 are located)
# Print blocks from Page 1 to see how questions and options are structured
page = doc[0]
for b in page.get_text('blocks'):
    if b[4].strip().startswith('1.') or b[4].strip().startswith('2.'):
        print(b[:4], b[4])
