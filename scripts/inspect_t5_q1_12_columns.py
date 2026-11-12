import json

# Inspect page_38_full right half (Q1 to Q12)
with open('scripts/pdf_samples/t5_q1_12_ocr.json', 'r', encoding='utf-8') as f:
    items1 = json.load(f)

# Sort into column 1 (x: 240 to 520) and column 2 (x: 520 to 880)
col1 = [item for item in items1 if 240 <= item[0][0][0] < 520]
col2 = [item for item in items1 if 520 <= item[0][0][0] < 880]

col1.sort(key=lambda item: item[0][0][1])
col2.sort(key=lambda item: item[0][0][1])

print("=== COLUMN 1 (Q1 to Q7) ===")
for b, t, s in col1:
    print(f"y={b[0][1]:.0f}: {t}")

print("\n=== COLUMN 2 (Q8 to Q12) ===")
for b, t, s in col2:
    print(f"y={b[0][1]:.0f}: {t}")
