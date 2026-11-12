import json

with open('type4_answers_complete_page40.json', 'r', encoding='utf-8') as f:
    ans_map = json.load(f)

# Convert keys to int
ans_map = {int(k): v for k, v in ans_map.items()}

# Supplement with the grid and crop verified answers
overrides = {
    39: 1, 62: 1, 69: 1, 92: 3, 94: 1, 95: 3, 101: 3, 108: 3, 113: 2,
    136: 4, 137: 1, 138: 3, 150: 2, 153: 2, 159: 4, 160: 4, 162: 1,
    164: 1, 165: 1, 166: 1, 167: 3, 168: 3, 169: 4, 170: 4, 171: 2,
    172: 3, 176: 4, 184: 2, 188: 1, 192: 3, 193: 1, 195: 1, 204: 4,
    212: 1, 220: 3, 224: 1, 228: 4, 232: 3, 235: 3, 244: 4, 245: 3,
    249: 2, 250: 1, 253: 3
}

for q, a in overrides.items():
    ans_map[q] = a

print(f"Total answers mapped: {len(ans_map)} / 254")
missing = [i for i in range(1, 255) if i not in ans_map]
print(f"Missing answers: {missing}")

with open('scripts/pdf_samples/t4_final_answers_1_to_254.json', 'w', encoding='utf-8') as f:
    json.dump(ans_map, f, indent=2)
print("Saved t4_final_answers_1_to_254.json")
