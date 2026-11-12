import json

with open('scripts/pdf_samples/t4_robust/q_p34_right.json', 'r', encoding='utf-8') as f:
    items = json.load(f)

for it in items[:40]:
    x = it[0][0][0]
    y = it[0][0][1]
    t = it[1]
    if any(k in t for k in ['122', '123', '124', '125', '126', '127', '128', '129', '130', '131', '132', '133', '134']):
        print(f"y={y:.1f}, x={x:.1f}: {t}")
