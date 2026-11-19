import fitz

pdf_path = r'C:/Users/Admin/.gemini/antigravity/brain/a4f88990-1ffd-4462-a906-52e3447e1c0c/.user_uploaded/media_1795011857816_63e5913b.pdf'
doc = fitz.open(pdf_path)
page = doc[0]

found = False
for b in page.get_text('dict')['blocks']:
    if 'lines' in b:
        for l in b['lines']:
            for s in l['spans']:
                txt = s['text']
                if '13.' in txt:
                    found = True
                if '17.' in txt:
                    found = False
                if found:
                    print(f"FONT: {s['font']:18} SIZE: {s['size']:4.1f} TEXT: {repr(txt)}")
