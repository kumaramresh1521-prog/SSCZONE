import json

with open('scripts/pdf_samples/t4_robust/q_p32_left.json', 'r', encoding='utf-8') as f:
    it_l = json.load(f)

# Find where 31 and 33 are
for idx, (b, t, s) in enumerate(it_l):
    if '31.' in t or '33.' in t or '32.' in t or '32' in t:
        print(f"p32_left [{idx}]: {t} at x={b[0][0]:.0f}, y={b[0][1]:.0f}")
