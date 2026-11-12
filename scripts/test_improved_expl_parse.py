import json
import re

with open('type2_expl_lines_cache.json', 'r', encoding='utf-8') as f:
    lines = json.load(f)

full_text = "\n".join(lines)
t3_match = re.search(r'\bTYPE\s*-\s*III\b', full_text, re.I)
if t3_match:
    full_text = full_text[:t3_match.start()]

# Pattern allowing inline numbers after whitespace
pattern = re.compile(r'(?:^|\n|\s)(?:[ilI]?(\d{1,3})|io)\s*[\.\,\)]\s*\(?([1-4])\)?(?:\s*(.*))?')

matches = list(pattern.finditer(full_text))
print(f"Total pattern matches: {len(matches)}")

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
    
    if 1 <= q_num <= 307:
        if q_num not in parsed_expl or len(full_body) > len(parsed_expl[q_num]['explanation']):
            parsed_expl[q_num] = {
                'q_num': q_num,
                'ans_digit': ans_digit,
                'explanation': full_body
            }

print(f"Unique questions parsed now: {len(parsed_expl)} / 307")
missing = [i for i in range(1, 308) if i not in parsed_expl]
print(f"Remaining missing ({len(missing)}): {missing}")

with open('type2_parsed_explanations.json', 'w', encoding='utf-8') as f:
    json.dump(parsed_expl, f, ensure_ascii=False, indent=2)
