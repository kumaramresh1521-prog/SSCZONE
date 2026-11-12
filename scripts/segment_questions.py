import json
import re

with open('scripts/pdf_samples/t4_filtered_tokens.json', 'r', encoding='utf-8') as f:
    tokens = json.load(f)

# Find question starts
# A question start is:
# Number from 1 to 254 followed by . or ) and NOT a date (not followed by \d{2}\.\d{4})
q_starts = []
for idx, (b, text) in enumerate(tokens):
    # Pattern: "12.", "12 .", "12)", "12-", "12,"
    m = re.match(r'^([1-9]\d{0,2})\s*[\.\,\)\-]\s*(.*)', text)
    if m:
        num = int(m.group(1))
        rest = m.group(2).strip()
        # Filter out dates like 17.03.2013 or 24.12.2020
        if re.match(r'^\d{2}\.\d{4}', rest):
            continue
        # Filter out option numbers like (1) or (2) if it was inside parentheses
        if text.startswith('(') or text.startswith('['):
            continue
        if 1 <= num <= 254:
            q_starts.append((num, idx, rest, text))

print(f"Total potential question starts: {len(q_starts)}")

# Filter to get strictly increasing or sequential questions
valid_qs = {}
last_q = 0
for num, idx, rest, orig in q_starts:
    # If it is the expected next question or within +5
    if num > last_q and num <= last_q + 5:
        valid_qs[num] = (idx, rest, orig)
        last_q = num
    elif num not in valid_qs and 1 <= num <= 254:
        # Check if reasonable
        if last_q == 0 and num == 1:
            valid_qs[num] = (idx, rest, orig)
            last_q = 1

print(f"Found {len(valid_qs)} / 254 sequential questions!")
missing = [i for i in range(1, 255) if i not in valid_qs]
print(f"Missing question numbers: {missing}")
