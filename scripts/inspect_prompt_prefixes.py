import json
import re

with open('kiran_type2_307_verified.json', 'r', encoding='utf-8') as f:
    data = json.load(f)

print(f"Loaded {len(data)} questions.")

patterns = {}
for q in data:
    qn = q['question_number']
    qt = q['question_text'].strip()
    
    # check prefix
    first_words = ' '.join(qt.split()[:4])
    patterns[first_words] = patterns.get(first_words, 0) + 1

for p, c in sorted(patterns.items(), key=lambda x: x[1], reverse=True)[:20]:
    print(f"{c:3d}: '{p}'")
