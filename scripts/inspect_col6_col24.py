import json

with open('scripts/pdf_samples/t4_structured_lines.json', 'r', encoding='utf-8') as f:
    raw_lines = json.load(f)

# Reconstruct cols
cols = []
cur_key = None
cur_list = []
for idx, item in enumerate(raw_lines):
    if idx >= 2599: break
    key = (item['file'], item['col'])
    if key != cur_key:
        if cur_list: cols.append((cur_key, cur_list))
        cur_key = key
        cur_list = []
    cur_list.append(item['text'])
if cur_list: cols.append((cur_key, cur_list))

print("=== COL 06 (p32_r c2, Q67-74) ===")
for li, l in enumerate(cols[6][1]):
    print(f"  {li}: {l}")

print("\n=== COL 24 (p35_r c2, Q167-172) ===")
for li, l in enumerate(cols[24][1]):
    print(f"  {li}: {l}")
