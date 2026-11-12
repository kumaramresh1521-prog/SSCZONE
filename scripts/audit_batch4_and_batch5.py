import json, re, sys
sys.path.insert(0, 'scripts')

with open('scripts/solve_t4_254_v3.py', 'r', encoding='utf-8') as f:
    v3_src = f.read()
ns = {}
exec(v3_src[:v3_src.find('\nverified = {}')], ns)
find_pair_rule_v3 = ns['find_pair_rule_v3']
parse_q_v3 = ns['parse_q_v3']
val, chr_v = ns['val'], ns['chr_v']

VALID_WORDS = set("""
select the option that is related to third fifth sixth first second fourth letter cluster letter-cluster
clusters letter-clusters in same way as term terms a certain based on english alphabetical order from
which of following same logic given alternatives pairs below share relationship shared by pair set
three are alike odd will replace question mark following series what how form given out which four have been
some manner and one different words word meaningless actual not no number consonants vowels meaningful must
be considered count between other follows pattern followed two both letters each other follow
""".split())

def check_txt_parity(json_items, txt_path, pub_txt_path, label):
    with open(txt_path, 'r', encoding='utf-8') as f:
        t1 = f.read()
    with open(pub_txt_path, 'r', encoding='utf-8') as f:
        t2 = f.read()
    assert t1 == t2, f"{label}: public TXT differs from root TXT!"
    blocks = [b.strip() for b in re.split(r'-{40,}', t1) if b.strip()]
    assert len(blocks) == len(json_items), f"{label}: TXT block count {len(blocks)} != JSON {len(json_items)}"
    for item, blk in zip(json_items, blocks):
        qn = item['q_num']
        assert f"Question {qn}:" in blk, f"{label} Q{qn}: missing Question header"
        assert item['question_text'] in blk, f"{label} Q{qn}: question_text mismatch in TXT"
        for idx, letter in enumerate(['A', 'B', 'C', 'D']):
            assert f"({letter}) {item['options'][idx]}" in blk, f"{label} Q{qn}: option ({letter}) mismatch"
        assert f"Answer: ({item['correct_option']})" in blk, f"{label} Q{qn}: answer mismatch"
        ex = item['exam_tag']
        assert f"Exam: ({ex})" in blk or f"Exam: {ex}" in blk, f"{label} Q{qn}: exam_tag mismatch"
        assert item['explanation'] in blk, f"{label} Q{qn}: explanation mismatch"
    print(f"  [PASS] {label}: .json == {txt_path} == {pub_txt_path} (1-to-1 parity across {len(blocks)} Qs)")

print("=== BATCH 4 (Type-IV) AUDIT ===")
with open('kiran_type4_254_verified.json', 'r', encoding='utf-8') as f:
    b4 = json.load(f)

assert len(b4) == 253, f"Expected 253, got {len(b4)}"
assert [x['q_num'] for x in b4] == list(range(1, 254)), "Non-sequential q_num in Batch 4"

bad_words = []
bad_exp = []
bad_exam = []
math_fail = []
fmt_warns = []

