import fitz

pdf_path = r'C:/Users/Admin/.gemini/antigravity/brain/a4f88990-1ffd-4462-a906-52e3447e1c0c/.user_uploaded/media_1795011857816_63e5913b.pdf'
doc = fitz.open(pdf_path)

radicals = []

for page_num in range(len(doc)):
    page = doc[page_num]
    drawings = page.get_drawings()
    for d in drawings:
        r = d['rect']
        w = r.width
        h = r.height
        # A radical symbol has height around 8-25 points and consists of connected path items or horizontal top bar
        # Let's check items
        items = d['items']
        # Check if drawing has diagonal or v-shaped strokes
        if 6 <= h <= 40 and 6 <= w <= 80:
            # Check text immediately inside or to the right of this rect
            words = page.get_text('words')
            nearby_words = [w[4] for w in words if abs(w[1] - r.y0) < 15 and abs(w[0] - r.x0) < 50]
            radicals.append({
                'page': page_num + 1,
                'rect': (round(r.x0, 1), round(r.y0, 1), round(r.x1, 1), round(r.y1, 1)),
                'items_count': len(items),
                'nearby': ' '.join(nearby_words[:6])
            })

print(f"Total potential radical drawings found: {len(radicals)}")
for rad in radicals[:40]:
    print(f"P{rad['page']} Rect={rad['rect']} Items={rad['items_count']} -> Nearby: {rad['nearby']}")
