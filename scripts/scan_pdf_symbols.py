import fitz

pdf_path = r'C:/Users/Admin/.gemini/antigravity/brain/a4f88990-1ffd-4462-a906-52e3447e1c0c/.user_uploaded/media_1795011857816_63e5913b.pdf'
doc = fitz.open(pdf_path)

symbol_spans = []

for page_num in range(len(doc)):
    page = doc[page_num]
    for b in page.get_text('dict')['blocks']:
        if 'lines' in b:
            for l in b['lines']:
                line_text = ''.join(s['text'] for s in l['spans'])
                for s in l['spans']:
                    if any(m in s['font'] for m in ['Symbol', 'Math', 'Wingdings', 'MT']):
                        symbol_spans.append({
                            'page': page_num + 1,
                            'font': s['font'],
                            'text': s['text'],
                            'line': line_text.strip()
                        })

print(f'Total Symbol/Math font spans found: {len(symbol_spans)}')
for item in symbol_spans:
    print(f"P{item['page']} [{item['font']}] {repr(item['text'])} in line: {repr(item['line'])}")
