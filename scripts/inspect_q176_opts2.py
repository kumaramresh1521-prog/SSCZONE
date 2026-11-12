import json

with open('scripts/pdf_samples/t4_robust/q_p36_left.json', 'r', encoding='utf-8') as f:
    items = json.load(f)

for it in items:
    if it[0][0][1] >= 515 and it[0][0][0] < 160:
        print(f"y={it[0][0][1]:.1f}, x={it[0][0][0]:.1f}: {it[1]}")
