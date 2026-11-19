import fitz

pdf_path = r'C:/Users/Admin/.gemini/antigravity/brain/a4f88990-1ffd-4462-a906-52e3447e1c0c/.user_uploaded/media_1795011857816_63e5913b.pdf'
doc = fitz.open(pdf_path)

page = doc[7] # page 8
text = page.get_text('text')
lines = text.split('\n')
for i, l in enumerate(lines):
    for q in range(163, 175):
        if f"{q}." in l or f"{q} ." in l:
            print(f"=== Q{q} ===")
            print('\n'.join(lines[max(0, i):min(len(lines), i+10)]))
