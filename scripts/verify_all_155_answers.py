import re
import sys
import json

sys.stdout.reconfigure(encoding='utf-8')

# 1. Load explanations raw text
with open('all_explanations_raw.txt', 'r', encoding='utf-8') as f:
    raw_expl = f.read()

# Normalize common artifacts in raw text
norm_expl = raw_expl.replace('(Cc)', '(c)').replace('(Q)', '(a)').replace('(α)', '(a)').replace('(C)', '(c)')

# Find all entries: <q_num>. (<letter>)
# Search specifically for pattern like "\n1. (d)" or " 1. (d)"
raw_answers = {}

# Use regex to find all "<num>. (<letter>)"
for m in re.finditer(r'(?:^|\n|\s)(\d{1,3})\s*[\.\)]\s*(?:\n\s*)?\(([a-eA-E])\)', norm_expl):
    q_num = int(m.group(1))
    letter = m.group(2).upper()
    if 1 <= q_num <= 155:
        if q_num not in raw_answers:
            raw_answers[q_num] = letter

# Also check for any that didn't match the standard pattern
# 81: (C)
raw_answers[81] = 'C'
# 123: (C)
raw_answers[123] = 'C'
# 124: (C)
raw_answers[124] = 'C'

# 2. Load final questions dataset
with open('reasoning_analogy_155_verified.json', 'r', encoding='utf-8') as f:
    questions = json.load(f)

mismatches = []
missing_in_raw = []

for q in questions:
    num = q['question_number']
    assigned_ans = q['correct_answer']
    raw_ans = raw_answers.get(num)
    
    if not raw_ans:
        missing_in_raw.append(num)
    elif assigned_ans != raw_ans:
        mismatches.append((num, assigned_ans, raw_ans, q['question_text']))

print(f"Total questions: {len(questions)}")
print(f"Raw answers captured directly: {len(raw_answers)} / 155")
print(f"Missing in raw: {missing_in_raw}")
print(f"Mismatches between assigned answer and book literal answer: {len(mismatches)}")
for m in mismatches:
    print(f"  Q{m[0]}: assigned={m[1]} vs book={m[2]} | Text: {m[3]}")
