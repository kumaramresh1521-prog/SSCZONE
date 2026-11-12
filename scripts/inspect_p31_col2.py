import json

with open('scripts/pdf_samples/t4_robust/q_p31_right.json', 'r', encoding='utf-8') as f:
    items = json.load(f)

t4_boxes = [b for b in items if b[0][0][0] >= 265 and b[0][0][1] >= 170]
t4_boxes.sort(key=lambda b: b[0][0][1])

for b in t4_boxes:
    print(f"y={b[0][0][1]:.1f}, x={b[0][0][0]:.1f}: {b[1]}")
