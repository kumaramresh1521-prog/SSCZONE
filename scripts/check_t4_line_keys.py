import json

with open('scripts/pdf_samples/t4_structured_lines.json', 'r', encoding='utf-8') as f:
    lines = json.load(f)

print("Keys in t4_structured_lines element:", list(lines[0].keys()))
print("Element 0:", lines[0])
