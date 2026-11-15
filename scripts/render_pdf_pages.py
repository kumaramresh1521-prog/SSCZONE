import fitz

doc = fitz.open(r"C:\Users\Admin\.gemini\antigravity\brain\a4f88990-1ffd-4462-a906-52e3447e1c0c\.user_uploaded\media_1794756445934_6ed122bd.pdf")
print("Pages:", len(doc))

# Let's save page 1 as PNG
page1 = doc[0]
pix = page1.get_pixmap(dpi=150)
pix.save(r"scripts\page1.png")
print("Saved scripts/page1.png", pix.width, pix.height)

page2 = doc[1]
pix2 = page2.get_pixmap(dpi=150)
pix2.save(r"scripts\page2.png")
print("Saved scripts/page2.png")
