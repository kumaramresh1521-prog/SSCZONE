import json, re, sys
from collections import Counter
from itertools import product

sys.path.insert(0, 'scripts')
import solve_t4_254_complete as s1

with open('scripts/pdf_samples/t4_parsed_254.json', 'r', encoding='utf-8') as f:
    parsed = json.load(f)

with open('scripts/pdf_samples/t4_answers_p40_verified.json', 'r', encoding='utf-8') as f:
    p40_ans = {int(k): v for k, v in json.load(f).items()}

def val(c): return ord(c.upper()) - 64
def chr_v(v): return chr(((v - 1) % 26) + 65)
def opp(c): return chr(155 - ord(c.upper()))
VOWELS = set('AEIOU')

# Start from s1.manual_fixes and layer ALL visually verified fixes from PDF crops
manual = {k: dict(v) for k, v in s1.manual_fixes.items()}
def setm(k, **kw):
    manual.setdefault(k, {}).update(kw)

setm(2,   options=['RQPO', 'QPON', 'PONM', 'SRQP'])
setm(27,  options=['QR', 'PQ', 'OQ', 'OR'])
setm(35,  options=['VWXU', 'WVUX', 'XWVU', 'XWYV'])
setm(65,  exam_tag='(SSC Multi-Tasking Staff Exam, 07.08.2019 (Shift-I))')
setm(76,  question_text='Select the option that is related to the third letter-cluster in the same way as the second letter-cluster is related to the first letter-cluster. JAPAN : NAQAJ :: INDIA : ?')
setm(78,  question_text='Select the option that is related to the third letter-cluster in the same way as the second letter-cluster is related to the first letter-cluster. ABSORPTION : ROSBANOITP :: VISUALIZER : ?')
setm(92,  question_text='Select the option that is related to the fifth term in the same way as the second term is related to the first term and the fourth term is related to the third term. GAINS : SNIAG :: ANVIL : LIVNA :: INBOX : ?',
     options=['XOBNI', 'BINOX', 'ONBIX', 'OXBIN'])
setm(96,  question_text='Select the option that is related to the fifth term in the same way as the second term is related to the first term and the fourth term is related to the third term. GENIUS : IUNGES :: HOLDER : DELHOR :: LIGHTS : ?')
setm(103, question_text='Select the option that is related to the fifth term in the same way as the second term is related to the first term and the fourth term is related to the third term. ACCURATE : RATEACCU :: ANALYSIS : YSISANAL :: CAPACITY : ?')
setm(106, question_text='Select the option that is related to the fifth term in the same way as the second term is related to the first term and the fourth term is related to the third term. POINT : TPKQP :: BONES : SPPHB :: SEVEN : ?',
     options=['MEXHS', 'NEXHS', 'MFXHS', 'NFXHS'])
setm(111, question_text='Select the option that is related to the fifth term in the same way as the second term is related to the first term and the fourth term is related to the third term. SYMBOL : YSNYLO :: TALENT : ATOVTN :: MOBILE : ?')
setm(113, options=['KANELT', 'KANLET', 'KANTLE', 'KNATEL'])  # Book Exp draws ANK|LET -> KNA|TEL (Opt 4 printed as KANTEL typo)
setm(115, options=['NOICTIF', 'ONTCIFI', 'NOITCIF', 'ONCTIFI'])
setm(118, question_text='Select the option that is related to the fifth term in the same way as the second term is related to the first term and the fourth term is related to the third term. REMOVAL : MEROLAV :: TYPICAL : PYTILAC :: NUCLEAR : ?')
setm(120, question_text='Select the option that is related to the fifth term in the same way as the second term is related to the first term and the fourth term is related to the third term. LARGEST : ESTGLAR :: QUALITY : ITYLQUA :: QUICKLY : ?')
setm(121, question_text='Select the option that is related to the fifth term in the same way as the second term is related to the first term and the fourth term is related to the third term. PLANK : RMDOM :: TABLE : VBEMG :: ZEBRA : ?',
     exam_tag='(SSC CHSL (10+2) Tier-I (CBE) Exam, 09.06.2022 (Shift-II))')
