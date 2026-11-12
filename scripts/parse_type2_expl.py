import json
import re
import sys

sys.stdout.reconfigure(encoding='utf-8')

with open('type2_expl_lines_cache.json', 'r', encoding='utf-8') as f:
    lines = json.load(f)

print(f"Total lines in type2_expl_lines_cache: {len(lines)}")

# Find where TYPE-II explanations start (after TYPE-II header)
full_text = "\n".join(lines)

# Stop before TYPE-III
t3_match = re.search(r'\bTYPE\s*-\s*III\b', full_text, re.I)
if t3_match:
    print(f"Found TYPE-III boundary at index {t3_match.start()}")
    full_text = full_text[:t3_match.start()]

# Pattern to find explanation starts:
# e.g.: "\n1. (3)" or "\n14. (2)" or "\n105. (4)" or "\n307. (2)"
pattern = re.compile(r'(?:^|\n)\s*(?:[ilI]?(\d{1,3})|io)\s*[\.\,\)]\s*\(?([1-4])\)?(?:\s*(.*))?')

matches = list(pattern.finditer(full_text))
print(f"Detected {len(matches)} explanation pattern matches in Type-II.")

parsed_expl = {}
for i in range(len(matches)):
    m = matches[i]
    q_str = m.group(1)
    q_num = 10 if not q_str else int(q_str)
    ans_digit = int(m.group(2))
    
    start_pos = m.end()
    end_pos = matches[i+1].start() if i + 1 < len(matches) else len(full_text)
    
    rest = m.group(3) or ''
    body = full_text[start_pos:end_pos].strip()
    full_body = (rest + " " + body).strip()
    
    if 1 <= q_num <= 350:
        if q_num not in parsed_expl or len(full_body) > len(parsed_expl[q_num]['explanation']):
            parsed_expl[q_num] = {
                'q_num': q_num,
                'ans_digit': ans_digit,
                'explanation': full_body
            }

print(f"Extracted {len(parsed_expl)} unique question explanations.")
print(f"Min Q: {min(parsed_expl.keys()) if parsed_expl else None}, Max Q: {max(parsed_expl.keys()) if parsed_expl else None}")

# Show sample explanations
for q in [1, 2, 3, 4, 5, 50, 100, 200, 300]:
    if q in parsed_expl:
        it = parsed_expl[q]
        print(f"\n=== Q{q} (Ans: {it['ans_digit']}) ===")
        print(it['explanation'][:120])

with open('type2_parsed_explanations.json', 'w', encoding='utf-8') as f:
    json.dump(parsed_expl, f, ensure_ascii=False, indent=2)

print("\nSaved type2_parsed_explanations.json")
