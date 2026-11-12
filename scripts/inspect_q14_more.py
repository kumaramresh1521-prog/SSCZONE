import json

with open('scripts/pdf_samples/t4_robust/q_p32_left.json', 'r', encoding='utf-8') as f:
    boxes = json.load(f)

matching = [b for b in boxes if 310 <= b[0][0][1] <= 345 and b[0][0][0] < 160]
matching.sort(key=lambda b: (b[0][0][1], b[0][0][0]))
for b in matching:
    poly = b[0]
    txt = b[1]
    print(f"y={poly[0][1]:.1f}, x={poly[0][0]:.1f} -> {txt}")
