import json
import re

with open('scripts/pdf_samples/t4_filtered_tokens.json', 'r', encoding='utf-8') as f:
    tokens = json.load(f)

detected_nums = []
for idx, (b, text) in enumerate(tokens):
    # Match any number followed by dot or space or letter
    m = re.match(r'^([1-9]\d{0,2})\s*[\.\,\)\-\:]\s*(.*)', text)
    if m:
        num = int(m.group(1))
        rest = m.group(2).strip()
        if re.match(r'^\d{2}\.\d{4}', rest):
            continue
        if text.startswith('(') or text.startswith('['):
            continue
        if 1 <= num <= 254:
            detected_nums.append((num, idx, rest[:30]))

# Unique question numbers
nums_set = sorted(list(set(n[0] for n in detected_nums)))
print(f"Total unique question numbers found: {len(nums_set)} / 254")
print("Min:", min(nums_set) if nums_set else None, "Max:", max(nums_set) if nums_set else None)

missing = [i for i in range(1, 255) if i not in nums_set]
print(f"Missing from raw regex: {len(missing)} questions: {missing[:30]}...")
