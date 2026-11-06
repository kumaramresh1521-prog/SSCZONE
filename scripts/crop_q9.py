import fitz

doc = fitz.open(r"F:\startup  send mail\2026\SSC CGL 2026 (Held On_ 6 Oct 2026 Shift 3).pdf")
page = doc[2]
rect = fitz.Rect(65, 320, 295, 530)
pix = page.get_pixmap(clip=rect, dpi=200)
pix.save("c:/ssczone/scripts/q9_crop.png")
print("Saved q9_crop.png")
