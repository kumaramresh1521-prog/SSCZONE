import fitz

doc = fitz.open(r"F:\startup  send mail\2026\SSC CGL 2026 (Held On_ 10 Oct 2026 Shift 3).pdf")
page = doc[2] # Page 3
# Let's find where 13. is
words = page.get_text("words")
w_13 = [w for w in words if "13." in w[4]][0]
print("13. at:", w_13)

# Render Q.13
pix = page.get_pixmap(clip=fitz.Rect(60, w_13[1] - 10, 300, w_13[1] + 160), dpi=150)
pix.save(r"c:\ssczone\public\images\pyq\2026\q13_shift3_rendered.png")
print("Saved q13_shift3_rendered.png")
