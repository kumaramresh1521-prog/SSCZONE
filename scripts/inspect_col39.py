import json

with open('scripts/pdf_samples/t4_structured_lines.json', 'r', encoding='utf-8') as f:
    raw_lines = json.load(f)

c39_lines = [item['text'] for item in raw_lines if item['file'] == 'q_p38_left.json' and item['col'] == 2]

for idx, l in enumerate(c39_lines):
    print(f"{idx}: {l}")
