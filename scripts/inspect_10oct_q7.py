import fitz
import sys

sys.stdout.reconfigure(encoding='utf-8')

doc = fitz.open(r"F:\startup  send mail\2026\SSC CGL 2026 (Held On_ 10 Oct 2026 Shift 2).pdf")
page = doc[1] # Page 2

# Q.7 is at bottom of Col 0 or top of Col 1
# Let's find Q.7 text position
words = page.get_text("words")
for w in words:
    if "3364" in w[4] or "(A)" in w[4]:
        print(f"({w[0]:.1f}, {w[1]:.1f}): {w[4]}")

pix = page.get_pixmap(clip=fitz.Rect(60, 680, 540, 780), dpi=150)
pix.save(r"c:\ssczone\public\images\pyq\2026\test_10oct_s2_q7.png")
print("Saved test_10oct_s2_q7.png")
