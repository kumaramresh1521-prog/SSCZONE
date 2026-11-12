import re
import sys
import json

sys.stdout.reconfigure(encoding='utf-8')

with open('all_explanations_clean_lines.txt', 'r', encoding='utf-8') as f:
    text = f.read()

# Normalize known OCR artifacts in answers:
# e.g. (Cc) -> (c), (Q) -> (a), (α) -> (a)
normalized_text = text.replace('(Cc)', '(c)').replace('(Q)', '(a)').replace('(α)', '(a)').replace('(C)', '(c)')

# Find all occurrences of pattern: \b(\d{1,3})\s*[\.\)]\s*\(([a-eA-E])\)
pattern = re.compile(r'\b(\d{1,3})\s*[\.\)]\s*\(([a-eA-E])\)')

answer_map = {}
for m in pattern.finditer(normalized_text):
    q_num = int(m.group(1))
    ans = m.group(2).upper()
    if 1 <= q_num <= 155:
        # If not already present or earlier index
        if q_num not in answer_map:
            answer_map[q_num] = (ans, m.start())

# Special checks for 81, 123, 124, etc. which had slightly separated answers
if 81 not in answer_map:
    # On line: 81. ... (C) As, sum of digits of 584
    answer_map[81] = ('C', 0)
if 123 not in answer_map:
    # 123 is (C)
    answer_map[123] = ('C', 0)
if 124 not in answer_map:
    # 124 is (C)
    answer_map[124] = ('C', 0)

print(f"Total answers mapped: {len(answer_map)} / 155")
missing_answers = [i for i in range(1, 156) if i not in answer_map]
print(f"Missing answers: {missing_answers}")

# Print answer distribution
dist = {}
for q in range(1, 156):
    if q in answer_map:
        ans = answer_map[q][0]
        dist[ans] = dist.get(ans, 0) + 1
print("Answer distribution:", dist)
