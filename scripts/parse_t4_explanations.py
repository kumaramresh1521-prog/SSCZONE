import json
import re

def sort_exp_half(items):
    # Sort by 3 columns: col 0 (<140), col 1 (140-270), col 2 (>=270), then y
    def key_func(it):
        x = it[0][0][0]
        y = it[0][0][1]
        col = 0 if x < 140 else (1 if x < 270 else 2)
        return (col, y)
    return sorted(items, key=key_func)

exp_files = [
    'exp_p58_right.json',
    'exp_p59_left.json', 'exp_p59_right.json',
    'exp_p60_left.json', 'exp_p60_right.json',
    'exp_p61_left.json', 'exp_p61_right.json',
    'exp_p62_left.json', 'exp_p62_right.json',
    'exp_p63_left.json', 'exp_p63_right.json',
    'exp_p64_left.json', 'exp_p64_right.json',
    'exp_p65_left.json', 'exp_p65_right.json',
    'exp_p66_left.json', 'exp_p66_right.json',
    'exp_p67_left.json', 'exp_p67_right.json',
    'exp_p68_left.json', 'exp_p68_right.json',
    'exp_p69_left.json'
]

all_exp_lines = []
for fname in exp_files:
    path = f'scripts/pdf_samples/t4_robust/{fname}'
    with open(path, 'r', encoding='utf-8') as f:
        it = json.load(f)
        if fname == 'exp_p58_right.json':
            it = [x for x in it if x[0][0][1] >= 410]
        # Sort each half
        sorted_it = sort_exp_half(it)
        all_exp_lines.extend(sorted_it)

print(f"Total explanation OCR boxes loaded: {len(all_exp_lines)}")

# Group into questions
opt_map = {1: 'A', 2: 'B', 3: 'C', 4: 'D'}
explanations = {}
cur_q = None
cur_ans = None
cur_tokens = []

for b, t, s in all_exp_lines:
    t_clean = t.strip()
    # Skip headers or telegram watermarks
    if any(k in t_clean.upper() for k in ['TELEGRAM', '@APNA', 'ANALOGY', 'TYPE-IV', 'EXPLANATION', 'HINTS', 'K5279']):
        continue
    
    # Check if starts a new explanation: e.g. "1. (1)", "2.(2)", "254. (2)", "1 . (1)", "1 (1)"
    m = re.match(r'^([1-9]\d{0,2})\s*[\.\,\)]\s*\(?([1-4])\)?(.*)', t_clean)
    if m:
        q_num = int(m.group(1))
        # Ensure it's a valid question number
        if 1 <= q_num <= 254:
            if cur_q is not None and cur_q not in explanations:
                explanations[cur_q] = {
                    'ans': cur_ans,
                    'text': " ".join(cur_tokens).strip()
                }
            cur_q = q_num
            cur_ans = opt_map.get(int(m.group(2)), '')
            rest = m.group(3).strip()
            cur_tokens = [f"({m.group(2)}) {rest}" if rest else f"({m.group(2)})"]
            continue
            
    if cur_q is not None:
        cur_tokens.append(t_clean)

if cur_q is not None and cur_q not in explanations:
    explanations[cur_q] = {
        'ans': cur_ans,
        'text': " ".join(cur_tokens).strip()
    }

print(f"Parsed explanations for {len(explanations)} / 254 questions!")
missing_exp = [i for i in range(1, 255) if i not in explanations]
print(f"Missing explanation numbers: {missing_exp}")

with open('type4_explanations_parsed.json', 'w', encoding='utf-8') as f:
    json.dump(explanations, f, ensure_ascii=False, indent=2)

print("Saved type4_explanations_parsed.json")
