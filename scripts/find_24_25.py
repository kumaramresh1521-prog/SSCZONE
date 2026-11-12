import json

with open('scripts/pdf_samples/page_39_left_full_ocr.json', 'r', encoding='utf-8') as f:
    items = json.load(f)

# Find any mentions of '24.' or '25.' or '24 ' or '25 '
for b, t, s in items:
    if any(k in t for k in ['24.', '25.', '24 .', '25 .', '24)', '25)']):
        print(f"Match: '{t}' at x={b[0][0]:.1f}, y={b[0][1]:.1f}")
