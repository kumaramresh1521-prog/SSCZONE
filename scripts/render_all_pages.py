import fitz

doc = fitz.open(r"C:\Users\Admin\.gemini\antigravity\brain\a4f88990-1ffd-4462-a906-52e3447e1c0c\.user_uploaded\media_1794756445934_6ed122bd.pdf")

for i in range(1, len(doc)):
    page = doc[i]
    pix = page.get_pixmap(dpi=150)
    pix.save(f"scripts/page{i+1}.png")
    print(f"Saved scripts/page{i+1}.png")
