import json

with open('scripts/pdf_samples/t4_robust/q_p32_left.json', 'r', encoding='utf-8') as f:
    items = json.load(f)

# Find all questions with x coordinate
print("=== X coordinate of question numbers on Page 32 left ===")
for b, t, s in items:
    if any(t.startswith(f"{i}.") for i in range(1, 50)):
        print(f"x={b[0][0]:.0f}, y={b[0][1]:.0f}: {t}")
