import os
import re

comp_links = []
for root, dirs, files in os.walk('src/components'):
    for f in files:
        if f.endswith(('.tsx', '.ts', '.jsx', '.js')):
            p = os.path.join(root, f)
            with open(p, 'r', encoding='utf-8', errors='ignore') as file:
                for line_no, line in enumerate(file, 1):
                    if 'href=' in line and any(k in line for k in ['take-test', 'practice', 'paper', 'quiz', 'topic']):
                        comp_links.append((p, line_no, line.strip()))

print(f"Total relevant links in components: {len(comp_links)}")
for p, l, text in comp_links:
    print(f"{os.path.basename(p)}:{l} -> {text}")
