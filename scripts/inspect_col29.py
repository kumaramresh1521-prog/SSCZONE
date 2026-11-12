import json

with open('scripts/pdf_samples/t4_structured_lines.json', 'r', encoding='utf-8') as f:
    raw_lines = json.load(f)

c29_lines = [item['text'] for item in raw_lines if item['file'] == 'q_p36_right.json' and item['col'] == 1]
for idx, l in enumerate(c29_lines):
    print(f"  {idx}: {l}")
