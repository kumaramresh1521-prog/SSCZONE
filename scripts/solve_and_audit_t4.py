import json
import re

with open('scripts/pdf_samples/t4_parsed_254.json', 'r', encoding='utf-8') as f:
    qs = json.load(f)

with open('scripts/pdf_samples/t4_answers_visual_verified.json', 'r', encoding='utf-8') as f:
    ans_map = {int(k): v for k, v in json.load(f).items()}

def opp(c):
    return chr(ord('Z') - (ord(c) - ord('A')))

def signed_shift(a, b):
    d = (ord(b) - ord(a)) % 26
    if d > 13:
        d -= 26
    return d

def shift_vec(s1, s2):
    if len(s1) != len(s2) or not s1.isalpha() or not s2.isalpha():
        return None
    return tuple(signed_shift(a, b) for a, b in zip(s1, s2))

def apply_vec(s, vec):
    if len(s) != len(vec) or not s.isalpha():
        return None
    return "".join(chr(ord('A') + ((ord(c) - ord('A') + d) % 26)) for c, d in zip(s, vec))

def clean_prose_glues(txt):
    s = re.sub(r'^\d+\s*(?=[A-Z])', '', txt)
    s = re.sub(r'(?:following|is|Is|ls|to)(?=[A-Z]{2,})', lambda m: m.group(0) + ' ', s)
    s = re.sub(r'(following)(is|Is|ls)\s*', r'\1 \2 ', s)
    s = re.sub(r'([A-Z0-9g]{2,})(?:ina|in|na|tm|related)\b', r'\1 ', s)
    s = re.sub(r'([A-Z0-9g]{2,})(related)\b', r'\1 \2', s)
    s = re.sub(r'\s+', ' ', s).strip()
    return s

def is_cluster_tok(tok):
    # Exclude lowercase English prose words like 'that', 'the', 'cluster'
    ups = sum(1 for c in tok if c.isupper())
    return ups >= 2 or (len(tok) >= 2 and ups >= 1 and tok not in ('That', 'The', 'Term', 'In', 'Is', 'To'))

def extract_terms_from_prompt(q):
    txt = q['question_text']
    t_norm = re.sub(r'^\d+\s*(?=[A-Z]{2,})', '', txt.strip())
    t_norm = re.sub(r'\s*:\s*:\s*', ' :: ', t_norm)
    t_norm = re.sub(r'(?<!:)\s*:\s*(?!:)', ' : ', t_norm)
    t_norm = re.sub(r'\s+', ' ', t_norm).strip()
    t_norm = re.sub(r':\s*(?:\.?2)?$', ': ?', t_norm)

    # Pattern 1: X : Y :: Z : W :: P : ?
    m_chain = re.search(r'([A-Za-z0-9\'\"]+(?:\s*:\s*[A-Za-z0-9\'\"]+)+\s*(?:::\s*[A-Za-z0-9\'\?\"]+(?:\s*:\s*[A-Za-z0-9\'\?\"]*)*)+)', t_norm)
    if m_chain:
        chain = m_chain.group(1)
        chunks = [c.strip(" '\"") for c in chain.split('::')]
        pairs = []
        for ch in chunks:
            parts = [p.strip(" '\"") for p in ch.split(':')]
            parts = [p if p else '?' for p in parts]
            if len(parts) == 1:
                parts.append('?')
            pairs.append(parts)
        return ('chain', pairs)

    # Pattern 2: Multiple separate "A : B" pairs
    pair_matches = re.findall(r'\b([A-Za-z0-9]{2,12})\s*:\s*([A-Za-z0-9]{2,12})\b', t_norm)
    if len(pair_matches) >= 2:
        return ('multi_pair', pair_matches)

    # Pattern 3: Prose "... <X> is related to <Y> ... <Z> is related to <W> ... <P> related ..."
    up_prose = clean_prose_glues(re.sub(r"[\'\"\u2018\u2019]", " ", t_norm))
    rel_pairs = [
        (a, b) for a, b in re.findall(r'\b([A-Za-z0-9g]{2,12})\s+(?:is|Is|ls|s|are)\s+related\s+to\s+([A-Za-z0-9g]{2,12})\b', up_prose)
        if is_cluster_tok(a) and is_cluster_tok(b)
    ]
    cleaned_pairs = []
    for a, b in rel_pairs:
        if len(b) > 3 and b.endswith('ina'): b = b[:-3]
        elif len(b) > 2 and (b.endswith('na') or b.endswith('tm')): b = b[:-2]
        elif len(b) > 2 and b.endswith('n') and a[:-1].isupper(): b = b[:-1]
        cleaned_pairs.append([a, b])
    cands = (
        re.findall(r'(?:following\s+(?:is|Is|ls|s)|(?:is|Is|ls))\s+([A-Za-z0-9g]{2,12})\s+related', up_prose)
        + re.findall(r'(?:as|way[,.\s]+)\s*([A-Za-z0-9g]{2,12})\s*(?:is|Is|ls|s)?\s*related\s*(?:to)?\s*(?:\?|$)', up_prose)
        + re.findall(r'\b([A-Za-z0-9g]{2,12})\s+related[\s,.]*(?:following|to)?', up_prose)
    )
    target_tok = next((t for t in cands if is_cluster_tok(t)), None)
    if cleaned_pairs and target_tok:
        pairs = cleaned_pairs + [[target_tok, '?']]
        return ('prose_chain', pairs)
    if cleaned_pairs:
        return ('prose_rel', cleaned_pairs)
    return ('unknown', [])

