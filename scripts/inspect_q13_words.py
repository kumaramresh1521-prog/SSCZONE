import fitz
import sys

sys.stdout.reconfigure(encoding='utf-8')

pdf_path = r"F:\startup  send mail\2026\SSC CGL 2026 (Held On_ 30 Sep 2026 Shift 3).pdf"
doc = fitz.open(pdf_path)
page = doc[3] # Page 4

print("=== ALL WORDS AROUND Q.13 ===")
words = page.get_text("words")
q13_words = [w for w in words if w[0] < 300 and w[1] > 100 and w[3] < 240]
for w in sorted(q13_words, key=lambda w: (round(w[1]/5.0), w[0])):
    print(f"({w[0]:.1f}, {w[1]:.1f}, {w[2]:.1f}, {w[3]:.1f}): {w[4]}")
