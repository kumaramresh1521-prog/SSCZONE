import fitz
import json

pdf_path = r'C:/Users/Admin/.gemini/antigravity/brain/a4f88990-1ffd-4462-a906-52e3447e1c0c/.user_uploaded/media_1795011857816_63e5913b.pdf'
doc = fitz.open(pdf_path)

superscripts_detected = []

for page_num in range(len(doc)):
    page = doc[page_num]
    d = page.get_text('dict')
    for b in d['blocks']:
        if 'lines' not in b:
            continue
        for l in b['lines']:
            spans = l['spans']
            if len(spans) < 2:
                continue
            # Compare font sizes and vertical baselines
            line_text = ''.join(s['text'] for s in spans)
            base_size = max(s['size'] for s in spans)
            for s in spans:
                txt = s['text'].strip()
                # If font size is smaller by >= 1.5 points or y0 is shifted up significantly
                if s['size'] < base_size - 1.5 and txt and not txt.startswith('(') and not txt.endswith(')'):
                    superscripts_detected.append({
                        'page': page_num + 1,
                        'text': txt,
                        'size': round(s['size'], 1),
                        'base_size': round(base_size, 1),
                        'line': line_text.strip()
                    })

print(f"Total potential superscripts detected: {len(superscripts_detected)}")
# Group by page or show first 50
for item in superscripts_detected[:60]:
    print(f"P{item['page']} [{item['text']}] in: {repr(item['line'])}")
