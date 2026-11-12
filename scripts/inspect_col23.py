import json

with open('scripts/pdf_samples/t4_structured_lines.json', 'r', encoding='utf-8') as f:
    raw_lines = json.load(f)

# Col 23 lines
c23_lines = [item['text'] for item in raw_lines if item['file'] == 'q_p35_right.json' and item['col'] == 1]
for li, l in enumerate(c23_lines[-20:], len(c23_lines)-20):
    print(f"  {li}: {l}")