def norm_cluster_for_test(s):
    s1 = s.strip().replace(' ', '')
    s_up = s1.replace('9', 'Q').replace('g', 'Q').upper()
    return s1, s_up

def common_duplicate_perm(sample_pairs):
    """Find a common positional permutation mapping a -> b across all sample pairs (handles duplicate letters)."""
    if not sample_pairs:
        return None
    a0, b0 = sample_pairs[0]
    n = len(a0)
    if any(len(a) != n or len(b) != n or sorted(a) != sorted(b) for a, b in sample_pairs):
        return None
    # Backtrack candidate positions for index idx in b
    def solve_perm(idx, used, cur):
        if idx == n:
            return [list(cur)]
        out = []
        # position candidates in a0 matching b0[idx] AND matching all sample_pairs
        for src in range(n):
            if src in used:
                continue
            if all(a[src] == b[idx] for a, b in sample_pairs):
                used.add(src)
                cur.append(src)
                out.extend(solve_perm(idx + 1, used, cur))
                if len(out) >= 1:
                    return out
                cur.pop()
                used.remove(src)
        return out
    res = solve_perm(0, set(), [])
    return res[0] if res else None

def explain_rule(a, b, all_samples=None):
    if not (a.isalpha() and b.isalpha() and a.isupper() and b.isupper()):
        return []
    rules = []
    if len(a) == len(b):
        n = len(a)
        vec = shift_vec(a, b)
        if len(set(vec)) == 1:
            rules.append((f"shift_const({vec[0]:+d})", lambda x, v=vec: apply_vec(x, v)))
        else:
            rules.append((f"shift_vec({vec})", lambda x, v=vec: apply_vec(x, v)))
        rvec = shift_vec(a[::-1], b)
        if rvec == (0,) * n:
            rules.append(("reverse", lambda x: x[::-1]))
        else:
            rules.append((f"rev_shift({rvec})", lambda x, v=rvec: apply_vec(x[::-1], v)))
        oa = "".join(opp(c) for c in a)
        ovec = shift_vec(oa, b)
        if ovec == (0,) * n:
            rules.append(("opposite", lambda x: "".join(opp(c) for c in x)))
        elif len(set(ovec)) == 1:
            rules.append((f"opp_const({ovec[0]:+d})", lambda x, v=ovec: apply_vec("".join(opp(c) for c in x), v)))
        else:
            rules.append((f"opp_vec({ovec})", lambda x, v=ovec: apply_vec("".join(opp(c) for c in x), v)))
        rovec = shift_vec(oa[::-1], b)
        if rovec == (0,) * n:
            rules.append(("rev_opposite", lambda x: "".join(opp(c) for c in x[::-1])))
        elif rovec is not None and len(set(rovec)) == 1:
            rules.append((f"rev_opp_const({rovec[0]:+d})", lambda x, v=rovec: apply_vec("".join(opp(c) for c in x[::-1]), v)))
        if "".join(sorted(a)) == b:
            rules.append(("sort_asc", lambda x: "".join(sorted(x))))
        if "".join(sorted(a, reverse=True)) == b:
            rules.append(("sort_desc", lambda x: "".join(sorted(x, reverse=True))))
        # Vowels-first / consonants-next sort
        vow = "".join(c for c in a if c in 'AEIOU')
        con = "".join(c for c in a if c not in 'AEIOU')
        if "".join(sorted(vow)) + "".join(sorted(con)) == b:
            rules.append(("vowels_cons_sorted", lambda x: "".join(sorted([c for c in x if c in 'AEIOU'])) + "".join(sorted([c for c in x if c not in 'AEIOU']))))
        if all_samples:
            perm = common_duplicate_perm(all_samples)
            if perm:
                rules.append((f"perm({perm})", lambda x, p=perm: "".join(x[i] for i in p) if len(x) == len(p) else None))
        elif sorted(a) == sorted(b) and len(set(a)) == n:
            perm = [a.index(c) for c in b]
            rules.append((f"perm({perm})", lambda x, p=perm: "".join(x[i] for i in p) if len(x) == len(p) else None))
        if n >= 4:
            ps = "".join(a[i+1] + a[i] if i+1 < n else a[i] for i in range(0, n, 2))
            pvec = shift_vec(ps, b)
            if pvec is not None:
                rules.append((f"pairswap_shift({pvec})", lambda x, v=pvec: apply_vec("".join(x[i+1]+x[i] if i+1<len(x) else x[i] for i in range(0, len(x), 2)), v)))
            mid = n // 2
            hs = a[:mid][::-1] + a[mid:][::-1]
            hvec = shift_vec(hs, b)
            if hvec is not None:
                rules.append((f"halfrev_shift({hvec})", lambda x, m=mid, v=hvec: apply_vec(x[:m][::-1] + x[m:][::-1], v)))
            if n % 2 == 0:
                sw = a[mid:] + a[:mid]
                swvec = shift_vec(sw, b)
                if swvec is not None:
                    rules.append((f"halfswap_shift({swvec})", lambda x, m=mid, v=swvec: apply_vec(x[len(x)-m:] + x[:len(x)-m], v)))
            # Odd/Even reversal + shift (e.g. half+mid or 3-char chunks)
        vowels = set('AEIOU')
        v_shifts = set(signed_shift(x, y) for x, y in zip(a, b) if x in vowels)
        c_shifts = set(signed_shift(x, y) for x, y in zip(a, b) if x not in vowels)
        if len(v_shifts) <= 1 and len(c_shifts) <= 1 and (v_shifts or c_shifts):
            vs = next(iter(v_shifts), 0)
            cs = next(iter(c_shifts), 0)
            rules.append((f"vowel({vs:+d})_cons({cs:+d})", lambda x, vs=vs, cs=cs: "".join(
                chr(ord('A') + (ord(ch) - ord('A') + (vs if ch in 'AEIOU' else cs)) % 26) for ch in x
            )))
    elif len(b) == 2 * len(a):
        ok_nb = all((ord(b[2*i]) - ord(a[i])) % 26 == 25 and (ord(b[2*i+1]) - ord(a[i])) % 26 == 1 for i in range(len(a)))
        if ok_nb:
            rules.append(("expand_-1_+1", lambda x: "".join(
                chr(ord('A') + (ord(c) - ord('A') - 1) % 26) + chr(ord('A') + (ord(c) - ord('A') + 1) % 26) for c in x
            )))
    return rules

