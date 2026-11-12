import json
import re

lines = json.load(open('type2_expl_lines_cache.json', encoding='utf-8'))[70:2258]
full_text = '\n' + '\n'.join(lines)

targets = [10, 13, 21, 42, 106, 140, 142, 176, 188, 196, 276, 288, 289]

for t in targets:
    print(f"\n==================== SEARCH FOR Q{t} in EXPLANATIONS ====================")
    # Search for pattern: t. or t(
    pattern = re.compile(rf'(?:^|\n)\s*(?:[ilI]?{t}|io)\s*[\.\,\、\)]?\s*\(?([1-4])\)?(?:\s*(.*))?')
    m = pattern.search(full_text)
    if m:
        start = max(0, m.start() - 20)
        end = min(len(full_text), m.end() + 200)
        print(f"Matched at {m.start()}: group1={m.group(1)}, group2={m.group(2)}")
        print("Context:")
        print(full_text[start:end])
    else:
        print(f"Regex match failed. Searching for string '{t}.' or '{t}('")
        for i, l in enumerate(lines):
            if re.search(rf'\b{t}\s*[\.\(]', l):
                print(f"Line {i}: {l}")
                ctx = "\n".join(lines[max(0, i-2):min(len(lines), i+8)])
                print("Context:\n" + ctx)
                break
