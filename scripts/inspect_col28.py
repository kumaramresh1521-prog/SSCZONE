import json

with open('scripts/pdf_samples/t4_structured_lines.json', 'r', encoding='utf-8') as f:
    raw_lines = json.load(f)

c28_lines = [item['text'] for item in raw_lines if item['file'] == 'q_p36_right.json' and item['col'] == 0]
for idx, l in enumerate(c28_lines):
    print(f"  {idx}: {l}")
