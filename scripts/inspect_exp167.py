import json

with open('scripts/pdf_samples/t4_robust/exp_p65_left.json', 'r', encoding='utf-8') as f:
    items = json.load(f)

for idx, it in enumerate(items):
    if '167' in it[1]:
        print("=== AROUND 167 ===")
        for k in range(max(0, idx - 5), min(len(items), idx + 10)):
            print(f"  {items[k][1]}")
        break
