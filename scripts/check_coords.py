import json

with open('scripts/pdf_samples/t4_structured_lines.json', 'r', encoding='utf-8') as f:
    lines = json.load(f)

for fn in ['q_p31_right.json', 'q_p32_left.json', 'q_p32_right.json']:
    fn_lines = [l for l in lines if l['file'] == fn]
    min_x = min(l['box'][0][0] for l in fn_lines)
    max_x = max(l['box'][1][0] for l in fn_lines)
    min_y = min(l['box'][0][1] for l in fn_lines)
    max_y = max(l['box'][2][1] for l in fn_lines)
    print(f"{fn}: x in [{min_x:.1f}, {max_x:.1f}], y in [{min_y:.1f}, {max_y:.1f}]")
