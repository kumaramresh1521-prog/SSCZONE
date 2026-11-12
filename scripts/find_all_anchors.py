import json
import re

half_files = [
    ('q_p31_right.json', True),
    ('q_p32_left.json', False), ('q_p32_right.json', False),
    ('q_p33_left.json', False), ('q_p33_right.json', False),
    ('q_p34_left.json', False), ('q_p34_right.json', False),
    ('q_p35_left.json', False), ('q_p35_right.json', False),
    ('q_p36_left.json', False), ('q_p36_right.json', False),
    ('q_p37_left.json', False), ('q_p37_right.json', False),
    ('q_p38_left.json', False), ('q_p38_right.json', False)
]

all_anchors = {}

for fname, is_p31 in half_files:
    path = f'scripts/pdf_samples/t4_robust/{fname}'
    with open(path, 'r', encoding='utf-8') as f:
        items = json.load(f)
    
    for idx, (b, text, s) in enumerate(items):
        t = text.strip()
        # Skip date lines
        if re.search(r'\d{2}\.\d{2}\.\d{4}', t):
            continue
        if re.match(r'^[\(\[]\s*[1-4]\s*[\)\]]', t):
            continue
            
        # Match question start e.g. "43. ", ".17.", "2L. ", "135. "
        m = re.match(r'^[^\w]*([1-9]\d{0,2}|[1-9][LIli]|[1-2]\d[LIli])\s*[\.\,\)\-\:]\s*(.*)', t)
        if m:
            raw_n = m.group(1).replace('L', '1').replace('l', '1').replace('I', '1').replace('i', '1')
            if raw_n.isdigit():
                num = int(raw_n)
                if 1 <= num <= 254:
                    if num not in all_anchors:
                        all_anchors[num] = (fname, idx, b, t)

print(f"Total question numbers directly anchored: {len(all_anchors)} / 254")
missing = [i for i in range(1, 255) if i not in all_anchors]
print(f"Missing anchor numbers: {len(missing)} -> {missing}")
