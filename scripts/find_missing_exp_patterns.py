import json
import re

exp_files = [
    'exp_p58_right.json',
    'exp_p59_left.json', 'exp_p59_right.json',
    'exp_p60_left.json', 'exp_p60_right.json',
]

for fname in exp_files:
    path = f'scripts/pdf_samples/t4_robust/{fname}'
    with open(path, 'r', encoding='utf-8') as f:
        boxes = json.load(f)
    print(f"\n=== {fname} ({len(boxes)} boxes) ===")
    for b in boxes:
        txt = b[1].strip()
        # Look for question numbers 12, 16, 20, 22, 28, 31, 33
        m = re.match(r'^(1[2-9]|2[0-9]|3[0-5])\s*[\.\,\)]\s*(.*)', txt)
        if m:
            print(f"  FOUND {m.group(1)}: '{txt}'")
        elif any(k in txt for k in ['12.', '16.', '20.', '22.', '28.', '31.', '33.']):
            print(f"  CONTAINS TARGET: '{txt}'")