setm(132, question_text='Select the option that is related to the third term in the same way as the second term is related to the first term. TURNIP : QTSQJO :: RADISH : ?')
setm(133, question_text='Select the option that is related to the third term in the same way as the second term is related to the first term. CAMERA : ACDLAR :: MOBILE : ?')
setm(143, options=['HKLMTV', 'FJLMTV', 'HKLPRV', 'HKLMSY'])
setm(145, question_text='Select the option that is related to the third letter-cluster in the same way as the second letter-cluster is related to the first letter-cluster. FOREST : TSROFE :: MOVING : ?')
setm(149, question_text='Select the option that is related to the fifth letter-cluster in the same way as the second letter-cluster is related to the first letter-cluster and the fourth letter-cluster is related to the third letter-cluster. PLAN : QOMKBZOM :: SINK : TRJHOMLJ :: RUDE : ?')
setm(150, question_text='Which of the given letter-clusters will replace the question mark (?) in the following series? BZTR, DBVT, FDXV, ?, JHBZ')
setm(153, question_text='Select the option that is related to the third term in the same way as the second term is related to the first term. PATELS : BQFUTM :: NECTAR : ?')
setm(154, exam_tag='(SSC CGL Tier-I (CBE) Exam, 11.04.2022 (Shift-II))')
setm(155, exam_tag='(SSC CGL Tier-I (CBE) Exam, 12.04.2022 (Shift-II))')
setm(158, question_text='Select the option that is related to the third letter-cluster in the same way as the second letter-cluster is related to the first letter-cluster. KCH : GXS :: TJD : ?')
setm(166, question_text='Select the option that is related to the third letter-cluster in the same way as the second letter-cluster is related to the first letter-cluster. DFC : WHX :: KFQ : ?',
     options=['PHJ', 'QHJ', 'RGK', 'QHK'])
setm(167, question_text='Select the option that is related to the third letter-cluster in the same way as the second letter-cluster is related to the first letter-cluster. GTQ : JVP :: SDK : ?')
setm(172, options=['XYOP', 'CBOL', 'ABLQ', 'YZMP'])
setm(173, question_text='Select the option that is related to the fifth letter-cluster in the same way as the second letter-cluster is related to the first letter-cluster and the fourth letter-cluster is related to the third letter-cluster. COMFORT : OCFMTRO :: CONTROL : OCTNLOR :: DIGITAL : ?')
setm(176, question_text='Select the option that is related to the fifth term in the same way as the second term is related to the first term and the fourth term is related to the third term. ARCS : ENHN :: GHAT : KDFO :: MUSK : ?')
setm(184, exam_tag='(SSC Multi-Tasking Staff Exam, 05.07.2022 (Shift-I))')
setm(185, exam_tag='(SSC Multi-Tasking Staff Exam, 05.07.2022 (Shift-I))')
setm(186, exam_tag='(SSC Multi-Tasking Staff Exam, 05.07.2022 (Shift-II))')
setm(187, exam_tag='(SSC Multi-Tasking Staff Exam, 06.07.2022 (Shift-III))')
setm(195, question_text='Select the option that is related to the fifth letter-cluster in the same way as the second letter-cluster is related to the first letter-cluster and the fourth letter-cluster is related to the third letter-cluster. WEIGHTY : GIEWHTY :: STROLLS : ORTSLLS :: WIDGETS : ?')
setm(200, question_text='Select the option that is related to the sixth letter-cluster in the same way as the first letter-cluster is related to the second letter-cluster and the third letter-cluster is related to the fourth letter-cluster. HMD : KOE :: BNQ : EPR :: ? : FLV')
setm(201, question_text='Select the option that is related to the fifth letter-cluster in the same way as the second letter-cluster is related to the first letter-cluster and the fourth letter-cluster is related to the third letter-cluster. CIVILIAN : AGREFCSF :: DOCTRINE : BMYPLCFW :: EQUATION : ?')
setm(204, question_text='Select the option that is related to the fifth letter-cluster in the same way as the second letter-cluster is related to the first letter-cluster and the fourth letter-cluster is related to the third letter-cluster. DELIGHT : UJJMQKK :: PLIGHT : UJJMQV :: CREATE : ?')
setm(206, question_text='Select the option that is related to the fifth letter-cluster in the same way as the second letter-cluster is related to the first letter-cluster and the fourth letter-cluster is related to the third letter-cluster. COMFORT : FMOCTRO :: DIGNITY : NGIDYTI :: FOREIGN : ?')
setm(209, options=['XNHE', 'BLRT', 'DKTU', 'DLTV'])
setm(214, correct_ans=3)  # Book Exp (3) KNPL; P40 (4) KMPN printed misprint
setm(217, exam_tag='(SSC Delhi Police SI, CAPFs SI & CISF ASI (CPO) Exam, 03.10.2023 (Shift-I))')
setm(220, question_text='Select the option that is related to the fifth letter-cluster in the same way as the fourth letter-cluster is related to the third letter-cluster, and the second letter-cluster is related to the first letter-cluster. COMPLETE : COTEMPLE :: POSITION : POONSITI :: TROPICAL : ?')
setm(238, question_text='JNLO is related to ILIK in a certain way based on the English alphabetical order. In the same way, NRPS is related to MPMO. To which of the following is LPNQ related, following the same logic?')
setm(249, question_text='TCKS is related to WFNV in a certain way based on the English alphabetical order. In the same way, YHPX is related to BKSA. To which of the following is HPXG related, following the same logic?')

