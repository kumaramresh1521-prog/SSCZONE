import json

with open('scripts/pdf_samples/t4_structured_lines.json', 'r', encoding='utf-8') as f:
    raw_lines = json.load(f)

# Col 03 is q_p32_left.json col 2
c3_lines = [item['text'] for item in raw_lines if item['file'] == 'q_p32_left.json' and item['col'] == 2]

for idx, l in enumerate(c3_lines):
    print(f"{idx}: {l}")
