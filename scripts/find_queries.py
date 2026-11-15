import os
import re

matches = []
pattern = re.compile(r'\.select\([\'"]\*[\'"]\)')

for root, _, files in os.walk('src'):
    for f in files:
        if f.endswith(('.ts', '.tsx', '.js')):
            path = os.path.join(root, f)
            try:
                with open(path, 'r', encoding='utf-8') as fp:
                    for i, line in enumerate(fp, 1):
                        if pattern.search(line):
                            matches.append((path, i, line.strip()))
            except Exception:
                pass

print(f"Total .select('*') calls found: {len(matches)}")
for path, line_no, text in matches:
    print(f"{path}:{line_no} -> {text}")