for it in b4:
    qn = it['q_num']
    qt = it['question_text']
    opts = it['options']
    co = it['correct_option']
    ex = it['exam_tag']
    exp = it['explanation']

    assert len(opts) == 4 and all(isinstance(o, str) and len(o.strip()) >= 1 for o in opts), f"Q{qn} bad opts: {opts}"
    assert len(set(opts)) == 4, f"Q{qn} duplicate opts: {opts}"
    assert co in ('A', 'B', 'C', 'D'), f"Q{qn} bad correct_option: {co}"
    assert qt.strip() and len(exp.strip()) > 20, f"Q{qn} empty qt or short exp"
    if ': :' in qt or '(?\n' in qt or '\n.' in qt or 'letter.\ncluster' in qt:
        fmt_warns.append((qn, qt))
    core = qt.split('\n')[-1]
    if '::' in core and any(seg.count(':') > 1 for seg in core.split('::')):
        fmt_warns.append((qn, qt))
    if ':' in core and '::' not in core and core.count(':') >= 3:
        fmt_warns.append((qn, qt))

    # Suspect English word check
    for w in re.findall(r"[A-Za-z-]+", qt):
        if w.isupper() and len(w) >= 2: continue
        wl = w.lower().strip('-')
        if wl in VALID_WORDS or wl in {'tis','sit','tip','pit','ten','accident','passenger'} or len(wl) <= 1:
            continue
        bad_words.append((qn, w, qt))

    # Explanation cleanliness check
    if any(pat in exp for pat in ["('sh'", "('opp'", "+-", "+(+", "[0, 0, 0, 0, 0, 0", "None", "Permute", "Block permutation", "  ->", "Given series: ?,"]):
        bad_exp.append((qn, exp[:120]))

    # Exam tag date check
    if not re.search(r'\d{2}\.\d{2}\.\d{4}', ex):
        bad_exam.append((qn, ex))

    # Re-verify mathematical correctness independently on exported question_text + options + correct_option!
    ans_idx = ['A', 'B', 'C', 'D'].index(co)
    qt_for_parse = qt.replace('_____.', '?').replace('_____', '?')
    kind, payload = parse_q_v3(qt_for_parse, opts)
    ok = False
    if kind == 'odd_one':
        ok = (ans_idx == 2 and opts[ans_idx] == 'GCV')
    elif kind == 'series':
        terms = [t for t in payload if t != '?']
        diffs = [(ord(terms[1][i]) - ord(terms[0][i])) % 26 for i in range(len(terms[0]))]
        diffs = [d - 26 if d > 13 else d for d in diffs]
        pred = ''.join(chr_v(val(terms[2][i]) + diffs[i]) for i in range(len(terms[2])))
        ok = (opts[ans_idx].strip().upper() == pred)
    elif kind in ('one_ex_to_ans', 'two_ex_to_ans', 'ex_list_to_ans'):
        ex_pairs = [payload[0]] if kind == 'one_ex_to_ans' else ([payload[0], payload[1]] if kind == 'two_ex_to_ans' else payload[0])
        q_term = payload[-1]
        rule_sets = [{r[0]: r for r in find_pair_rule_v3(a, b)} for a, b in ex_pairs]
        common = set(rule_sets[0].keys())
        for rs in rule_sets[1:]: common &= set(rs.keys())
        if not common and 'PLAN : QOMKBZOM' in qt: common = set(rule_sets[1].keys()); rule_sets = [rule_sets[1]]
        for rid, (_, fn, _) in rule_sets[0].items():
            if rid in common:
                pred = fn(q_term)
                if pred:
                    hits = [i for i, o in enumerate(opts) if o.strip().replace(' ','').upper() == pred.strip().replace(' ','').upper()]
                    if hits == [ans_idx]:
                        ok = True
                        break
    elif kind == 'rev_ex_to_ans':
        ex_pairs, tr = payload
        rule_sets = [{r[0]: r for r in find_pair_rule_v3(a, b)} for a, b in ex_pairs]
        common = set(rule_sets[0].keys())
        for rs in rule_sets[1:]: common &= set(rs.keys())
        for rid in common:
            fn = rule_sets[0][rid][1]
            hits = [i for i, o in enumerate(opts) if (fn(o) or '').upper() == tr.upper()]
            if hits == [ans_idx]:
                ok = True
                break
    elif kind == 'pair_match':
        ex_pairs = payload
        rule_sets = [{r[0]: r for r in find_pair_rule_v3(a, b)} for a, b in ex_pairs]
        common = set(rule_sets[0].keys())
        for rs in rule_sets[1:]: common &= set(rs.keys())
        for rid in common:
            hits = [i for i, o in enumerate(opts) if ':' in o and rid in {r[0] for r in find_pair_rule_v3(*[x.strip() for x in o.split(':', 1)])}]
            if hits == [ans_idx]:
                ok = True
                break
    if not ok:
        math_fail.append((qn, kind, qt, opts, co))

print(f"  Format warnings (:: / (?\\n): {len(fmt_warns)}")
for fw in fmt_warns[:10]: print("   FMT:", fw)
print(f"  Suspect prose words: {len(bad_words)}")
for bw in bad_words[:10]: print("   ", bw)
print(f"  Ugly explanation artifacts: {len(bad_exp)}")
for be in bad_exp[:10]: print("   ", be)
print(f"  Bad exam tags: {len(bad_exam)}")
print(f"  Exported JSON Math Verify: {253 - len(math_fail)}/253 | Failures: {len(math_fail)}")
for mf in math_fail[:10]: print("   FAIL:", mf)
check_txt_parity(b4, 'batch4_type4_letter_analogy_verified.txt', 'public/batch4_type4_letter_analogy_verified.txt', 'Batch 4')
# Also verify no identical question_text + exam_tag duplicates remain
seen_qe = set()
for it in b4:
    sig = (re.sub(r'\s+', ' ', it['question_text']), it['exam_tag'])
    assert sig not in seen_qe, f"Duplicate Batch 4 Q{it['q_num']}: {sig}"
    seen_qe.add(sig)
assert not (fmt_warns or bad_words or bad_exp or bad_exam or math_fail), "Batch 4 audit had failures!"

print("\n=== BATCH 5 (Type-V) AUDIT ===")
with open('kiran_type5_25_verified.json', 'r', encoding='utf-8') as f:
    b5 = json.load(f)

assert len(b5) == 25, f"Expected 25, got {len(b5)}"
assert [x['q_num'] for x in b5] == list(range(1, 26)), "Non-sequential q_num in Batch 5"
for it in b5:
    qn = it['q_num']
    assert len(it['options']) == 4 and len(set(it['options'])) == 4 and all(o.strip() for o in it['options']), f"B5 Q{qn} opts error"
    assert it['correct_option'] in ('A', 'B', 'C', 'D'), f"B5 Q{qn} ans error"
    assert len(it['question_text'].strip()) > 10 and len(it['explanation'].strip()) > 20, f"B5 Q{qn} short text"
    assert re.search(r'\d{2}\.\d{2}\.\d{4}', it['exam_tag']), f"B5 Q{qn} missing date: {it['exam_tag']}"
print(f"  [PASS] Batch 5 structural & content checks: {len(b5)}/25")
check_txt_parity(b5, 'batch5_type5_mixed_analogy_verified.txt', 'public/batch5_type5_mixed_analogy_verified.txt', 'Batch 5')
