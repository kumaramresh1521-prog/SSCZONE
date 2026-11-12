import fitz
from rapidocr_onnxruntime import RapidOCR

doc = fitz.open('analogy_chapter2.pdf')
page = doc[31]
rect = fitz.Rect(30, 210, 280, 340)
pix = page.get_pixmap(dpi=200, clip=rect)
pix.save('scripts/pdf_samples/q12_14_crop.png')
print("Rendered crop image:", pix.width, pix.height)

engine = RapidOCR()
res, _ = engine('scripts/pdf_samples/q12_14_crop.png')
if res:
    for b, t, s in res:
        print(f"OCR: '{t}'")
else:
    print("No text found")
