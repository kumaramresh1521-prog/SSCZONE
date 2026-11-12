import fitz

doc = fitz.open('analogy_chapter2.pdf')
for p in range(35, len(doc)):
    txt = doc[p].get_text()
    first_few = " ".join(txt.split()[:10]) if txt else "NO_TEXT"
    print(f"Page {p+1} (idx {p}): len={len(txt)}: {first_few}")
