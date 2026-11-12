import fitz

doc = fitz.open('analogy_chapter2.pdf')

# Let's inspect pages 55 to 60 (indices 54 to 59)
for pno in range(55, 60):
    page = doc[pno]
    print(f"Page {pno+1} rect: {page.rect}")
