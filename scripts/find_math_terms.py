import fitz

pdf_path = r'C:/Users/Admin/.gemini/antigravity/brain/a4f88990-1ffd-4462-a906-52e3447e1c0c/.user_uploaded/media_1795011857816_63e5913b.pdf'
doc = fitz.open(pdf_path)

# Let's inspect all questions that mention irrational or rational
keywords = ['irrational', 'rational', 'real number', 'prime number']
found_q = []

for page_num in range(len(doc)):
    page = doc[page_num]
    text = page.get_text('text')
    lines = text.split('\n')
    for idx, l in enumerate(lines):
        if any(k in l.lower() for k in keywords):
            context = '\n'.join(lines[max(0, idx-2):min(len(lines), idx+5)])
            found_q.append((page_num + 1, context))

print(f"Total matching sections: {len(found_q)}")
for p, c in found_q[:25]:
    print(f"--- Page {p} ---")
    print(c)
