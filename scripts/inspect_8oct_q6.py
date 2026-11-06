import fitz
import sys

sys.stdout.reconfigure(encoding='utf-8')

doc1 = fitz.open(r"F:\startup  send mail\2026\SSC CGL 2026 (Held On_ 8 Oct 2026 Shift 2).pdf")
page = doc1[1]
words = page.get_text("words")
q6_words = [w for w in words if "Who is sitting" in page.get_text() and w[1] > 350 and w[3] < 550 and w[0] > 300]
for w in sorted(q6_words, key=lambda w: (round(w[1]/5.0), w[0])):
    print(f"({w[0]:.1f}, {w[1]:.1f}, {w[2]:.1f}, {w[3]:.1f}): {w[4]}")
