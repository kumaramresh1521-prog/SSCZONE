import fitz

doc = fitz.open('analogy_chapter2.pdf')
# Q11 & Q12 are on page 38 right half (idx 37), bottom middle/right
p38 = doc[37]
p38.get_pixmap(dpi=300, clip=fitz.Rect(550, 350, 830, 560)).save('scripts/pdf_samples/t5_q11_12_crop.png')

# Q24 & Q25 are on page 39 left half (idx 38), right col
p39 = doc[38]
p39.get_pixmap(dpi=300, clip=fitz.Rect(275, 25, 430, 400)).save('scripts/pdf_samples/t5_q24_25_crop.png')
print("Saved crops!")
