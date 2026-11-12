import json

with open('type3_raw_lines_cache.json', 'r', encoding='utf-8') as f:
    lines = json.load(f)[157:400]

for idx, l in enumerate(lines[:60]):
    print(f"{idx}: {l}")
