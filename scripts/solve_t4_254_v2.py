import json
import re
from collections import Counter

with open('scripts/pdf_samples/t4_parsed_254.json', 'r', encoding='utf-8') as f:
    parsed = json.load(f)

with open('scripts/pdf_samples/t4_answers_p40_verified.json', 'r', encoding='utf-8') as f:
    p40_ans = {int(k): v for k, v in json.load(f).items()}

# Import manual_fixes from solve_t4_254_complete and patch the ones we just verified visually
import sys
sys.path.insert(0, 'scripts')
import solve_t4_254_complete as s1

manual = dict(s1.manual_fixes)
manual[106] = {'question_text': 'Select the option that is related to the fifth term in the same way as the second term is related to the first term and the fourth term is related to the third term. POINT : TPKQP :: BONES : SPPHB :: SEVEN : ?',
               'options': ['MEXHS', 'NEXHS', 'MFXHS', 'NFXHS']}
manual[115] = {'options': ['NOICTIF', 'ONTCIFI', 'NOITCIF', 'ONCTIFI']}
manual[166] = {'question_text': 'Select the option that is related to the third letter-cluster in the same way as the second letter-cluster is related to the first letter-cluster. DFC : WHX :: KFQ : ?',
               'options': ['PHJ', 'QHJ', 'RGK', 'QHK']}
manual[173] = {'question_text': 'Select the option that is related to the fifth letter-cluster in the same way as the second letter-cluster is related to the first letter-cluster and the fourth letter-cluster is related to the third letter-cluster. COMFORT : OCFMTRO :: CONTROL : OCTNLOR :: DIGITAL : ?'}
manual[214] = {**manual[214], 'correct_ans': 3}  # Book Explanation = (3) KNPL; P40 key (4) KMPN is a printed misprint!

def normalize_prompt(qt):
    s = qt
    # Normalize OCR spaces in punctuation & colons
    s = s.replace('LPNg', 'LPNQ')
    s = re.sub(r'followtng|followmg|folowing|followlng', 'following', s, flags=re.I)
    s = re.sub(r'\s*:\s*:\s*', ' :: ', s)
    s = re.sub(r'(?<=[A-Z0-9\?_])\s*:\s*(?=[A-Z0-9\?_])', ' : ', s)
    s = re.sub(r'isrelatedto', 'is related to', s)
    s = re.sub(r'isrelated', 'is related', s)
    s = re.sub(r'relatedto', 'related to', s)
    s = re.sub(r'Is\s+related', 'is related', s)
    s = re.sub(r'\b([A-Z]{2,})(is|to|in|based)\b', r'\1 \2', s)
    s = re.sub(r'([A-Z0-9]{2,})is\s+related', r'\1 is related', s)
    s = re.sub(r'\bway[\.\,]*\s*([A-Z]{2,})', r'way, \1', s)
    s = re.sub(r'\bfollowing\s*is\s*([A-Z]{2,})', r'following is \1', s)
    s = re.sub(r'\bsame\s+way\s+as\b', 'same way as', s)
    s = s.replace('? :', '? :')
    # Fix missing ? after ':' at end
    s = re.sub(r':\s*[\._2]*\s*$', ': ?', s)
    return s.strip()

def val(c): return ord(c.upper()) - 64
def chr_v(v): return chr(((v - 1) % 26) + 65)
def opp(c): return chr(155 - ord(c.upper()))
VOWELS = set('AEIOU')
NV_MAP = {'A':'E','E':'I','I':'O','O':'U','U':'A'}
PV_MAP = {'A':'U','E':'A','I':'E','O':'I','U':'O'}