def test_question(q):
    qn = q['q_num']
    ans_idx = ans_map[qn] - 1
    opts_raw = q['options']
    kind, data = extract_terms_from_prompt(q)

    if any(not o for o in opts_raw):
        return 'EMPTY_OPT', kind, data, ''

    for mode in ('exact', 'norm_g9'):
        opts = [o.replace(' ', '') for o in opts_raw] if mode == 'exact' else [norm_cluster_for_test(o)[1] for o in opts_raw]
        if mode == 'exact' and any(not re.match(r'^[A-Z:]+$', o) for o in opts):
            continue

        if kind in ('chain', 'prose_chain'):
            pairs = data if mode == 'exact' else [[norm_cluster_for_test(p)[1] if p != '?' else '?' for p in pr] for pr in data]
            sample_pairs = [pr for pr in pairs if len(pr) == 2 and '?' not in pr]
            target_pairs = [pr for pr in pairs if '?' in pr]
            if len(target_pairs) == 1 and target_pairs[0] == ['?', '?'] and sample_pairs:
                a, b = sample_pairs[0]
                opt_pairs = [o.split(':') for o in opts]
                if all(len(op) == 2 for op in opt_pairs):
                    for rname, rfn in explain_rule(a, b, sample_pairs):
                        try:
                            if all((rfn(ol) == o_r) == (i == ans_idx) for i, (ol, o_r) in enumerate(opt_pairs)):
                                return ('VERIFIED' if mode == 'exact' else 'VERIFIED_NEEDS_CHARFIX'), kind, pairs, rname
                        except Exception:
                            pass
            elif len(target_pairs) == 1 and len(target_pairs[0]) == 2 and sample_pairs:
                tp = target_pairs[0]
                if tp[1] == '?':
                    rules = explain_rule(sample_pairs[0][0], sample_pairs[0][1], sample_pairs)
                    for rname, rfn in rules:
                        try:
                            if all(rfn(sp[0]) == sp[1] for sp in sample_pairs) and rfn(tp[0]) == opts[ans_idx]:
                                return ('VERIFIED' if mode == 'exact' else 'VERIFIED_NEEDS_CHARFIX'), kind, pairs, rname
                        except Exception:
                            pass
                elif tp[0] == '?':
                    rev_samples = [[sp[1], sp[0]] for sp in sample_pairs]
                    rules = explain_rule(rev_samples[0][0], rev_samples[0][1], rev_samples)
                    for rname, rfn in rules:
                        try:
                            if all(rfn(sp[0]) == sp[1] for sp in rev_samples) and rfn(tp[1]) == opts[ans_idx]:
                                return ('VERIFIED' if mode == 'exact' else 'VERIFIED_NEEDS_CHARFIX'), kind, pairs, rname
                        except Exception:
                            pass
        elif kind == 'multi_pair':
            spairs = data if mode == 'exact' else [(norm_cluster_for_test(a)[1], norm_cluster_for_test(b)[1]) for a, b in data]
            opt_pairs = [o.split(':') for o in opts]
            if len(spairs) >= 2 and all(len(op) == 2 for op in opt_pairs):
                for rname, rfn in explain_rule(spairs[0][0], spairs[0][1], spairs):
                    try:
                        if all(rfn(a) == b for a, b in spairs):
                            if all((rfn(ol) == o_r) == (i == ans_idx) for i, (ol, o_r) in enumerate(opt_pairs)):
                                return ('VERIFIED' if mode == 'exact' else 'VERIFIED_NEEDS_CHARFIX'), kind, spairs, rname
                    except Exception:
                        pass
    return 'UNSOLVED', kind, data, ''

counts = {}
flagged = []
for q in qs:
    st, kind, data, rname = test_question(q)
    counts[st] = counts.get(st, 0) + 1
    if st != 'VERIFIED':
        flagged.append((q['q_num'], st, kind, data, q['options'], q['correct_option'], rname, q['question_text']))

print("Verification Summary:", counts)
print(f"\nFlagged questions ({len(flagged)}):")
for qn, st, kind, data, opts, corr, rname, qt in flagged:
    print(f"  Q{qn:3d} [{st:21s}] ({kind:10s}) ans={corr} opts={opts} | rule={rname} | data={data}")
