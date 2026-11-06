import fitz

doc1 = fitz.open(r"F:\startup  send mail\2026\SSC CGL 2026 (Held On_ 8 Oct 2026 Shift 2).pdf")
page = doc1[1]
pix = page.get_pixmap(clip=fitz.Rect(320, 320, 520, 360), dpi=150)
pix.save(r"c:\ssczone\public\images\pyq\2026\test_q6_options.png")
print("Saved test_q6_options.png")
