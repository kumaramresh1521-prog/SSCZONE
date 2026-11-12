import json
import os
import re
import sys

with open('scripts/pdf_samples/t4_segmented_254.json', 'r', encoding='utf-8') as f:
    seg_qs = json.load(f)

with open('scripts/pdf_samples/t4_parsed_254.json', 'r', encoding='utf-8') as f:
    parsed_qs = json.load(f)

with open('scripts/pdf_samples/t4_answers_visual_verified.json', 'r', encoding='utf-8') as f:
    ans_tab = {int(k): v for k, v in json.load(f).items()}

print("=== 1. SEG_QS Q_NUM -> COL_NAMES CHECK ===")
for q in seg_qs[::10] + seg_qs[165:254:5] + [seg_qs[-1]]:
    cols = sorted(set(l['col_name'] for l in q['lines']))
    p0 = parsed_qs[q['q_num'] - 1]['question_text'][:55].replace('\n', ' ')
    print(f"Q{q['q_num']:3d}: cols={cols} explicit={q['explicit_q']} prompt={p0!r}")

print("\n=== 2. EXTRACT ALL EXPLANATIONS CLEANLY ===")
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

def find_3col_splits(items):
    # items are [[x0,y0], ...]
    clean = []
    for b in items:
        xs = [p[0] for p in b[0]]
        ys = [p[1] for p in b[0]]
        x0, x1 = min(xs), max(xs)
        ym = (min(ys) + max(ys)) / 2
        if 35 <= ym <= 570 and (x1 - x0) < 200:
            clean.append((x0, x1, ym, b[1]))
    if not clean:
        return (135, 270)
    gx_min = min(c[0] for c in clean)
    gx_max = max(c[1] for c in clean)
    span = gx_max - gx_min
    def best_cut(lo, hi):
        best = None
        for x in range(int(lo), int(hi) + 1):
            cross = sum(1 for c in clean if c[0] < x - 1 and c[1] > x + 1)
            md = min((min(abs(x - c[0]), abs(x - c[1])) for c in clean), default=99)
            sc = cross * 1000 - md
            if best is None or sc < best[0]:
                best = (sc, x)
        return best[1]
    s1 = best_cut(gx_min + span * 0.25, gx_min + span * 0.42)
    s2 = best_cut(gx_min + span * 0.58, gx_min + span * 0.76)
    return (s1, s2)

all_lines = []
for fname in exp_files:
    path = f'scripts/pdf_samples/t4_robust/{fname}'
    with open(path, 'r', encoding='utf-8') as f:
        its = json.load(f)
    s1, s2 = find_3col_splits(its)
    cols = [[], [], []]
    for b in its:
        xs = [p[0] for p in b[0]]
        ys = [p[1] for p in b[0]]
        xm = (min(xs) + max(xs)) / 2
        ym = (min(ys) + max(ys)) / 2
        if ym < 25 or ym > 580:
            continue
        c = 0 if xm < s1 else (1 if xm < s2 else 2)
        cols[c].append((ym, min(xs), b[1]))
    for ci in range(3):
        cols[ci].sort(key=lambda z: (round(z[0] / 3), z[1]))
        started = (fname != 'exp_p58_right.json')
        for ym, x0, txt in cols[ci]:
            t = txt.strip()
            if fname == 'exp_p58_right.json':
                if 'TYPE-IV' in t.upper() or re.match(r'^1\s*[\.\,]\s*\(3\)', t):
                    started = True
                    if 'TYPE-IV' in t.upper():
                        continue
                if not started:
                    continue
            if 'TYPE-V' in t.upper() or 'EXPLANATION' in t.upper() or '@APNA' in t.upper() or 'TELEGRAM' in t.upper() or 'K5279' in t.upper() or 'SIMILARITY' in t.upper():
                if 'TYPE-V' in t.upper() and fname == 'exp_p69_left.json':
                    # stop Type-IV at TYPE-V header
                    started = False
                    break
                continue
            all_lines.append((fname, ci, ym, t))

# Reconstruct monotonic explanations 1..254
exps = {}
cur_q = 0
cur_ans = None
cur_text = []

def flush():
    global cur_q, cur_ans, cur_text
    if 1 <= cur_q <= 254:
        if cur_q not in exps:
            exps[cur_q] = {'ans': cur_ans, 'text': ' '.join(cur_text).strip()}

for fname, ci, ym, t in all_lines:
    # Check Q start: "123. (2) ..." or "123.(2)" or "123 (2)" or "123, (2)"
    m = re.match(r'^(\d{1,3})\s*[\.\,\):]?\s*\(([1-4Il\|])\)\s*(.*)', t)
    if m:
        qn = int(m.group(1))
        opt = int(m.group(2).replace('I', '1').replace('l', '1').replace('|', '1'))
        if 1 <= qn <= 254 and (cur_q == 0 or (cur_q < qn <= cur_q + 20) or (qn == cur_q + 1)):
            flush()
            cur_q = qn
            cur_ans = opt
            rest = m.group(3).strip()
            cur_text = [rest] if rest else []
            continue
    # Also handle missing dot/paren OCR like "118.4)" or "128.(2"
    m2 = re.match(r'^(\d{1,3})\s*[\.\,]\s*([1-4])\)\s*(.*)', t)
    if m2:
        qn = int(m2.group(1))
        opt = int(m2.group(2))
        if 1 <= qn <= 254 and (cur_q < qn <= cur_q + 20):
            flush()
            cur_q = qn
            cur_ans = opt
            rest = m2.group(3).strip()
            cur_text = [rest] if rest else []
            continue
    if cur_q > 0:
        cur_text.append(t)

flush()

with open('scripts/pdf_samples/t4_explanations_all.json', 'w', encoding='utf-8') as f:
    json.dump(exps, f, ensure_ascii=False, indent=2)

missing = [i for i in range(1, 255) if i not in exps]
print(f"Extracted {len(exps)}/254 explanations! Missing ({len(missing)}): {missing}")

print("\n=== 3. DISCREPANCIES BETWEEN ANSTABLE AND BOOK EXPLANATIONS ===")
diffs = []
for qn in range(1, 255):
    if qn in exps:
        a_tab = ans_tab[qn]
        a_exp = exps[qn]['ans']
        if a_tab != a_exp:
            diffs.append(qn)
            p = parsed_qs[qn - 1]
            print(f"\nQ{qn}: AnsTable={a_tab} vs Expl={a_exp}")
            print(f"  Prompt: {p['question_text']}")
            print(f"  Opts  : {p['options']}")
            print(f"  Expl  : {exps[qn]['text']}")

print(f"\nTotal diffs: {len(diffs)} -> {diffs}")
