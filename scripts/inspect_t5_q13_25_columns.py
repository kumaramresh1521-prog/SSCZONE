import json

with open('scripts/pdf_samples/page_39_left_full_ocr.json', 'r', encoding='utf-8') as f:
    items = json.load(f)

# Sort into column 1 (x: 100 to 380) and column 2 (x: 380 to 650)
col1 = [item for item in items if 100 <= item[0][0][0] < 380]
col2 = [item for item in items if 380 <= item[0][0][0] < 650]

col1.sort(key=lambda item: item[0][0][1])
col2.sort(key=lambda item: item[0][0][1])

print("=== COLUMN 1 (Q13 to Q18) ===")
for b, t, s in col1:
    print(f"y={b[0][1]:.0f}: {t}")

print("\n=== COLUMN 2 (Q19 to Q25) ===")
for b, t, s in col2:
    print(f"y={b[0][1]:.0f}: {t}")
