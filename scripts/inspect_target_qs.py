import fitz

pdf_path = r'C:/Users/Admin/.gemini/antigravity/brain/a4f88990-1ffd-4462-a906-52e3447e1c0c/.user_uploaded/media_1795011857816_63e5913b.pdf'
doc = fitz.open(pdf_path)

target_qs = [160, 162, 241, 261, 342, 345]

for pno in range(len(doc)):
    text = doc[pno].get_text('text')
    lines = text.split('\n')
    for i, l in enumerate(lines):
        for q in target_qs:
            if f"{q}." in l or f"{q} ." in l:
                print(f"=== Q{q} on Page {pno+1} ===")
                print('\n'.join(lines[max(0, i-1):min(len(lines), i+12)]))
                print('----------------------------')
