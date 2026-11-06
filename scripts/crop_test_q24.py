import fitz

doc = fitz.open(r"F:\startup  send mail\2026\SSC CGL 2026 (Held On_ 1 Oct 2026 Shift 3).pdf")
page = doc[3] # page 4

# Crop around Q.24
# Q.24 is at y ~ 410 to 500, x ~ 290 to 535
rect = fitz.Rect(290, 410, 535, 510)
pix = page.get_pixmap(clip=rect, dpi=200)
pix.save("c:/ssczone/scripts/test_q24_page4.png")
print("Saved c:/ssczone/scripts/test_q24_page4.png")
