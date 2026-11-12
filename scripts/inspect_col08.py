import json

with open('scripts/pdf_samples/t4_structured_lines.json', 'r', encoding='utf-8') as f:
    raw_lines = json.load(f)

c8_lines = [item['text'] for item in raw_lines if item['file'] == 'q_p33_left.json' and item['col'] == 1]
for idx, l in enumerate(c8_lines):
    print(f"  {idx}: {l}")
