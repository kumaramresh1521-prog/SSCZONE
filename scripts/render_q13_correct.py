import fitz

doc = fitz.open(r"F:\startup  send mail\2026\SSC CGL 2026 (Held On_ 10 Oct 2026 Shift 3).pdf")
page3 = doc[2]
pix3 = page3.get_pixmap(clip=fitz.Rect(300, 650, 540, 780), dpi=150)
pix3.save(r"c:\ssczone\public\images\pyq\2026\q13_p3_right.png")

page4 = doc[3]
pix4 = page4.get_pixmap(clip=fitz.Rect(60, 60, 300, 200), dpi=150)
pix4.save(r"c:\ssczone\public\images\pyq\2026\q13_p4_top.png")

print("Saved q13_p3_right.png and q13_p4_top.png")
