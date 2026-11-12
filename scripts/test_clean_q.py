import re
import sys
import json

sys.stdout.reconfigure(encoding='utf-8')

with open('all_questions_clean_lines.txt', 'r', encoding='utf-8') as f:
    text = f.read()

# Normalize spacing around question numbers and periods
# e.g. "77.8:28::" -> "77. 8:28::"
# "88.5:35" -> "88. 5:35"
# "127.24:" -> "127. 24:"
# "BLOCK 39." -> "39."
# "2005] 43." -> "43."
# "2013] 80." -> "80."
# "2013] 81." -> "81."

cleaned = re.sub(r'(?:\[[^\]]*\]|\bBLOCK\b)\s*(\d{1,3})\.', r'\n\1.', text)
cleaned = re.sub(r'(\d{1,3})\.([^\s\d])', r'\1. \2', cleaned)
cleaned = re.sub(r'(\d{1,3})\.([0-9])', r'\1. \2', cleaned)

# Let's inspect all question headers found in cleaned text
q_positions = []
for m in re.finditer(r'(?:^|\n)\s*(\d{1,3})\.\s+', cleaned):
    q_num = int(m.group(1))
    if 1 <= q_num <= 155:
        q_positions.append((q_num, m.start(), m.end()))

print(f"Total question positions found: {len(q_positions)}")
q_found_nums = set(q[0] for q in q_positions)
print(f"Unique questions found: {len(q_found_nums)} / 155")
missing = [i for i in range(1, 156) if i not in q_found_nums]
print(f"Missing question numbers: {missing}")
