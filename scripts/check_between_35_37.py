import json

with open('all_284_expl_lines.json', 'r', encoding='utf-8') as f:
    lines = json.load(f)

for idx, l in enumerate(lines):
    if '35.' in l or '37.' in l:
        print(f"--- Around Line {idx} ---")
        for j in range(max(0, idx-2), min(len(lines), idx+5)):
            print(f"{j}: {lines[j]}")
