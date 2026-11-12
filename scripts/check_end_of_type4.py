import json

with open('scripts/pdf_samples/t4_structured_lines.json', 'r', encoding='utf-8') as f:
    lines = json.load(f)

for i in range(2580, min(len(lines), 2605)):
    item = lines[i]
    print(f"{i} [{item['file']} c{item['col']}]: {item['text']}")
