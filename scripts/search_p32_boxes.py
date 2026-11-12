import json

with open('scripts/pdf_samples/t4_robust/q_p32_left.json', 'r', encoding='utf-8') as f:
    boxes = json.load(f)

# Sort by y then x
print(f"Total boxes in q_p32_left.json: {len(boxes)}")
for b in boxes:
    txt = b[1]
    poly = b[0]
    # Check if text contains VOT or HRX or KOC or BOU or RTU or CEF or CPW or KQH or JPG or LRI
    if any(k in txt for k in ['VOT', 'HRX', 'KOC', 'BOU', 'RVH', 'RTU', 'SUW', 'CEF', 'DGH', 'EGF', 'DFH', 'CPW', 'BOV', 'KQH', 'JPG', 'LRI']):
        print(f"Box: y={poly[0][1]:.1f}, x={poly[0][0]:.1f} -> '{txt}'")
