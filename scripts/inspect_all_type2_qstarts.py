import json
import re

with open('type2_raw_lines_cache.json', 'r', encoding='utf-8') as f:
    raw_lines = json.load(f)

# Find where Type-II starts (after TYPE-II or Q284)
start_idx = 0
for idx, l in enumerate(raw_lines):
    if 'TYPE-II' in l.upper() or 'TYPE -II' in l.upper():
        start_idx = idx
        break
    if 'Boiling' in l and 'Lukewarm' in l:
        start_idx = idx + 10

print(f"Type-II begins around line {start_idx}: '{raw_lines[start_idx]}'")

type2_lines = raw_lines[start_idx:]

# Let's inspect question starts in type2_lines
# A question starts with:
# 1. ^\s*(\d{1,3})[\.\,\:]\s*(.*)
# where rest is NOT a date (date has (Shift|Sitting|Exam|CBE|\d{2}\.\d{2}\.\d{4}))
# and l does NOT start with (1), (2), (3), (4)
q_starts = []
for idx, l in enumerate(type2_lines):
    # Skip option lines
    if re.match(r'^\s*\([1-4]\)', l):
        continue
    m = re.match(r'^\s*(\d{1,3})[\.\,\:\)]\s*(.*)', l)
    if m:
        num = int(m.group(1))
        rest = m.group(2).strip()
        # Check if it's an exam tag or date line
        is_exam = bool(re.search(r'\b(?:Shift|Sitting|Exam|CBE|Graduate|Staff|CHSL|CGL|MTS|CAPF|Delhi|Stenographer|FCI)\b', l, re.I))
        is_pure_date = bool(re.match(r'^\d{2}\.\d{2}\.\d{4}', rest))
        
        # If line contains analogy colon ':', it is a question!
        if ':' in l or (not is_exam and not is_pure_date and 1 <= num <= 350):
            q_starts.append((num, idx, l))

print(f"Detected {len(q_starts)} question starts in Type-II lines.")
# Check the numbers detected
nums = [it[0] for it in q_starts]
print("First 15 question numbers:", nums[:15])
print("Last 15 question numbers:", nums[-15:])
print(f"Unique numbers detected: {len(set(nums))}")
