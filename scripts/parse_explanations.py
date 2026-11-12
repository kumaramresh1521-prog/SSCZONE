import re
import sys
import json

sys.stdout.reconfigure(encoding='utf-8')

with open('all_explanations_raw.txt', 'r', encoding='utf-8') as f:
    raw_text = f.read()

# Clean up raw_text: remove page header markers we added
lines = raw_text.split('\n')
clean_lines = []
for l in lines:
    if l.startswith('=== PAGE') or l.strip() in ['Analogy', 'Verbal Reasoning', 'Response & Interpretations (Master Exercise)'] or re.match(r'^\d{1,2}\s*Verbal Reasoning', l) or re.match(r'^Analogy\s*\d{1,2}', l):
        continue
    clean_lines.append(l)

clean_text = "\n".join(clean_lines)

# Find all entries where a question explanation begins: e.g. "1. (d)" or "19. (b)" or "33. (a)"
# Notice some might be "14. (Cc)" or "81. ... ? = JJEIR \n (C)" or "112. (Q)" or "123. \n 124. \n (C)"

# Let's write a robust token-based or regex-based segmenter
# Let's inspect where each question number starts
# Potential headers: ^\s*(\d{1,3})\s*[\.\)]\s*(?:\([a-eA-Eα-εQCc]+\))?
pattern = re.compile(r'(?:^|\n)\s*(\d{1,3})\s*[\.\)]\s*', re.MULTILINE)

matches = list(pattern.finditer(clean_text))
print(f"Total raw number matches in explanation text: {len(matches)}")

# Filter matches to only valid q_nums (1 to 155) that are sequentially plausible
valid_matches = []
for m in matches:
    q_num = int(m.group(1))
    if 1 <= q_num <= 155:
        # Check if following text has an answer letter like (a), (b), (c), (d), (Cc), (Q) or is part of calculation
        valid_matches.append((q_num, m.start(1), m.end()))

print(f"Candidate matches (1..155): {len(valid_matches)}")

# Print all candidate q_nums in order
print("Candidate q_nums:", [vm[0] for vm in valid_matches[:30]])
