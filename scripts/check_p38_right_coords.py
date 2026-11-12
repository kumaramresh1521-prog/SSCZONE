import json

with open('scripts/pdf_samples/t4_structured_lines.json', 'r', encoding='utf-8') as f:
    lines = json.load(f)

p38_r = [l for l in lines if l['file'] == 'q_p38_right.json']
for idx, l in enumerate(p38_r[:30]):
    print(f"{idx:2d} col={l['col']} box={l['box'][0]}..{l['box'][2]} -> {l['text']}")
