import json
import re
import sys

sys.stdout.reconfigure(encoding='utf-8')

with open('type2_raw_lines_cache.json', 'r', encoding='utf-8') as f:
    raw_lines = json.load(f)

print(f"Loaded {len(raw_lines)} raw question lines.")

# Filter header & watermark & promo lines
filtered_lines = []
skip_promo = False
for l in raw_lines:
    if 'Directions' in l and 'follow' in l:
        continue
    if 'given alternatives' in l:
        continue
    if 'Search onTele' in l or '@apna' in l:
        continue
    filtered_lines.append(l)

# Step 1: Detect question starting line indices
# In Type-II, questions are numbered 1 to ~307:
# Patterns: ^\s*(\d{1,3})[\.\,\:]\s*(.*)
q_starts = []
for idx, l in enumerate(filtered_lines):
    m = re.match(r'^\s*(\d{1,3})[\.\,\:]\s*(.*)', l)
    if m:
        num = int(m.group(1))
        rest = m.group(2).strip()
        # Ensure not a date like 10.03.2013 or option like (1)
        is_date = bool(re.match(r'^\d{2,4}\b', rest) or re.search(r'\b(?:Shift|Sitting|Exam|CBE)\b', rest, re.I))
        if not is_date and not re.match(r'^\s*\([1-4]\)', l) and 1 <= num <= 350:
            q_starts.append((num, idx))

print(f"Detected {len(q_starts)} raw question start boundary candidates.")
print("First 10 starts:", q_starts[:10])
print("Last 10 starts:", q_starts[-10:])
