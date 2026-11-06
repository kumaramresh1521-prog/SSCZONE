import fitz
import sys

sys.stdout.reconfigure(encoding='utf-8')

pdf_path = r"C:\Users\Admin\Downloads\SSC CGL, 2025 Official Paper (Held On_ 14 Sept, 2025 Shift 3).pdf"
doc = fitz.open(pdf_path)

# Page 19: Q69 is between y = 500 and y = 650
page19 = doc[18]
rect19 = fitz.Rect(50, 500, 550, 650)
pix19 = page19.get_pixmap(clip=rect19, dpi=200)
pix19.save("tmp_math_crops/q69_crop.png")
print("Saved tmp_math_crops/q69_crop.png")

# Page 20: Q72 is between y = 200 and y = 350
page20 = doc[19]
rect20 = fitz.Rect(50, 200, 550, 350)
pix20 = page20.get_pixmap(clip=rect20, dpi=200)
pix20.save("tmp_math_crops/q72_crop.png")
print("Saved tmp_math_crops/q72_crop.png")
