import json

with open('scripts/pdf_samples/t4_answer_table_all_boxes.json', 'r', encoding='utf-8') as f:
    boxes = json.load(f)

for poly, text, s in boxes:
    x = poly[0][0]
    y = poly[0][1]
    if 620 <= x <= 880 and 100 <= y <= 150:
        print(f"y={y:.1f}, x={x:.1f}: {text}")
