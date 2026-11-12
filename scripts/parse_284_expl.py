import json
import re
import sys

sys.stdout.reconfigure(encoding='utf-8')

with open('all_284_expl_lines.json', 'r', encoding='utf-8') as f:
    lines = json.load(f)

print(f"Total lines in all_284_expl_lines: {len(lines)}")

full_text = "\n".join(lines)

# Stop before TYPE-II
t2_match = re.search(r'\bTYPE\s*-\s*II\b', full_text, re.I)
if t2_match:
    print(f"Found TYPE-II boundary at character index {t2_match.start()}")
    full_text = full_text[:t2_match.start()]

# Pattern to find explanation starts:
# e.g.: "\n1. (2)" or "\n14. (2)" or "\n105. (4)" or "\nio. (3)"
# Note: sometimes number is prefixed by letter like I. or l. or digit
pattern = re.compile(r'(?:^|\n)\s*(?:[ilI]?(\d{1,3})|io)\s*[\.\)]\s*\(?([1-4])\)?(?:\s*(.*))?')

matches = list(pattern.finditer(full_text))
print(f"Detected {len(matches)} explanation pattern matches.")

parsed_items = {}
for i in range(len(matches)):
    m = matches[i]
    q_str = m.group(1)
    q_num = 10 if not q_str else int(q_str)
    ans_digit = int(m.group(2))
    
    # Text extends to start of next match
    start_pos = m.end()
    end_pos = matches[i+1].start() if i + 1 < len(matches) else len(full_text)
    
    # Combined with any text captured in group 3
    rest = m.group(3) or ''
    body = full_text[start_pos:end_pos].strip()
    full_expl = (rest + " " + body).strip()
    
    if 1 <= q_num <= 284:
        # If already exists, only overwrite if longer or valid
        if q_num not in parsed_items or len(full_expl) > len(parsed_items[q_num]['explanation']):
            parsed_items[q_num] = {
                'q_num': q_num,
                'ans_digit': ans_digit,
                'explanation': full_expl
            }

print(f"Extracted {len(parsed_items)} unique questions out of 284.")
missing = [i for i in range(1, 285) if i not in parsed_items]
print(f"Missing question numbers: {missing}")

# Save parsed result
with open('parsed_284_explanations.json', 'w', encoding='utf-8') as f:
    json.dump(parsed_items, f, ensure_ascii=False, indent=2)

for q in range(1, 16):
    if q in parsed_items:
        it = parsed_items[q]
        print(f"Q{q} -> Ans: {it['ans_digit']}: {it['explanation'][:60]}")
