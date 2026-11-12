import json

with open('scripts/pdf_samples/t4_answer_table_all_boxes.json', 'r', encoding='utf-8') as f:
    boxes = json.load(f)

xs = sorted(list(set(round(b[0][0] / 10) * 10 for b, t, s in boxes)))
print("Distinct x-coordinates (rounded by 10):", xs)
