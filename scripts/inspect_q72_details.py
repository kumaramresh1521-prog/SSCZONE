import fitz

pdf_path = r"C:\Users\Admin\Downloads\SSC CGL, 2025 Official Paper (Held On_ 14 Sept, 2025 Shift 3).pdf"
doc = fitz.open(pdf_path)
page20 = doc[19]

# In page 20, let's find all words between y=230 and 280
words = page20.get_text("words")
for w in words:
    if 240 <= w[1] <= 275:
        print(f"Word '{w[4]}' bbox: {w[:4]}")

# Let's save a high resolution crop of rect(60, 240, 450, 280)
rect = fitz.Rect(60, 240, 450, 280)
pix = page20.get_pixmap(clip=rect, dpi=300)
pix.save("tmp_math_crops/q72_highres.png")
print("Saved tmp_math_crops/q72_highres.png (size:", pix.width, pix.height, ")")
