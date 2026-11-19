import fitz

pdf_path = r'C:/Users/Admin/.gemini/antigravity/brain/a4f88990-1ffd-4462-a906-52e3447e1c0c/.user_uploaded/media_1795011857816_63e5913b.pdf'
doc = fitz.open(pdf_path)

for pno in range(23, 27):
    text = doc[pno].get_text('text')
    if '135.' in text or '136.' in text or '137.' in text:
        print(f"=== SOLUTIONS PAGE {pno+1} ===")
        lines = text.split('\n')
        for i, l in enumerate(lines):
            if any(f"{qn}." in l for qn in range(134, 143)):
                print('\n'.join(lines[max(0, i):min(len(lines), i+15)]))
                print('----------------------------')
