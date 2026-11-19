import fitz

pdf_path = r'C:/Users/Admin/.gemini/antigravity/brain/a4f88990-1ffd-4462-a906-52e3447e1c0c/.user_uploaded/media_1795011857816_63e5913b.pdf'
doc = fitz.open(pdf_path)

# Let's search pages 6, 7, 8 (around Q130-Q145)
for pno in range(5, 9):
    text = doc[pno].get_text('text')
    lines = text.split('\n')
    print(f"=== PAGE {pno+1} ===")
    for l in lines:
        for qn in range(132, 143):
            if f"{qn}." in l or f"{qn} ." in l:
                print(f"Found {qn}: {l}")
