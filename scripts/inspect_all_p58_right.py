import json

with open('scripts/pdf_samples/t4_robust/exp_p58_right.json', 'r', encoding='utf-8') as f:
    boxes = json.load(f)

print(f"Total boxes: {len(boxes)}")
for col_idx, (x_min, x_max) in enumerate([(0, 120), (120, 260), (260, 420)]):
    col_boxes = [b for b in boxes if x_min <= b[0][0][0] < x_max]
    col_boxes.sort(key=lambda b: b[0][0][1])
    print(f"\n--- Col {col_idx} (x={x_min}..{x_max}, {len(col_boxes)} boxes) ---")
    for b in col_boxes:
        print(f"  y={b[0][0][1]:.1f}: {b[1]}")
