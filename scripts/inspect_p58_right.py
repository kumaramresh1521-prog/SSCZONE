import json

with open('scripts/pdf_samples/t4_robust/exp_p58_right.json', 'r', encoding='utf-8') as f:
    boxes = json.load(f)

print(f"Total boxes in exp_p58_right.json: {len(boxes)}")
for b in boxes[:20]:
    poly = b[0]
    txt = b[1]
    print(f"y={poly[0][1]:.1f}, x={poly[0][0]:.1f} -> {txt}")
