import json

with open('scripts/pdf_samples/t4_filtered_tokens.json', 'r', encoding='utf-8') as f:
    tokens = json.load(f)

print("=== SEARCHING FOR 17, 21, 31, 32 ===")
for idx, (b, text) in enumerate(tokens[:300]):
    for target in ['17', '21', '31', '32']:
        if target in text:
            print(f"Token {idx}: '{text}' at x={b[0][0]:.0f}, y={b[0][1]:.0f}")
