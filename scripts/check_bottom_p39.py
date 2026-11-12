import json

with open('scripts/pdf_samples/page_39_left_full_ocr.json', 'r', encoding='utf-8') as f:
    items = json.load(f)

print("=== LINES with y > 1000 on Page 39 left ===")
bottom_lines = [item for item in items if item[0][0][1] > 1000]
bottom_lines.sort(key=lambda item: (item[0][0][1], item[0][0][0]))

for b, t, s in bottom_lines:
    print(f"y={b[0][1]:.0f}, x={b[0][0]:.0f}: {t}")
