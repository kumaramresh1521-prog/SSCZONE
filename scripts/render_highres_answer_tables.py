import fitz
from PIL import Image

doc = fitz.open(r'F:\startup  send mail\pdf\analogy question 2-70.pdf')

# Render p39 (index 38) and p40 (index 39) at 200 DPI
for pno in [38, 39]:
    page = doc[pno]
    pix = page.get_pixmap(dpi=200)
    pix.save(f'scripts/pdf_samples/answer_table_p{pno+1}_200dpi.png')
    print(f"Saved p{pno+1} 200dpi: {pix.width}x{pix.height}")
