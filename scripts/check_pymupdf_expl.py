import fitz # PyMuPDF
import sys
import re

sys.stdout.reconfigure(encoding='utf-8')
doc = fitz.open('F:/startup  send mail/pdf/analogy question 2-70.pdf')

print("Opened PDF with PyMuPDF, pages:", len(doc))

# Let's inspect pages 38 to 44
for pno in range(37, 44):
    page = doc[pno]
    text = page.get_text()
    lines = [l.strip() for l in text.split('\n') if l.strip()]
    print(f"\n=== Page {pno+1} ({len(lines)} lines) ===")
    matches = re.findall(r'(\d{1,3})\.\s*\(([1-4])\)', text)
    print(f"Detected {len(matches)} pattern matches of 'num. (ans)'.")
    if matches:
        first_5 = matches[:5]
        last_5 = matches[-5:]
        print("First 5:", first_5)
        print("Last 5:", last_5)
