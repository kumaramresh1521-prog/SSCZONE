import json

with open('scripts/pdf_samples/t4_robust/q_p32_right.json', 'r', encoding='utf-8') as f:
    items = json.load(f)

for it in items:
    if 'AOE' in it[1] or 'RKT' in it[1] or (it[0][0][1] >= 155 and it[0][0][1] <= 210 and it[0][0][0] >= 270):
        print(f"y={it[0][0][1]:.1f}, x={it[0][0][0]:.1f}: {it[1]}")
