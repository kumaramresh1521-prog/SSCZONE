import fitz
from test_superscript_extraction import extract_page_with_superscripts

pdf_path = r'C:/Users/Admin/.gemini/antigravity/brain/a4f88990-1ffd-4462-a906-52e3447e1c0c/.user_uploaded/media_1795011857816_63e5913b.pdf'
doc = fitz.open(pdf_path)

for p in [0, 10, 11, 15, 16]:
    print(f"==================== PAGE {p+1} ====================")
    txt = extract_page_with_superscripts(doc[p])
    lines = [l for l in txt.split('\n') if any(k in l for k in ['^{', 'π', 'divisible by', 'number'])]
    print('\n'.join(lines[:35]))
