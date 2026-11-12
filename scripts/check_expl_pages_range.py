import fitz
from PIL import Image

doc = fitz.open(r'analogy_chapter2.pdf')
# Let's check pages 57, 58, 59, 60, 61, 62, 63, 64, 65, 66, 67, 68
print("Pages in PDF:", len(doc))
