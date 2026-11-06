import fitz
import sys

sys.stdout.reconfigure(encoding='utf-8')

doc = fitz.open(r"F:\startup  send mail\2026\SSC CGL 2026 (Held On_ 10 Oct 2026 Shift 2).pdf")
page = doc[2] # Page 3
words = page.get_text("words")
top_words = [w for w in words if w[1] < 150]
for w in sorted(top_words, key=lambda w: (round(w[1]/5.0), w[0])):
    print(f"({w[0]:.1f}, {w[1]:.1f}): {w[4]}")

pix = page.get_pixmap(clip=fitz.Rect(60, 60, 540, 160), dpi=150)
pix.save(r"c:\ssczone\public\images\pyq\2026\test_10oct_s2_p3.png")
print("Saved test_10oct_s2_p3.png")
