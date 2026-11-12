import fitz

doc = fitz.open(r'F:\startup  send mail\pdf\analogy question 2-70.pdf')
for p in [0, 1, 26, 27, 30, 38, 39]:
    t = doc[p].get_text().strip()
    print(f"Page {p+1} text length: {len(t)}")
    if t:
        print(f"Page {p+1} snippet: {t[:100].replace(chr(10), ' ')}")