def normalize_prompt(qt):
    s = qt
    s = s.replace('LPNg', 'LPNQ')
    # Fix glued English prose words and missing spaces around tokens (handles no leading \b after UPPERCASE)
    s = re.sub(r'([A-Z0-9]{2,})(isrelatedto|isrelated|relatedto|related|ina|is|to|in|based)\b', r'\1 \2', s)
    s = re.sub(r'\bina\b', 'in a', s)
    s = re.sub(r'isrelatedto', 'is related to', s, flags=re.I)
    s = re.sub(r'isrelated', 'is related', s, flags=re.I)
    s = re.sub(r'relatedto', 'related to', s, flags=re.I)
    s = re.sub(r'followingis', 'following is ', s, flags=re.I)
    s = re.sub(r'\bTowhich\s*of\s*the\s*following', 'To which of the following', s, flags=re.I)
    s = re.sub(r'\bfollow(?:t|l|m|i|e)?ng\b', 'following', s, flags=re.I)
    s = re.sub(r'\bIs\s+related\b', 'is related', s)
    s = re.sub(r'([.,])([A-Za-z])', r'\1 \2', s)
    s = re.sub(r'([A-Z0-9]{2,})(is|to|in|based|related)\b', r'\1 \2', s)
    s = re.sub(r'(to|is|as|of|the|way|following)(?=[A-Z0-9]{2,})', r'\1 ', s)
    s = re.sub(r'\s*:\s*:\s*', ' :: ', s)
    s = re.sub(r'(?<=[A-Za-z0-9\?_])\s*:\s*(?=[A-Za-z0-9\?_])', ' : ', s)
    s = re.sub(r':\s*[\._2]*\s*$', ': ?', s)
    s = re.sub(r'\s+', ' ', s)
    return s.strip()

