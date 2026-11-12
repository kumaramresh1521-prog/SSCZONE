import json
import re
import os

print("=== BUILDING COMPLETE TYPE-IV VERIFIED DATASET (1 to 254) ===")

def sort_page_items(items):
    # 3 columns: col 0 (<140), col 1 (140-270), col 2 (>=270), then y
    def key_func(it):
        x = it[0][0][0]
        y = it[0][0][1]
        col = 0 if x < 140 else (1 if x < 270 else 2)
        return (col, y)
    return sorted(items, key=key_func)

# 1. Collect all question text boxes in exact column reading order
q_tokens = []

# p31 right: only Column 2 has Type-IV (x >= 270, y >= 170)
with open('scripts/pdf_samples/t4_robust/q_p31_right.json', 'r', encoding='utf-8') as f:
    it31 = json.load(f)
    t4_31 = [x for x in it31 if x[0][0][0] >= 270 and x[0][0][1] >= 170]
    q_tokens.extend(sorted(t4_31, key=lambda x: x[0][0][1]))

# p32 to p38
for pno in range(32, 39):
    for half in ['left', 'right']:
        path = f'scripts/pdf_samples/t4_robust/q_p{pno}_{half}.json'
        if os.path.exists(path):
            with open(path, 'r', encoding='utf-8') as f:
                it = json.load(f)
                # On p38 right, stop before TYPE-V (which starts at x >= 240, y >= 90)
                if pno == 38 and half == 'right':
                    # Only keep text before TYPE-V
                    it = [x for x in it if x[0][0][0] < 240 or x[0][0][1] < 90]
                q_tokens.extend(sort_page_items(it))

print(f"Total question tokens loaded: {len(q_tokens)}")

# Filter out footers / telegram headers
filtered_tokens = []
for b, t, s in q_tokens:
    tc = t.strip()
    if not tc:
        continue
    if any(k in tc.upper() for k in ['TELEGRAM', '@APNA', 'ANALOGY', 'K5279']):
        continue
    filtered_tokens.append((b, tc))

print(f"Filtered question tokens: {len(filtered_tokens)}")

# Save filtered tokens for inspection
with open('scripts/pdf_samples/t4_filtered_tokens.json', 'w', encoding='utf-8') as f:
    json.dump([[b, t] for b, t in filtered_tokens], f, ensure_ascii=False, indent=2)
