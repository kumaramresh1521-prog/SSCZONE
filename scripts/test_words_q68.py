import fitz
import sys

sys.stdout.reconfigure(encoding='utf-8')

pdf_path = r"F:\startup  send mail\2026\SSC CGL 2026 (Held On_ 30 Sep 2026 Shift 2).pdf"
doc = fitz.open(pdf_path)
page = doc[7] # Page 8
words = page.get_text("words")

# Filter words around Q.68: y > 690 on left column or y < 140 on right column
q68_words = [w for w in words if (w[1] > 690 and w[0] < 300) or (w[3] < 140 and w[0] >= 300)]
for w in q68_words:
    print(f"({w[0]:.1f}, {w[1]:.1f}, {w[2]:.1f}, {w[3]:.1f}): {w[4]}")
