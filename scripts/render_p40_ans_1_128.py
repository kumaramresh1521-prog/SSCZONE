import fitz
doc = fitz.open('analogy_chapter2.pdf')
pix = doc[39].get_pixmap(dpi=280, clip=fitz.Rect(145, 220, 290, 585))
pix.save('scripts/pdf_samples/p40_t4_ans_1_128.png')
print("Saved scripts/pdf_samples/p40_t4_ans_1_128.png")
