import json, os, re
from collections import Counter

with open('scripts/pdf_samples/t4_parsed_254.json', 'r', encoding='utf-8') as f:
    parsed = {q['q_num']: q for q in json.load(f)}

with open('scripts/pdf_samples/t4_answers_p40_verified.json', 'r', encoding='utf-8') as f:
    p40_ans = {int(k): v for k, v in json.load(f).items()}
p40_ans[214] = 3

# Check what Q27 looks like and check any non-alpha in options across all 254
print("=== NON-ALPHA / WEIRD CHARS IN OPTIONS ===")
for qn in sorted(parsed):
    opts = parsed[qn]['options']
    for idx, o in enumerate(opts):
        if re.search(r'[0-9]|[^A-Za-z0-9\s:,-]', o) or o != o.upper():
            # Skip genuine alphanumeric questions
            print(f"Q{qn:3d} Opt{idx+1}: {repr(o)}")

print("\n=== CHECKING EXAM TAGS FORMAT ===")
bad_exams = []
for qn in sorted(parsed):
    ex = parsed[qn].get('exam_tag', '')
    if not ex or 'SSC' not in ex or len(ex) < 15:
        bad_exams.append((qn, ex))
print(f"Potentially weak/empty exam tags: {len(bad_exams)}")
for qn, ex in bad_exams[:30]:
    print(f"  Q{qn:3d}: {repr(ex)}")
