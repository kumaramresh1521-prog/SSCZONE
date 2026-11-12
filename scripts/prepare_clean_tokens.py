import json
import re

# Load all question half-pages in order
half_files = [
    ('q_p31_right.json', True), # True means filter col 2
    ('q_p32_left.json', False), ('q_p32_right.json', False),
    ('q_p33_left.json', False), ('q_p33_right.json', False),
    ('q_p34_left.json', False), ('q_p34_right.json', False),
    ('q_p35_left.json', False), ('q_p35_right.json', False),
    ('q_p36_left.json', False), ('q_p36_right.json', False),
    ('q_p37_left.json', False), ('q_p37_right.json', False),
    ('q_p38_left.json', False), ('q_p38_right.json', False)
]

def sort_half_page(items):
    def key_func(it):
        x = it[0][0][0]
        y = it[0][0][1]
        col = 0 if x < 140 else (1 if x < 270 else 2)
        return (col, y)
    return sorted(items, key=key_func)

all_tokens = []
for fname, is_p31 in half_files:
    path = f'scripts/pdf_samples/t4_robust/{fname}'
    with open(path, 'r', encoding='utf-8') as f:
        it = json.load(f)
        if is_p31:
            it = [x for x in it if x[0][0][0] >= 270 and x[0][0][1] >= 170]
            all_tokens.extend(sorted(it, key=lambda x: x[0][0][1]))
        elif 'p38_right' in fname:
            # Filter before TYPE-V
            it = [x for x in it if x[0][0][0] < 240 or x[0][0][1] < 90]
            all_tokens.extend(sort_half_page(it))
        else:
            all_tokens.extend(sort_half_page(it))

print(f"Loaded {len(all_tokens)} tokens from question pages.")

# Filter headers
clean_tokens = []
for b, t, s in all_tokens:
    tc = t.strip()
    if not tc:
        continue
    if any(k in tc.upper() for k in ['TELEGRAM', '@APNA', 'ANALOGY', 'K5279']):
        continue
    clean_tokens.append((b, tc))

print(f"Clean tokens: {len(clean_tokens)}")

# Save clean tokens
with open('scripts/pdf_samples/t4_clean_tokens.json', 'w', encoding='utf-8') as f:
    json.dump(clean_tokens, f, ensure_ascii=False, indent=2)
