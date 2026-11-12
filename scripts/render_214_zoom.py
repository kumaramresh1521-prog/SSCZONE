import fitz
doc = fitz.open('analogy_chapter2.pdf')
# Wait in 0-based doc index, exp_p67_left is doc[66] left half!
pix = doc[66].get_pixmap(dpi=280, clip=fitz.Rect(275, 38, 450, 255))
pix.save('scripts/pdf_samples/t4_exp_214_zoom.png')
print("Saved t4_exp_214_zoom.png")