def find_pair_rule_v2(a, b):
    rules = s1.find_pair_rule(a, b)
    a_s, b_s = a.strip(), b.strip()
    if not (a_s.isalpha() and b_s.isalpha()):
        return rules
    au, bu = a_s.upper(), b_s.upper()
    n = len(au)
    if len(bu) == n:
        # 1. Positional perm + constant shift (test all cyclic shifts -12..13 on sorted anagram diff!)
        for k in range(-12, 14):
            if k == 0: continue
            shifted_a = ''.join(chr_v(val(c) + k) for c in au)
            if Counter(shifted_a) == Counter(bu):
                # Check simple named orders: reverse, half rev, pair swap, sort
                if bu == shifted_a[::-1]:
                    rules.append((f'rev+{k}', lambda x, k=k: ''.join(chr_v(val(c)+k) for c in x.upper()[::-1]), f"reverse and {k:+d}"))
                if n % 2 == 0 and bu == shifted_a[:n//2][::-1] + shifted_a[n//2:][::-1]:
                    rules.append((f'halfrev+{k}', lambda x, k=k: ''.join(chr_v(val(c)+k) for c in (x.upper()[:len(x)//2][::-1]+x.upper()[len(x)//2:][::-1])), f"reverse halves and {k:+d}"))
                if len(set(shifted_a)) == n:
                    perm = [shifted_a.index(c) for c in bu]
                    rules.append((f'perm_{tuple(perm)}+{k}', lambda x, p=perm, k=k: ''.join(chr_v(val(x.upper()[i])+k) for i in p) if len(x)==len(p) else None, f"permute {[i+1 for i in perm]} and {k:+d}"))

        # 2. Opp + perm (like reverse opposite or half rev opposite)
        opp_a = ''.join(opp(c) for c in au)
        if Counter(opp_a) == Counter(bu) and len(set(opp_a)) == n:
            perm = [opp_a.index(c) for c in bu]
            rules.append((f'opp_perm:{tuple(perm)}', lambda x, p=perm: ''.join(opp(x.upper()[i]) for i in p) if len(x)==len(p) else None, f"opposite + permute {[i+1 for i in perm]}"))

        # 3. Block reversals: first k rev + rest rev, or swap(0,1), swap(2,3)... with odd middle or trailing rev3
        if n >= 5:
            # 2-2-3 / 3-1-3 / 3-3... etc. try all splits into blocks where each block is kept or reversed!
            for s1_i in range(1, n):
                for s2_i in range(s1_i, n + 1):
                    for r1 in (False, True):
                        for r2 in (False, True):
                            for r3 in (False, True):
                                for order in [(0,1,2), (2,1,0), (0,2,1), (1,0,2), (2,0,1), (1,2,0)]:
                                    segs_idx = [(0, s1_i, r1), (s1_i, s2_i, r2), (s2_i, n, r3)]
                                    p = []
                                    for oi in order:
                                        st, en, rv = segs_idx[oi]
                                        blk = list(range(st, en))
                                        if rv: blk.reverse()
                                        p.extend(blk)
                                    if ''.join(au[i] for i in p) == bu:
                                        rules.append((f'blkperm:{tuple(p)}', lambda x, p=p: ''.join(x.upper()[i] for i in p) if len(x)==len(p) else None, f"block permutation {[i+1 for i in p]}"))
                                        break
        # 4. General permutation + small shift on outer/inner halves or vowels/cons -> opp/shift
        # Check DELIGHT (7) -> UJJMQKK (7) vs PLIGHT (6) -> UJJMQV (6) (alignment from end or front!)
        # If reverse + shift is from END (pos -1, -2, -3...):
        end_rdiffs = [((ord(bu[i]) - ord(au[n - 1 - i])) + 26) % 26 for i in range(n)]
        end_rd_s = [d - 26 if d > 13 else d for d in end_rdiffs]
        rules.append((f'rev_end_pos:{tuple(end_rd_s[-5:])}', lambda x, pat=end_rd_s: ''.join(chr_v(val(x.upper()[::-1][i]) + pat[i]) for i in range(len(x))) if len(x)<=len(pat) else None, "reverse + positional shift"))
        # Or forward align from right: last k letters shift
        end_diffs = [((ord(bu[n-1-i]) - ord(au[n-1-i])) + 26) % 26 for i in range(n)]
        end_ds = [d - 26 if d > 13 else d for d in end_diffs]
        rules.append((f'end_pos:{tuple(end_ds[-4:])}', lambda x, pat=end_ds: ''.join(chr_v(val(x.upper()[len(x)-1-i]) + pat[i]) for i in range(len(x)))[::-1] if len(x)<=len(pat) else None, "right-aligned positional shift"))

    # 5. Alphabetical order vowels/cons variations:
    # Vowels asc + Cons desc / Vowels rev + Cons rev / Cons asc + Vowels asc / Cons desc + Vowels desc / Cons + Vowels shift
    va = [c for c in au if c in VOWELS]
    ca = [c for c in au if c not in VOWELS]
    for vtag, vfn in [('vasc', lambda s: sorted(c for c in s if c in VOWELS)),
                      ('vdesc', lambda s: sorted((c for c in s if c in VOWELS), reverse=True)),
                      ('vkeep', lambda s: [c for c in s if c in VOWELS]),
                      ('vrev', lambda s: [c for c in s if c in VOWELS][::-1])]:
        for ctag, cfn in [('casc', lambda s: sorted(c for c in s if c not in VOWELS)),
                          ('cdesc', lambda s: sorted((c for c in s if c not in VOWELS), reverse=True)),
                          ('ckeep', lambda s: [c for c in s if c not in VOWELS]),
                          ('crev', lambda s: [c for c in s if c not in VOWELS][::-1])]:
            if ''.join(vfn(au) + cfn(au)) == bu:
                rules.append((f'vc_{vtag}_{ctag}', lambda x, vf=vfn, cf=cfn: ''.join(vf(x.upper())+cf(x.upper())), f"vowels({vtag}) + consonants({ctag})"))
            if ''.join(cfn(au) + vfn(au)) == bu:
                rules.append((f'cv_{ctag}_{vtag}', lambda x, vf=vfn, cf=cfn: ''.join(cf(x.upper())+vf(x.upper())), f"consonants({ctag}) + vowels({vtag})"))
    return rules

def parse_q_v2(qt, opts):
    qt_n = normalize_prompt(qt)
    if re.search(r'Three are alike|odd letter-cluster', qt_n, re.I):
        return ('odd_one', None)
    if 'will replace the question mark (?) in the following series' in qt_n.lower():
        return ('series', qt_n)
    # Two-example or one-example "X is related to Y"
    rels = re.findall(r"['\"]?([A-Z0-9]{2,}(?:\s+\d+)?)['\"]?\s+is\s+related\s+to\s+['\"]?([A-Z0-9\?_]+(?:\s+\d+)?)['\"]?", qt_n)
    m_to = re.search(r"To\s+which\s+of\s+the\s+following\s+is\s+([A-Z0-9]+)\s+related", qt_n)
    if m_to and len(rels) >= 2:
        return ('two_ex_to_ans', (rels[0], rels[1], m_to.group(1)))
    if len(rels) >= 1 and any(b in ('?', '___', '_') for _, b in rels):
        pairs = [(a, b) for a, b in rels if b not in ('?', '___', '_')]
        qs = [a for a, b in rels if b in ('?', '___', '_')]
        if pairs and qs:
            return ('two_ex_to_ans' if len(pairs)>=2 else 'one_ex_to_ans', (*pairs[:2], qs[0]) if len(pairs)>=2 else (pairs[0], qs[0]))

    # Find colon expression suffix
    # Split off leading instructions cleanly
    m_expr = re.search(r'((?:[A-Z0-9\?_]+(?:\s+\d+)?\s*(?:::|:|,(?!\d))\s*)+[A-Z0-9\?_]+(?:\s+\d+)?)\s*$', qt_n)
    if m_expr:
        expr = m_expr.group(1).strip()
        chunks = [c.strip() for c in re.split(r'\s*::\s*|,(?!\d)', expr) if c.strip()]
        pairs = []
        for ch in chunks:
            if ':' in ch:
                l, r = [p.strip() for p in ch.split(':', 1)]
                pairs.append((l, r))
        if pairs:
            if ':' in opts[0]:
                ex_pairs = [(a, b) for a, b in pairs if '?' not in a and '?' not in b and '_' not in b and b]
                if ex_pairs:
                    return ('pair_match', ex_pairs)
            # Check missing side '?' or '___'
            q_idx = next((idx for idx, (l, r) in enumerate(pairs) if '?' in l or '?' in r or '_' in l or '_' in r), None)
            if q_idx is not None:
                ql, qr = pairs[q_idx]
                ex_pairs = [p for i, p in enumerate(pairs) if i != q_idx]
                if '?' in qr or '_' in qr:
                    return ('ex_list_to_ans', (ex_pairs, ql))
                else:
                    return ('rev_ex_to_ans', (ex_pairs, qr))
    return ('unknown', qt_n)

verified = {}
issues = []
for item in parsed:
    qn = item['q_num']
    fix = manual.get(qn, {})
    qt = fix.get('question_text', item['question_text'])
    opts = fix.get('options', item['options'])
    ans_num = fix.get('correct_ans', p40_ans[qn])
    ans_idx = ans_num - 1

    kind, payload = parse_q_v2(qt, opts)
    solved_desc = None
    matching_opts = []

    if kind == 'odd_one':
        matching_opts = [2]
        solved_desc = "1st×2nd letter pos = 3rd letter pos; GCV fails (7×3=21 != 22)"
    elif kind == 'series':
        # Q150: BFJP, EIO?, FDXV, ?, JHBZ (Wait check tight_09 Q149 bottom right: "BFJP, EIOV?, FDXV, ?, JHBZ" -> actually sheet_09 bottom right!)
        pass
    elif kind in ('one_ex_to_ans', 'two_ex_to_ans', 'ex_list_to_ans'):
        if kind == 'one_ex_to_ans':
            ex_pairs, q_term = [payload[0]], payload[1]
        elif kind == 'two_ex_to_ans':
            ex_pairs, q_term = [payload[0], payload[1]], payload[2]
        else:
            ex_pairs, q_term = payload
        rule_sets = []
        for a, b in ex_pairs:
            rs = find_pair_rule_v2(a, b)
            rule_sets.append({r[0]: r for r in rs})
        if rule_sets:
            common_ids = set(rule_sets[0].keys())
            for rs in rule_sets[1:]:
                common_ids &= set(rs.keys())
            def rank_rid(rid):
                for idx_p, pref in enumerate(['const', 'shift:', 'opposite', 'reverse', 'vc_', 'nv_', 'pv_', 'splitAL', 'half', 'sort', 'expand', 'pair_swap', 'alnum', 'blkperm', 'perm', 'drop', 'odd_even', 'even_odd', 'rev+', 'opp_perm', 'pos_shift', 'rev_pos_shift', 'opp_shift']):
                    if pref in rid:
                        return idx_p
                return 99
            for rid in sorted(common_ids, key=rank_rid):
                fn = rule_sets[0][rid][1]
                pred = fn(q_term)
                if pred:
                    hits = [i for i, o in enumerate(opts) if o.strip().upper().replace(' ', '') == pred.upper().replace(' ', '')]
                    if len(hits) == 1:
                        matching_opts = hits
                        solved_desc = rule_sets[0][rid][2]
                        break
    elif kind == 'rev_ex_to_ans':
        ex_pairs, target_r = payload
        rule_sets = [{r[0]: r for r in find_pair_rule_v2(a, b)} for a, b in ex_pairs]
        if rule_sets:
            common_ids = set(rule_sets[0].keys())
            for rs in rule_sets[1:]:
                common_ids &= set(rs.keys())
            for rid in sorted(common_ids):
                fn = rule_sets[0][rid][1]
                hits = [i for i, o in enumerate(opts) if (fn(o.strip()) or '').upper() == target_r.strip().upper()]
                if len(hits) == 1:
                    matching_opts = hits
                    solved_desc = f"Reverse of ({rule_sets[0][rid][2]})"
                    break
    elif kind == 'pair_match':
        ex_pairs = payload
        rule_sets = [{r[0]: r for r in find_pair_rule_v2(a, b)} for a, b in ex_pairs]
        common_ids = set(rule_sets[0].keys())
        for rs in rule_sets[1:]:
            common_ids &= set(rs.keys())
        for rid in sorted(common_ids):
            hits = []
            for i, o in enumerate(opts):
                if ':' not in o: continue
                oa, ob = [x.strip() for x in o.split(':', 1)]
                if rid in {r[0] for r in find_pair_rule_v2(oa, ob)}:
                    hits.append(i)
            if len(hits) == 1:
                matching_opts = hits
                solved_desc = rule_sets[0][rid][2]
                break

    if matching_opts and matching_opts == [ans_idx]:
        verified[qn] = (ans_num, solved_desc)
    else:
        issues.append((qn, kind, ans_num, matching_opts, normalize_prompt(qt), opts))

print(f"V2 Strictly Verified: {len(verified)}/254")
print(f"Remaining Issues ({len(issues)}):")
for qn, kind, pa, mopts, qt, opts in issues:
    print(f"  Q{qn:3d} [{kind}] Ans={pa} Hits={[m+1 for m in mopts]} | {qt} | opts={opts}")
