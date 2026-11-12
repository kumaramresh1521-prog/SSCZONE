import json

with open('scripts/pdf_samples/t4_structured_lines.json', 'r', encoding='utf-8') as f:
    raw_lines = json.load(f)

# Collect lines for c_idx 1 (q_p32_left.json col 0)
lines_c1 = [l for l in raw_lines if l['file'] == 'q_p32_left.json' and l['col'] == 0]
for idx, l in enumerate(lines_c1):
    print(f"{idx:3d}: {l['text']}")
