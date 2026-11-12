import json
import re

with open('scripts/pdf_samples/t4_clean_tokens.json', 'r', encoding='utf-8') as f:
    tokens = json.load(f)

# Find exam tags and question numbers
# Let's see: how many exam tags are there?
exam_indices = []
for idx, (b, text) in enumerate(tokens):
    if re.search(r'\(?(?:SSC|Exam|CPO|CGL|CHSL|MTS|Stenographer|Constable|GD)\b.*?\d{4}', text, re.I) or re.search(r'\d{2}\.\d{2}\.\d{4}', text):
        exam_indices.append((idx, text))

print(f"Total exam tag tokens: {len(exam_indices)}")
print("Sample exam tags:", [x[1] for x in exam_indices[:5]])
print("Last exam tags:", [x[1] for x in exam_indices[-5:]])
