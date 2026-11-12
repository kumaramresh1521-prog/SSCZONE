import json

with open('scripts/pdf_samples/t4_col_ocr/p32_l_c0.json', 'r', encoding='utf-8') as f:
    items = json.load(f)

print(f"Total boxes in p32_l_c0: {len(items)}")
for it in items[:40]:
    print(f"y={it['box'][0][1]:.1f}, x={it['box'][0][0]:.1f} -> {it['text']}")
