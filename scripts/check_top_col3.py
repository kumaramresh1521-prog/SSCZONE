import json

with open('scripts/pdf_samples/page_39_left_full_ocr.json', 'r', encoding='utf-8') as f:
    items = json.load(f)

print("=== LINES with x > 600 and y < 550 on Page 39 left ===")
top_col3 = [item for item in items if item[0][0][0] > 600 and item[0][0][1] < 550]
top_col3.sort(key=lambda item: item[0][0][1])

for b, t, s in top_col3:
    print(f"y={b[0][1]:.0f}, x={b[0][0]:.0f}: {t}")
