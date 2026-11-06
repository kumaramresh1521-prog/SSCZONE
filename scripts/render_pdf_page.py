import fitz

pdf_path = r"F:\startup  send mail\SSC CGL, 2025 Official Paper (Held On_ 16 Sept, 2025 Shift 1).pdf"
doc = fitz.open(pdf_path)

# Let's search which page has Q.53 in the PDF
for pno in range(len(doc)):
    page = doc[pno]
    txt = page.get_text()
    if "Q53." in txt:
        print(f"Q53 is on PDF page {pno+1}")
        pix = page.get_pixmap(dpi=150)
        pix.save(f"c:\\ssczone\\scripts\\page_{pno+1}.png")
        print(f"Saved page_{pno+1}.png")