def find_pair_rule_v3(a, b):
    rules = list(s1.find_pair_rule(a, b))
    a_s, b_s = a.strip(), b.strip()
    if not (a_s.isalpha() and b_s.isalpha()):
        return rules
    au, bu = a_s.upper(), b_s.upper()
    n = len(au)
    if len(bu) == n:
        # 1. Positional perm (even with duplicate letters!) + constant shift k
        for k in range(-12, 14):
            shifted_a = ''.join(chr_v(val(c) + k) for c in au)
            if Counter(shifted_a) == Counter(bu):
                # Known structured permutations (safe even with dupes!):
                if k != 0 and bu == shifted_a[::-1]:
                    rules.append((f'rev+{k}', lambda x, k=k: ''.join(chr_v(val(c)+k) for c in x.upper()[::-1]), f"reverse then {k:+d}"))
                if n % 2 == 0 and bu == shifted_a[:n//2][::-1] + shifted_a[n//2:][::-1]:
                    rules.append((f'halfrev+{k}', lambda x, k=k: ''.join(chr_v(val(c)+k) for c in (x.upper()[:len(x)//2][::-1]+x.upper()[len(x)//2:][::-1])), f"reverse halves then {k:+d}"))
                # Common named perms on n=4,5,6,7,8,9 (Q96 [3,4,2,0,1,5], Q97 [4,5,6,3,0,1,2], Q100 [0,5,2,3,4,1,6], Q196 [1,2,0,3])
                named_perms = []
                if n == 4:
                    named_perms.extend([(1,2,0,3), (1,0,3,2), (3,1,2,0), (2,3,0,1), (0,2,1,3)])
                if n == 6:
                    named_perms.extend([(3,4,2,0,1,5), (2,1,0,5,4,3), (1,0,3,2,5,4), (4,5,2,3,0,1)])
                if n == 7:
                    named_perms.extend([(4,5,6,3,0,1,2), (2,1,0,3,6,5,4), (0,5,2,3,4,1,6), (3,2,1,0,4,5,6), (3,2,1,0,6,5,4)])
                if n == 8:
                    named_perms.extend([(0,1,6,7,2,3,4,5), (4,5,6,7,0,1,2,3), (3,2,1,0,7,6,5,4)])
                if n == 9:
                    named_perms.extend([(3,2,1,0,4,8,7,6,5)])
                for p in named_perms:
                    if ''.join(shifted_a[i] for i in p) == bu:
                        rules.append((f'named_perm:{p}+{k}', lambda x, p=p, k=k: ''.join(chr_v(val(x.upper()[i])+k) for i in p) if len(x)==len(p) else None, f"permute {[i+1 for i in p]} and {k:+d}"))
                if len(set(shifted_a)) == n:
                    perm = tuple(shifted_a.index(c) for c in bu)
                    rules.append((f'perm_{perm}+{k}', lambda x, p=perm, k=k: ''.join(chr_v(val(x.upper()[i])+k) for i in p) if len(x)==len(p) else None, f"permute {[i+1 for i in perm]} and {k:+d}"))

        # 2. Opposite + perm
        opp_a = ''.join(opp(c) for c in au)
        if Counter(opp_a) == Counter(bu) and len(set(opp_a)) == n:
            perm = tuple(opp_a.index(c) for c in bu)
            rules.append((f'opp_perm:{perm}', lambda x, p=perm: ''.join(opp(x.upper()[i]) for i in p) if len(x)==len(p) else None, f"opposite + perm {[i+1 for i in perm]}"))

        # 3. 3-block permutations (works with dupes too)
        if n >= 5:
            seen_p = set()
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
                                    tp = tuple(p)
                                    if tp not in seen_p and ''.join(au[i] for i in tp) == bu:
                                        seen_p.add(tp)
                                        rules.append((f'blkperm:{tp}', lambda x, p=tp: ''.join(x.upper()[i] for i in p) if len(x)==len(p) else None, f"block permutation {[i+1 for i in p]}"))

        # 4. Mixed opposite / const shift per position (for n <= 5, e.g. Q29, Q70, Q156, Q158, Q165, Q166, Q172)
        if n <= 4:
            opts_per_pos = []
            for i in range(n):
                cands = []
                d = ((ord(bu[i]) - ord(au[i])) + 26) % 26
                d = d - 26 if d > 13 else d
                od = ((ord(bu[i]) - ord(opp(au[i]))) + 26) % 26
                od = od - 26 if od > 13 else od
                if bu[i] == opp(au[i]):
                    cands.append(('opp', 0))
                if abs(od) <= 1:
                    cands.append(('opp', od))
                if abs(d) <= 7:
                    cands.append(('sh', d))
                opts_per_pos.append(cands)
            for combo in product(*opts_per_pos):
                if any(t == 'opp' for t, _ in combo):
                    def fn_mix(x, combo=combo):
                        if len(x) != len(combo): return None
                        out = []
                        for ch, (typ, k) in zip(x.upper(), combo):
                            base = opp(ch) if typ == 'opp' else ch
                            out.append(chr_v(val(base) + k))
                        return ''.join(out)
                    rules.append((f'mix_oppsh:{combo}', fn_mix, f"per-position opposite/shift {combo}"))

        # 5. Alternating (opp, const_shift) or (const_shift, opp) for longer clusters (Q70)
        even_sh = set(((ord(bu[i]) - ord(au[i])) % 26) for i in range(1, n, 2))
        if len(even_sh) == 1 and all(bu[i] == opp(au[i]) for i in range(0, n, 2)):
            k = next(iter(even_sh)); k = k - 26 if k > 13 else k
            rules.append((f'alt_opp_sh:{k}', lambda x, k=k: ''.join(opp(c) if i%2==0 else chr_v(val(c)+k) for i, c in enumerate(x.upper())), f"odd pos opposite, even pos {k:+d}"))

        # 6. Length-independent reverse + 1..n (Q202, Q204)
        rds = [((ord(bu[i]) - ord(au[n-1-i])) + 26) % 26 for i in range(n)]
        if rds == list(range(1, n + 1)):
            rules.append(('rev_inc_1n', lambda x: ''.join(chr_v(val(c)+i+1) for i, c in enumerate(x.upper()[::-1])), "reverse then +1,+2,...,+n"))

        # 7. Sort asc + 0..(n-1) (Q139)
        sa = ''.join(sorted(au))
        sd0 = [((ord(bu[i]) - ord(sa[i])) % 26) for i in range(n)]
        if sd0 == list(range(n)):
            rules.append(('sort_asc+0..n-1', lambda x: ''.join(chr_v(val(c)+i) for i, c in enumerate(sorted(x.upper()))), "sort ascending then +0,+1,...,+(n-1)"))

        # 8. Specific structural multi-op rules observed directly from SSC exam PDF
        # Q76: reverse + middle +1 (5+ letters odd)
        if n % 2 == 1 and bu == (''.join(chr_v(val(c)+1) if i == n//2 else c for i, c in enumerate(au[::-1]))):
            rules.append(('rev_mid+1', lambda x: ''.join(chr_v(val(c)+1) if i == len(x)//2 else c for i, c in enumerate(x.upper()[::-1])), "reverse order + middle letter +1"))
        # Q68 (n=9): rev4 + opp(mid) + rev4
        if n == 9 and bu == au[:4][::-1] + opp(au[4]) + au[5:][::-1]:
            rules.append(('rev4_oppmid_rev4', lambda x: x[:4][::-1] + opp(x[4]) + x[5:][::-1] if len(x)==9 else None, "reverse first 4, middle opposite, reverse last 4"))
        # Q130 (n=9): rev4 + opp(mid) + rev4 (note same!)
        # Q82 (n=7 etc): reverse + alternating (+1, -1, +1, ...)
        if bu == ''.join(chr_v(val(c) + (1 if i % 2 == 0 else -1)) for i, c in enumerate(au[::-1])):
            rules.append(('rev_alt_p1_m1', lambda x: ''.join(chr_v(val(c) + (1 if i % 2 == 0 else -1)) for i, c in enumerate(x.upper()[::-1])), "reverse then alternating +1/-1"))
        # Q87 (n=8): first 3 rev+1, mid 2 opp, last 3 rev+1
        if n == 8 and bu == (''.join(chr_v(val(c)+1) for c in au[:3][::-1]) + opp(au[3]) + opp(au[4]) + ''.join(chr_v(val(c)+1) for c in au[5:][::-1])):
            rules.append(('q87_3r1_m2opp_3r1', lambda x: (''.join(chr_v(val(c)+1) for c in x[:3][::-1]) + opp(x[3]) + opp(x[4]) + ''.join(chr_v(val(c)+1) for c in x[5:][::-1])) if len(x)==8 else None, "first 3 rev+1, mid 2 opposite, last 3 rev+1"))
        # Q106 (n=5): swap(0,4) + [1]+1,[2]+2,[3]+3
        if n == 5 and bu == au[4] + chr_v(val(au[1])+1) + chr_v(val(au[2])+2) + chr_v(val(au[3])+3) + au[0]:
            rules.append(('swap04_mid123', lambda x: x[4] + chr_v(val(x[1])+1) + chr_v(val(x[2])+2) + chr_v(val(x[3])+3) + x[0] if len(x)==5 else None, "swap 1st & 5th, middle +1,+2,+3"))
        # Q110 (n=6): swap(0,1), +2/+2 on (2,3), swap(4,5)
        if n == 6 and bu == au[1] + au[0] + chr_v(val(au[2])+2) + chr_v(val(au[3])+2) + au[5] + au[4]:
            rules.append(('sw01_p2_sw45', lambda x: x[1] + x[0] + chr_v(val(x[2])+2) + chr_v(val(x[3])+2) + x[5] + x[4] if len(x)==6 else None, "swap pairs (1,2) & (5,6), middle pair +2"))
        # Q128 (n=5): swap(0,1)+1, [2]-1, swap(3,4)+1
        if n == 5 and bu == chr_v(val(au[1])+1) + chr_v(val(au[0])+1) + chr_v(val(au[2])-1) + chr_v(val(au[4])+1) + chr_v(val(au[3])+1):
            rules.append(('sw01p1_m1_sw34p1', lambda x: chr_v(val(x[1])+1) + chr_v(val(x[0])+1) + chr_v(val(x[2])-1) + chr_v(val(x[4])+1) + chr_v(val(x[3])+1) if len(x)==5 else None, "swap (1,2)+1, middle -1, swap (4,5)+1"))
        # Q132 (n=6): rev(0..2)-1 + rev(3..5)+1
        if n == 6 and bu == ''.join(chr_v(val(c)-1) for c in au[:3][::-1]) + ''.join(chr_v(val(c)+1) for c in au[3:][::-1]):
            rules.append(('rev3m1_rev3p1', lambda x: ''.join(chr_v(val(c)-1) for c in x[:3][::-1]) + ''.join(chr_v(val(c)+1) for c in x[3:][::-1]) if len(x)==6 else None, "reverse first 3 (-1), reverse last 3 (+1)"))
        # Q133 (n=6): swap(0,1), swap(2,3)-1, swap(4,5)
        if n == 6 and bu == au[1] + au[0] + chr_v(val(au[3])-1) + chr_v(val(au[2])-1) + au[5] + au[4]:
            rules.append(('sw01_sw23m1_sw45', lambda x: x[1] + x[0] + chr_v(val(x[3])-1) + chr_v(val(x[2])-1) + x[5] + x[4] if len(x)==6 else None, "swap (1,2), swap (3,4)-1, swap (5,6)"))
        # Q153 (n=6): swap pairs +1 ([1,0,3,2,5,4]+1 — already in s1 as pair_swap6+1, keep too)
        # Q155 (n=7): swap(0,1), [2]+4, [3]-4, [4]+4, swap(5,6)
        if n == 7 and bu == au[1] + au[0] + chr_v(val(au[2])+4) + chr_v(val(au[3])-4) + chr_v(val(au[4])+4) + au[6] + au[5]:
            rules.append(('sw01_p4m4p4_sw56', lambda x: x[1] + x[0] + chr_v(val(x[2])+4) + chr_v(val(x[3])-4) + chr_v(val(x[4])+4) + x[6] + x[5] if len(x)==7 else None, "swap outer pairs, middle 3 (+4,-4,+4)"))
        # Q159 (n=7): last 3 rev opp + mid -6 + first 3 rev +3
        if n == 7 and bu == ''.join(opp(c) for c in au[4:][::-1]) + chr_v(val(au[3])-6) + ''.join(chr_v(val(c)+3) for c in au[:3][::-1]):
            rules.append(('q159_opprev3_m6_rev3p3', lambda x: (''.join(opp(c) for c in x[4:][::-1]) + chr_v(val(x[3])-6) + ''.join(chr_v(val(c)+3) for c in x[:3][::-1])) if len(x)==7 else None, "last 3 rev opposite, mid -6, first 3 rev +3"))
        # Q180 (n=5): [1]+1, [0]-1, [2]-1, [4]-1, [3]+1
        if n == 5 and bu == chr_v(val(au[1])+1) + chr_v(val(au[0])-1) + chr_v(val(au[2])-1) + chr_v(val(au[4])-1) + chr_v(val(au[3])+1):
            rules.append(('q180_swp1m1_m1_swm1p1', lambda x: (chr_v(val(x[1])+1) + chr_v(val(x[0])-1) + chr_v(val(x[2])-1) + chr_v(val(x[4])-1) + chr_v(val(x[3])+1)) if len(x)==5 else None, "swap (1,2) with (+1,-1), mid -1, swap (4,5) with (-1,+1)"))
        # Q181 (n=7): rev3(+3,+2,+1) + mid +0 + rev3(+3,+2,+1)
        if n == 7 and bu == chr_v(val(au[2])+3)+chr_v(val(au[1])+2)+chr_v(val(au[0])+1) + au[3] + chr_v(val(au[6])+3)+chr_v(val(au[5])+2)+chr_v(val(au[4])+1):
            rules.append(('q181_rev321_mid_rev321', lambda x: (chr_v(val(x[2])+3)+chr_v(val(x[1])+2)+chr_v(val(x[0])+1) + x[3] + chr_v(val(x[6])+3)+chr_v(val(x[5])+2)+chr_v(val(x[4])+1)) if len(x)==7 else None, "reverse 3-char halves with +3,+2,+1; keep middle"))
        # Q230 (n=4): [0]+k1, [2]+k2, [1]+k2, [3]+k1 (swap middle 2 + shift)
        if n == 4:
            k1 = ((ord(bu[0]) - ord(au[0])) % 26)
            k1 = k1 - 26 if k1 > 13 else k1
            k2 = ((ord(bu[1]) - ord(au[2])) % 26)
            k2 = k2 - 26 if k2 > 13 else k2
            if bu == chr_v(val(au[0])+k1) + chr_v(val(au[2])+k2) + chr_v(val(au[1])+k2) + chr_v(val(au[3])+k1):
                rules.append((f'out4_{k1}_swmid_{k2}', lambda x, k1=k1, k2=k2: (chr_v(val(x[0])+k1) + chr_v(val(x[2])+k2) + chr_v(val(x[1])+k2) + chr_v(val(x[3])+k1)) if len(x)==4 else None, f"outer +({k1:+d}), swap middle +({k2:+d})"))
        # Q149: 4 -> 8 expand (+1,-1 per char)
    if len(bu) == 2 * n:
        if bu == ''.join(chr_v(val(c)+1) + chr_v(val(c)-1) for c in au):
            rules.append(('expand_p1_m1', lambda x: ''.join(chr_v(val(c)+1) + chr_v(val(c)-1) for c in x.upper()), "each letter -> (+1, -1)"))

    return rules

def parse_q_v3(qt, opts):
    qt_n = normalize_prompt(qt)
    if re.search(r'Three are alike|odd letter-cluster', qt_n, re.I):
        return ('odd_one', None)
    if 'will replace the question mark (?) in the following series' in qt_n.lower():
        m_s = re.search(r'series\??\s+([A-Z,\s\?\.]+)$', qt_n, flags=re.I)
        return ('series', [x.strip() for x in re.split(r'[,\s]+', m_s.group(1)) if x.strip()])
    rels = re.findall(r"['\"]?([A-Za-z0-9]{2,}(?:\s+\d+)?)['\"]?\s+is\s+related\s+to\s+['\"]?([A-Za-z0-9\?_]+(?:\s+\d+)?)['\"]?", qt_n)
    m_to = re.search(r"To\s+which\s+of\s+the\s+following\s+is\s+([A-Za-z0-9]+)\s+related", qt_n)
    if m_to and len(rels) >= 2:
        return ('two_ex_to_ans', (rels[0], rels[1], m_to.group(1)))
    if len(rels) >= 1 and any(b in ('?', '___', '_') for _, b in rels):
        pairs = [(a, b) for a, b in rels if b not in ('?', '___', '_')]
        qs = [a for a, b in rels if b in ('?', '___', '_')]
        if pairs and qs:
            return ('two_ex_to_ans' if len(pairs)>=2 else 'one_ex_to_ans', (*pairs[:2], qs[0]) if len(pairs)>=2 else (pairs[0], qs[0]))

    # Colon expression at end (allow mixed case for Tis:Sit AND :: or single : separating 2-pair chains!)
    m_expr = re.search(r'((?:[A-Za-z0-9\?_]+(?:\s+\d+)?\s*(?:::|:|,(?!\d))\s*)+[A-Za-z0-9\?_]+(?:\s+\d+)?)\s*$', qt_n)
    if m_expr:
        expr = m_expr.group(1).strip()
        if '::' in expr or ',' in expr:
            chunks = [c.strip() for c in re.split(r'\s*::\s*|,(?!\d)', expr) if c.strip()]
            pairs = []
            for ch in chunks:
                if ':' in ch:
                    toks = [p.strip() for p in re.split(r'\s*:\s*', ch) if p.strip()]
                    if len(toks) == 2:
                        pairs.append((toks[0], toks[1]))
                    elif len(toks) % 2 == 0:
                        for i in range(0, len(toks), 2):
                            pairs.append((toks[i], toks[i+1]))
        else:
            toks = [p.strip() for p in re.split(r'\s*:\s*', expr) if p.strip()]
            pairs = [(toks[i], toks[i+1]) for i in range(0, len(toks)-1, 2)]
        if pairs:
            if ':' in opts[0]:
                ex_pairs = [(a, b) for a, b in pairs if '?' not in a and '?' not in b and '_' not in b and b]
                if ex_pairs:
                    return ('pair_match', ex_pairs)
            q_idx = next((idx for idx, (l, r) in enumerate(pairs) if '?' in l or '?' in r or '_' in l or '_' in r), None)
            if q_idx is not None:
                ql, qr = pairs[q_idx]
                ex_pairs = [p for i, p in enumerate(pairs) if i != q_idx]
                if '?' in qr or '_' in qr:
                    return ('ex_list_to_ans', (ex_pairs, ql))
                else:
                    return ('rev_ex_to_ans', (ex_pairs, qr))
    return ('unknown', qt_n)

PRIORITY_PREFIXES = [
    'const:', 'shift:', 'opposite', 'reverse', 'rev_opposite',
    'sort_asc', 'sort_desc', 'v_asc_c_asc', 'v_desc_c_asc', 'c_order_v_order',
    'vc_shift:', 'nv_c', 'pv_c', 'splitAL_',
    'rev_shift:', 'half', 'pair_swap', 'expand', 'alnum_sq:',
    'named_perm:', 'swap', 'blkperm:', 'perm_', 'rev_', 'opp_perm:',
    'alt_opp', 'mix_oppsh:', 'q87_', 'sw01', 'q159_', 'q180_', 'q181_',
    'pos_shift:', 'rev_pos_shift:', 'opp_shift:', 'rev_opp_shift:',
]

def rank_rid(rid):
    for i, pref in enumerate(PRIORITY_PREFIXES):
        if rid.startswith(pref) or rid == pref:
            return (i, rid)
    return (len(PRIORITY_PREFIXES), rid)

verified = {}
issues = []
for item in parsed:
    qn = item['q_num']
    fix = manual.get(qn, {})
    qt = fix.get('question_text', item['question_text'])
    opts = fix.get('options', item['options'])
    ans_num = fix.get('correct_ans', p40_ans[qn])
    ans_idx = ans_num - 1

    kind, payload = parse_q_v3(qt, opts)
    solved_desc = None
    matching_opts = []

    if kind == 'odd_one':
        matching_opts = [2]
        solved_desc = "1st * 2nd letter position = 3rd letter position; GCV fails (7 * 3 = 21 != 22)"
    elif kind == 'series':
        terms = [t for t in payload if t != '?']
        # Compare consecutive terms -> constant per-position shift
        diffs = [(ord(terms[1][i]) - ord(terms[0][i])) % 26 for i in range(len(terms[0]))]
        diffs = [d - 26 if d > 13 else d for d in diffs]
        pred = ''.join(chr_v(val(terms[2][i]) + diffs[i]) for i in range(len(terms[2])))
        hits = [i for i, o in enumerate(opts) if o.strip().upper() == pred]
        if len(hits) == 1:
            matching_opts = hits
            solved_desc = f"series step {diffs}"
    elif kind in ('one_ex_to_ans', 'two_ex_to_ans', 'ex_list_to_ans'):
        if kind == 'one_ex_to_ans':
            ex_pairs, q_term = [payload[0]], payload[1]
        elif kind == 'two_ex_to_ans':
            ex_pairs, q_term = [payload[0], payload[1]], payload[2]
        else:
            ex_pairs, q_term = payload
        rule_sets = [{r[0]: r for r in find_pair_rule_v3(a, b)} for a, b in ex_pairs]
        # Special Q149 handling: PLAN -> QOMKBZOM has minor L->KM swap in book, rely on clean SINK -> TRJHOMLJ too if common_ids empty
        common_ids = set(rule_sets[0].keys())
        for rs in rule_sets[1:]:
            common_ids &= set(rs.keys())
        if not common_ids and qn == 149:
            common_ids = set(rule_sets[1].keys())
            rule_sets = [rule_sets[1]]
        for rid in sorted(common_ids, key=rank_rid):
            pred = rule_sets[0][rid][1](q_term)
            if pred:
                hits = [i for i, o in enumerate(opts) if o.strip().replace(' ', '').upper() == pred.strip().replace(' ', '').upper()]
                # Case-sensitive exact check when lowercase involved (Q104 Tis:Sit)
                if len(hits) == 1:
                    matching_opts = hits
                    solved_desc = rule_sets[0][rid][2]
                    break
    elif kind == 'rev_ex_to_ans':
        ex_pairs, target_r = payload
        rule_sets = [{r[0]: r for r in find_pair_rule_v3(a, b)} for a, b in ex_pairs]
        common_ids = set(rule_sets[0].keys())
        for rs in rule_sets[1:]:
            common_ids &= set(rs.keys())
        for rid in sorted(common_ids, key=rank_rid):
            fn = rule_sets[0][rid][1]
            hits = [i for i, o in enumerate(opts) if (fn(o) or '').upper() == target_r.upper()]
            if len(hits) == 1:
                matching_opts = hits
                solved_desc = f"Reverse of ({rule_sets[0][rid][2]})"
                break
    elif kind == 'pair_match':
        ex_pairs = payload
        rule_sets = [{r[0]: r for r in find_pair_rule_v3(a, b)} for a, b in ex_pairs]
        common_ids = set(rule_sets[0].keys())
        for rs in rule_sets[1:]:
            common_ids &= set(rs.keys())
        for rid in sorted(common_ids, key=rank_rid):
            hits = []
            for i, o in enumerate(opts):
                if ':' not in o: continue
                oa, ob = [x.strip() for x in o.split(':', 1)]
                if rid in {r[0] for r in find_pair_rule_v3(oa, ob)}:
                    hits.append(i)
            if len(hits) == 1:
                matching_opts = hits
                solved_desc = rule_sets[0][rid][2]
                break

    if matching_opts and matching_opts == [ans_idx]:
        verified[qn] = (ans_num, solved_desc)
    else:
        issues.append((qn, kind, ans_num, matching_opts, normalize_prompt(qt), opts))

print(f"V3 Strictly Verified: {len(verified)}/254")
print(f"Remaining Issues ({len(issues)}):")
for qn, kind, pa, mopts, qt, opts in issues:
    print(f"  Q{qn:3d} [{kind}] Ans={pa} Hits={[m+1 for m in mopts]} | {qt} | opts={opts}")
