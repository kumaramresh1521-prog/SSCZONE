import json

with open('scripts/pdf_samples/t4_robust/q_p36_left.json', 'r', encoding='utf-8') as f:
    it1 = json.load(f)
with open('scripts/pdf_samples/t4_robust/q_p36_right.json', 'r', encoding='utf-8') as f:
    it2 = json.load(f)

for it in it1 + it2:
    if 'MUSK' in it[1] or 'ARCS' in it[1] or 'ENHN' in it[1] or '176' in it[1]:
        print(f"y={it[0][0][1]:.1f}, x={it[0][0][0]:.1f}: {it[1]}")
