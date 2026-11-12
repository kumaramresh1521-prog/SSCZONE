import fitz
import sys

sys.stdout.reconfigure(encoding='utf-8')

pdf_path = r'F:\startup  send mail\pdf\analogy question 2-70.pdf'
doc = fitz.open(pdf_path)

print(f"Total pages: {len(doc)}")

for pno in range(len(doc)):
    page = doc[pno]
    text = page.get_text('text').strip()
    images = page.get_images()
    lines = [l.strip() for l in text.split('\n') if l.strip() and not l.strip().startswith('Telegram')]
    print(f"Page {pno+1}: text_len={len(text)}, non_tg_lines={len(lines)}, images={len(images)}")
    if lines:
        print(f"   Sample text: {' | '.join(lines[:3])}")
    if pno >= 10:
        break
