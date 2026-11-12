import json
import re
import sys

sys.stdout.reconfigure(encoding='utf-8')

with open('type3_raw_lines_cache.json', 'r', encoding='utf-8') as f:
    lines = json.load(f)

# Focus strictly on Type-III range: line 157 to line 4858
q_lines = lines[157:4859]
print(f"Total Type-III lines: {len(q_lines)}")

def clean_noise(text):
    text = re.sub(r'K5279/\d+', '', text)
    text = re.sub(r'Search onTele.*', '', text)
    text = re.sub(r'@apna.*', '', text)
    text = re.sub(r'^\s*TYPE\s*[-–—]?\s*[I|V|X\d]+\s*', '', text, flags=re.I)
    return text.strip()

# Option detection regex
opt_regex = re.compile(r'\([1-4]\)|(?:\([m|n|i|l|\s*]\)|\(\s*\))\s*\(?\d+')

opt_indices = [idx for idx, l in enumerate(q_lines) if opt_regex.search(l)]
print(f"Detected {len(opt_indices)} lines with option markers.")

# Group consecutive option lines
opt_groups = []
curr = []
for idx in opt_indices:
    if not curr or (idx <= curr[-1] + 2 and not any('Exam' in q_lines[k] or 'Shift' in q_lines[k] for k in range(curr[-1]+1, idx))):
        curr.append(idx)
    else:
        opt_groups.append(curr)
        curr = [idx]
if curr:
    opt_groups.append(curr)

print(f"Detected {len(opt_groups)} option groups (Target: 257)!")
