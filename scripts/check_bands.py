import json

with open('scripts/pdf_samples/t4_answer_table_all_boxes.json', 'r', encoding='utf-8') as f:
    boxes = json.load(f)

for name, xmin, xmax in [('Band A (Middle)', 350, 620), ('Band B (Left)', 100, 350), ('Band C (Right)', 620, 880)]:
    b_boxes = [box for box in boxes if xmin <= box[0][0][0] < xmax]
    b_boxes.sort(key=lambda box: (round(box[0][0][1] / 18) * 18, box[0][0][0]))
    print(f'=== {name}: {len(b_boxes)} boxes ===')
    for poly, t, s in b_boxes[:8]:
        print(f'  y={poly[0][1]:.1f}, x={poly[0][0]:.1f}: {t}')
    print('  ...')
    for poly, t, s in b_boxes[-8:]:
        print(f'  y={poly[0][1]:.1f}, x={poly[0][0]:.1f}: {t}')
