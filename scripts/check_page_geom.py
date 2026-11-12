import fitz

doc = fitz.open('analogy_chapter2.pdf')
page = doc[31] # Page 32 of PDF
print("Page rect:", page.rect)
# width is ~842 or similar? Let's print!
