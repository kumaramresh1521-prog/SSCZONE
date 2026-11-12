import json
import os
import re

with open('scripts/pdf_samples/t4_answers_visual_verified.json', 'r', encoding='utf-8') as f:
    ans_tab = {int(k): v for k, v in json.load(f).items()}

# Re-OCR or inspect t4_robust/exp_*.json properly (fixing x splits per page!)
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

# Find all explicit 'QN. (OPT)' across each file
exp_keys = {}
exp_blocks = {}
all_items = []
for fname in exp_files:
    path = f'scripts/pdf_samples/t4_robust/{fname}'
    with open(path, 'r', encoding='utf-8') as f:
        its = json.load(f)
    # Cluster x roughly into 3 columns within this half-page
    xs = sorted(b[0][0][0] for b in its)
    if fname == 'exp_p58_right.json':
        # Find where Type-IV starts on p58_right (has "TYPE-IV" header)
        pass
    # Find min/max x
    x_min = min(xs) if xs else 0
    x_max = max(xs) if xs else 400
    w = (x_max - x_min) / 3.0 if x_max > x_min else 130
    def col_key(b):
        x0 = b[0][0][0]
        y0 = b[0][0][1]
        # Dynamic 3-col split around thirds
        c = 0 if x0 < x_min + 125 else (1 if x0 < x_min + 255 else 2)
        return (c, y0)
    sorted_its = sorted(its, key=col_key)
    for b in sorted_its:
        all_items.append((fname, b[0][0][0], b[0][0][1], b[1]))

cur_q = 0
for fname, x0, y0, txt in all_items:
    t = txt.strip()
    m = re.match(r'^(\d{1,3})\s*[\.\,]\s*\(([1-4Il\|])\)\s*(.*)', t)
    if m:
        qn = int(m.group(1))
        opt = m.group(2).replace('I', '1').replace('l', '1').replace('|', '1')
        if 1 <= qn <= 254 and abs(qn - cur_q) <= 15:
            exp_keys[qn] = int(opt)
            cur_q = qn
        elif fname != 'exp_p58_right.json' and 1 <= qn <= 254:
            exp_keys[qn] = int(opt)
            cur_q = qn

print(f"Found {len(exp_keys)} explicit Q.(opt) keys in explanations.")
diffs = []
for qn in sorted(exp_keys):
    if exp_keys[qn] != ans_tab.get(qn):
        diffs.append((qn, ans_tab.get(qn), exp_keys[qn]))
print(f"Discrepancies between Visual Answer Table vs Book Explanations ({len(diffs)}):")
for qn, ta, ea in diffs:
    print(f"  Q{qn}: AnsTable={ta} ({'ABCD'[ta-1]})  vs  Expl={ea} ({'ABCD'[ea-1]})")
