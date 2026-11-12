import json
import sys
import unicodedata

sys.stdout.reconfigure(encoding='utf-8')

with open('reasoning_analogy_155_verified.json', 'r', encoding='utf-8') as f:
    questions = json.load(f)

# Collect all non-ascii characters and their code points, unicode names, and counts
non_ascii_chars = {}

for q in questions:
    for field in ['question_text', 'option_a', 'option_b', 'option_c', 'option_d', 'explanation']:
        text = q[field]
        for ch in text:
            if ord(ch) > 127:
                name = unicodedata.name(ch, 'UNKNOWN')
                non_ascii_chars.setdefault(ch, {'name': name, 'count': 0, 'sample_q': []})
                non_ascii_chars[ch]['count'] += 1
                if len(non_ascii_chars[ch]['sample_q']) < 3 and q['question_number'] not in non_ascii_chars[ch]['sample_q']:
                    non_ascii_chars[ch]['sample_q'].append(q['question_number'])

print(f"Total distinct non-ASCII characters found: {len(non_ascii_chars)}")
for ch, info in sorted(non_ascii_chars.items(), key=lambda x: ord(x[0])):
    print(f"U+{ord(ch):04X} | '{ch}' | {info['name']} | Count: {info['count']} | In Qs: {info['sample_q']}")
