import fitz

pdf_path = r'C:/Users/Admin/.gemini/antigravity/brain/a4f88990-1ffd-4462-a906-52e3447e1c0c/.user_uploaded/media_1795011857816_63e5913b.pdf'
doc = fitz.open(pdf_path)

page = doc[5] # page 6
text = page.get_text('text')
lines = text.split('\n')
for i, l in enumerate(lines):
    if '135.' in l or '136.' in l:
        print(f"--- Line {i} ---")
        print('\n'.join(lines[max(0, i-5):min(len(lines), i+30)]))
