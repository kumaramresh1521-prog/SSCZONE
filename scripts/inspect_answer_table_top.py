import json

with open('scripts/pdf_samples/t4_answer_table_all_boxes.json', 'r', encoding='utf-8') as f:
    boxes = json.load(f)

# Sort by y, then x
boxes.sort(key=lambda b: (b[0][1], b[0][0]))

for b, t, s in boxes[:40]:
    print(f'y={b[0][1]:.1f}, x={b[0][0]:.1f}: {t}')
