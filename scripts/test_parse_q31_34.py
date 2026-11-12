import json
import re

def sort_half_page(items):
    # Kiran pages have 3 columns: col 0 (<140), col 1 (140-270), col 2 (>=270)
    def key_func(it):
        x = it[0][0][0]
        y = it[0][0][1]
        col = 0 if x < 140 else (1 if x < 270 else 2)
        return (col, y)
    return sorted(items, key=key_func)

# Load pages 31-34
all_items = []

# p31 right
with open('scripts/pdf_samples/t4_robust/q_p31_right.json', 'r', encoding='utf-8') as f:
    it = json.load(f)
    # only column 2 of p31 right has Type-IV (x >= 280)
    it_t4 = [x for x in it if x[0][0][0] >= 270 and x[0][0][1] > 170]
    all_items.extend(sorted(it_t4, key=lambda x: x[0][0][1]))

for p in [32, 33, 34]:
    for h in ['left', 'right']:
        with open(f'scripts/pdf_samples/t4_robust/q_p{p}_{h}.json', 'r', encoding='utf-8') as f:
            all_items.extend(sort_half_page(json.load(f)))

print(f"Total sorted text boxes loaded from Pages 31-34: {len(all_items)}")

# Find all question start indices
q_indices = []
for idx, (b, t, s) in enumerate(all_items):
    # Match "1.", "2.", "15.", etc. (at start of line)
    m = re.match(r'^([1-9]\d{0,2})\s*[\.\)]\s*(.*)', t)
    if m:
        num = int(m.group(1))
        if 1 <= num <= 254:
            q_indices.append((num, idx, m.group(2).strip(), t))

print(f"Detected {len(q_indices)} question starts!")
print("First 10 questions:", [(q[0], q[2][:30]) for q in q_indices[:10]])
print("Last 10 questions:", [(q[0], q[2][:30]) for q in q_indices[-10:]])
