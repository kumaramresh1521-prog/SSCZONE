import json
import re

with open('scripts/pdf_samples/t4_answer_table_all_boxes.json', 'r', encoding='utf-8') as f:
    boxes = json.load(f)

missing = [39, 62, 69, 92, 101, 108, 113, 136, 137, 138, 150, 153, 166, 169, 170, 171, 172, 176, 184, 188, 192, 193, 195, 204, 212, 224, 228, 244, 249, 253]

print("=== CHECKING BOXES FOR MISSING NUMBERS ===")
for b, t, s in boxes:
    for m in missing:
        # Check if the number appears
        if re.search(r'\b' + str(m) + r'\b', t):
            print(f'Missing candidate {m} in box: "{t}" (y={b[0][1]:.1f}, x={b[0][0]:.1f})')
