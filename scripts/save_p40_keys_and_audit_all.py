import json
import os
import re
from itertools import permutations

# 1. Exact P40 Type-IV printed answer key (1..254) read directly from p40_t4_ans_*.png
p40_rows = [
    # 1..128 (4 cols per row)
    1,1,2,3,  3,2,3,3,  2,4,2,3,  4,1,1,3,
    4,3,3,2,  2,4,4,1,  3,1,4,3,  4,1,3,4,
    4,1,2,3,  3,4,1,2,  2,1,4,1,  2,4,4,2,
    3,3,4,1,  1,2,3,1,  1,1,3,1,  1,1,2,3,
    3,1,4,2,  1,3,1,3,  3,4,3,2,  3,3,4,3,
    4,2,4,1,  1,4,1,1,  4,3,3,1,  1,1,3,1,
    2,2,3,1,  1,4,3,2,  4,4,2,3,  2,3,4,3,
    4,3,4,4,  4,4,4,3,  3,2,1,2,  4,4,1,2,
    # 129..252
    4,2,4,3,  2,2,2,4,  1,2,3,3,  1,3,1,2,
    4,4,3,2,  1,2,3,2,  2,2,1,1,  1,2,1,1,
    3,2,1,1,  3,1,1,4,  4,4,2,3,  1,1,2,4,
    2,3,3,2,  3,4,2,2,  2,4,2,1,  2,2,4,3,
    1,4,1,3,  3,4,3,4,  4,4,3,4,  1,1,3,3,
    4,3,4,1,  1,4,1,2,  4,3,3,4,  2,2,3,1,
    1,1,4,4,  4,3,3,3,  3,1,4,3,  1,2,1,2,
    4,4,1,4,  1,4,2,3,  2,1,1,4,
    # 253..254
    3,2
]
assert len(p40_rows) == 254, len(p40_rows)
p40_ans = {i + 1: p40_rows[i] for i in range(254)}

with open('scripts/pdf_samples/t4_answers_p40_verified.json', 'w', encoding='utf-8') as f:
    json.dump({str(k): v for k, v in p40_ans.items()}, f, indent=2)

with open('scripts/pdf_samples/t4_answers_visual_verified.json', 'r', encoding='utf-8') as f:
    old_ans = {int(k): v for k, v in json.load(f).items()}

diff_old = [(q, old_ans[q], p40_ans[q]) for q in range(1, 255) if old_ans[q] != p40_ans[q]]
print(f"Old verified vs True P40 diffs ({len(diff_old)}): {[d[0] for d in diff_old]}")

# 2. Extract explanations cleanly (handling mid-line QN. (opt) merges!)
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
    gx_min, gx_max = min(c[0] for c in clean), max(c[1] for c in clean)
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
    return (best_cut(gx_min + span * 0.25, gx_min + span * 0.42),
            best_cut(gx_min + span * 0.58, gx_min + span * 0.76))

stream_tokens = []
for fname in exp_files:
    with open(f'scripts/pdf_samples/t4_robust/{fname}', 'r', encoding='utf-8') as f:
        its = json.load(f)
    s1, s2 = find_3col_splits(its)
    cols = [[], [], []]
    for b in its:
        xs = [p[0] for p in b[0]]
        ys = [p[1] for p in b[0]]
        xm, ym = (min(xs) + max(xs)) / 2, (min(ys) + max(ys)) / 2
        if ym < 25 or ym > 580:
            continue
        cols[0 if xm < s1 else (1 if xm < s2 else 2)].append((ym, min(xs), b[1]))
    for ci in range(3):
        cols[ci].sort(key=lambda z: (round(z[0] / 3), z[1]))
        started = (fname != 'exp_p58_right.json')
        for ym, x0, txt in cols[ci]:
            t = txt.strip()
            if fname == 'exp_p58_right.json':
                if 'TYPE-IV' in t.upper():
                    started = True
                    continue
                if not started:
                    continue
            if fname == 'exp_p69_left.json' and 'TYPE-V' in t.upper():
                started = False
                break
            if any(k in t.upper() for k in ['@APNA', 'TELEGRAM', 'K5279', 'ANALOGY OR SIMILARITY', 'EXPLANATIONS']):
                continue
            # Split mid-line occurrences like "Similarly. 228. (4)"
            parts = re.split(r'(?=(?:^|\s)\d{1,3}\s*[\.\,\:\-]\s*[\(\[]?[1-4Il\|\]]\)?)', t)
            for p in parts:
                ps = p.strip()
                if ps:
                    stream_tokens.append(ps)

exps = {}
cur_q = 0
cur_ans = None
cur_txt = []
for t in stream_tokens:
    # Match "228. (4)...", "228.(4)", "143. [1]", "92-(1)", "134. (2)", etc.
    m = re.match(r'^(\d{1,3})\s*[\.\,\:\-]?\s*[\(\[]\s*([1-4Il\|])\s*[\)\]]\s*(.*)', t)
    if not m:
        m = re.match(r'^(\d{1,3})\s*[\.\,]\s*([1-4])\s*[\)\]]\s*(.*)', t)
    if m:
        qn = int(m.group(1))
        opt = int(m.group(2).replace('I', '1').replace('l', '1').replace('|', '1'))
        if 1 <= qn <= 254 and (cur_q < qn <= cur_q + 25):
            if 1 <= cur_q <= 254 and cur_q not in exps:
                exps[cur_q] = {'ans': cur_ans, 'text': ' '.join(cur_txt).strip()}
            cur_q = qn
            cur_ans = opt
            cur_txt = [m.group(3).strip()] if m.group(3).strip() else []
            continue
    if cur_q > 0:
        cur_txt.append(t)
if 1 <= cur_q <= 254 and cur_q not in exps:
    exps[cur_q] = {'ans': cur_ans, 'text': ' '.join(cur_txt).strip()}

p40_vs_exp = [(q, p40_ans[q], exps[q]['ans']) for q in sorted(exps) if p40_ans[q] != exps[q]['ans']]
print(f"Extracted {len(exps)}/254 expls! P40 vs ExplKey diffs ({len(p40_vs_exp)}): {p40_vs_exp}")
for q, ap, ae in p40_vs_exp:
    print(f"  EXP DIFF Q{q}: P40={ap} vs Expl={ae} | ExplTxt={exps[q]['text'][:100]}")

# 3. Quick-fix visually verified empty options & OCR Q/g bugs on parsed_254 before math solver check
with open('scripts/pdf_samples/t4_parsed_254.json', 'r', encoding='utf-8') as f:
    parsed = json.load(f)

vis_fixes = {
    1:  {'question_text': 'ABCD : QRST :: BACD : ?', 'options': ['RQST', 'STQR', 'QRST', 'RSTQ']},
    11: {'question_text': 'RPQ : PNO :: JEK : ?'},
    22: {'question_text': 'MPQ : JMN :: KSV : ?', 'options': ['HPT', 'GQT', 'GQS', 'HPS']},
    23: {'options': ['PWN', 'QXP', 'PWO', 'QXO']},
    28: {'question_text': 'BYWD : DWUF :: AZYB : ?'},
    34: {'options': ['NRQU', 'MRQV', 'NQRU', 'ORQT']},
    35: {'options': ['VWXU', 'WVUX', 'WVXU', 'XWYV']},
    36: {'question_text': 'LAMP : PALM :: MALE : ?'},
    38: {'options': ['SOLJ', 'TROK', 'TPNL', 'TPMK']},
    41: {'question_text': 'ACCIDENT is related to TNEDICCA in the same way as PASSENGER is related to ?'},
    44: {'options': ['PLBUKQ', 'JKCTKQ', 'PLDSKQ', 'JLZUKQ']},
    45: {'options': ['YOIJBT', 'YOIKBT', 'YNIKBT', 'YOIKCT']},
    47: {'question_text': 'QDUJ : VIZO :: LPAR : ?'},
    50: {'options': ['NQQT', 'LQQT', 'LPPT', 'NPPT']},
    53: {'question_text': 'KSOE : MQQC :: ACZN : ?'},
    56: {'options': ['MQU', 'MQV', 'MOU', 'MOV']},
    64: {'options': ['QFV', 'ODS', 'QFU', 'QDU']},
    68: {'question_text': 'QMDFEHKNJ : FDMQVJNKH :: ? : HELIOPTER'},
    70: {'question_text': 'NRGLEDGLLQ : MOTIVATION :: ? : DEMEANOURS'},
    77: {'options': ['UTSS', 'UTJS', 'JSTU', 'UJTS']},
    82: {'options': ['HMICBDJ', 'HMJCBDI', 'JDBCIMH', 'IDBCJMH']},
    88: {'options': ['NTN', 'MSR', 'MTN', 'NSP']},
    91: {'options': ['HREA', 'RHEA', 'REAH', 'RAEH']},
    117: {'question_text': 'Select the option that is related to the fifth term in the same way as the second term is related to the first term and the fourth term is related to the third term. MASTER : AMHGRE :: LUXURY : ULCFYR :: FORMAL : ?'},
    120: {'options': ['KYLCUQI', 'UCLKYQI', 'KLYCQUI', 'KQICUYL']},
    124: {'options': ['TERLAR', 'TEVARL', 'TEVRAL', 'TEVALR']},
    128: {'question_text': 'Select the option that is related to the third term in the same way as the second term is related to the first term. IDEAS : EJDTB :: FOREX : ?',
          'options': ['PGSFY', 'PGQYF', 'PGSYF', 'GPSYF']},
    130: {'options': ['UNOMNSNTE', 'UNOMNSTNE', 'UNOMGSTEN', 'UONMNSTNE']},
    134: {'options': ['KIJNVX', 'GIJNWY', 'GJJNVX', 'KJJNVX']},
    136: {'options': ['QPSX', 'OMNX', 'NMTX', 'MLSX']},
    140: {'options': ['DGQPPO', 'DGHPPQ', 'SPMGGF', 'SPMMFG']},
    146: {'options': ['UTJOQ', 'OMITS', 'OPJTU', 'UTJPN']},
    149: {'options': ['SQVTECFD', 'ECFDSQVT', 'ECFDECFD', 'SQVTSQVT']},
    151: {'question_text': 'Select the option that is related to the fifth letter-cluster in the same way as the second letter-cluster is related to the first letter-cluster and the fourth letter-cluster is related to the third letter-cluster. DUNE : BGSXLQCH :: NEED : LQCHCHBG :: KING : ?'},
    152: {'question_text': 'Select the option that is related to the fifth letter-cluster in the same way as the second letter-cluster is related to the first letter-cluster and the fourth letter-cluster is related to the third letter-cluster. LIST : JNGKQURV :: MOAN : KOMQYCLP :: PLUM : ?'},
    153: {'options': ['FODUSZ', 'FOUDSB', 'FOVDBS', 'OEUDQB']},
    154: {'question_text': 'Select the option that is related to the third letter-cluster in the same way as the second letter-cluster is related to the first letter-cluster. PDK : QFN :: SJQ : ?'},
    155: {'question_text': 'Select the option that is related to the third term in the same way as the second term is related to the first term. UPRIGHT : PUVEKTH :: DESTROY : ?'},
    158: {'options': ['QMX', 'PQW', 'PNH', 'QNW']},
    160: {'options': ['RTQEWDVU', 'RTSEWDSQ', 'RTQFXDVU', 'RTQEWDWV']},
    164: {'options': ['QPH', 'QOF', 'RQG', 'PQG']},
    168: {'options': ['URQWNS', 'UQQXOR', 'UQRVNR', 'UQQWNR']},
    178: {'question_text': 'Select the option that is related to the third letter-cluster in the same way as the second letter-cluster is related to the first letter-cluster. CANVAS : DCQZFY :: LOANER : ?',
          'options': ['MQDSKX', 'MRDRJY', 'MQDRJX', 'MQERJY']},
    181: {'options': ['BDRTQZK', 'GTFUCUM', 'FGTUUCM', 'DFTUSBM']},
    182: {'question_text': 'Select the option that is related to the third letter-cluster in the same way as the second letter-cluster is related to the first letter-cluster. STRAW : HGIZD :: NORTH : ?'},
    183: {'question_text': 'Select the option that is related to the third letter-cluster in the same way as the second letter-cluster is related to the first letter-cluster. PG : VM :: AB : ?'},
    184: {'options': ['PROUD : NPMSB', 'STRAW : UYPRQ', 'POLDY : WBJQN', 'GAMES : UGOCE']},
    185: {'question_text': 'Select the option that is related to the fifth letter-cluster in the same way as the second letter-cluster is related to the first letter-cluster and the fourth letter-cluster is related to the third letter-cluster. BEWMTT : ACTION :: KWQMTX : JUNIOR :: QTRJNZ : ?',
          'options': ['PROFTI', 'PROFIT', 'PROFIU', 'PROEIT']},
    187: {'question_text': 'Select the option that is related to the third letter-cluster in the same way as the second letter-cluster is related to the first letter-cluster. PAT : SVA :: CRA : ?',
          'options': ['FMI', 'FMH', 'EMH', 'FNH']},
    188: {'question_text': 'Select the option in which the pair of letter-clusters share the same relationship as that shared by the given letter-clusters. RSPQ : QPSR'},
    190: {'question_text': 'Select the option in which the pair of letter-clusters share the same relationship as that shared by the given pair of letter-clusters. ROP : NMP :: ?',
          'options': ['TIN : LGV', 'MUG : ESK', 'CRB : DPA', 'LAN : LXJ']},
    192: {'options': ['XGVF', 'XHTF', 'XGUF', 'XGTF']},
    193: {'question_text': 'Select the option that is related to the fifth term in the same way as the second term is related to the first term and the fourth term is related to the third term. OUT 2 : WWP 4 :: AXE 5 : HZB 25 :: ART 7 : ?',
          'options': ['WTB 49', 'WTB 35', 'VTB 49', 'WTB 14']},
    207: {'question_text': 'Select the option that is related to the fifth letter-cluster in the same way as the second letter-cluster is related to the first letter-cluster and the fourth letter-cluster is related to the third letter-cluster. HEROES : LBVLBW :: INVEST : FRZBWX :: KIDNAP : ?'},
    208: {'question_text': 'DHJ is related to AEG in a certain way based on the English alphabetical order. In the same way, ZML is related to WJI. To which of the following is EKQ related, following the same logic?',
          'options': ['HNT', 'DJK', 'BHN', 'QKE']},
    209: {'question_text': 'AFKQ is related to BELR in a certain way based on the English alphabetical order. In the same way, IQWY is related to JPXZ. To which of the following is CMSU related following the same logic?'},
    210: {'question_text': 'Select the option in which the letter-clusters share the same relationship as that shared by the given pairs of letter-clusters. DKG : HSN, VLM : ZTT'},
    211: {'question_text': 'ADEC is related to GJKI in a certain way based on the English alphabetical order. In the same way, HKLJ is related to NQRP. To which of the following is MPQO related, following the same logic?',
          'options': ['TVWU', 'SWXV', 'TWXU', 'SVWU']},
    213: {'question_text': 'Select the pair of letter-clusters which follows the same pattern as that followed by the two set of pair of letter-clusters given below. Both pairs of letter-clusters follow the same pattern. BFG : LPQ, HKM : RUW'},
    214: {'question_text': 'BEGC is related to ILNJ in a certain way based on the English alphabetical order. In the same way, LOQM is related to SVXT. To which of the following is DGIE related, following the same logic?',
          'options': ['MPRN', 'KNQM', 'KNPL', 'KMPN']},
    215: {'options': ['WGSK', 'XERJ', 'WEQK', 'VGQI']},
    216: {'options': ['PDKN', 'QCLN', 'RCMN', 'QDKO']},
    221: {'options': ['RUCP : KMOA', 'CPSF : DQTG', 'ODAF : GKLN', 'PORU : ZZOU']},
    222: {'options': ['UXZ', 'PTX', 'PQR', 'SRT']},
    223: {'question_text': 'In the following question, select the related letter pair from the given alternatives. YL : UH :: ?',
          'options': ['PQ : RS', 'OB : GT', 'TG : PC', 'UU : VV']},
    224: {'options': ['EQ : ZL', 'HU : IV', 'DQ : ET', 'PS : RV']},
    225: {'question_text': 'PSV : QTW :: CGK : ?'},
    228: {'options': ['LAXJ', 'LAYK', 'KZWI', 'KZXJ']},
    231: {'question_text': 'Select the pair which follows the same pattern as that followed by the two set of pairs given below. Both pairs follow the same pattern. DFG : IKL, MOP : RTU'},
    232: {'question_text': 'Select the pair which follows the same pattern as that followed by the two set of pairs given below. Both pairs follow the same pattern. CJM : FMP, AHL : DKO',
          'options': ['LTV : TVL', 'KOQ : PLJ', 'NRS : QUV', 'GHA : AHG']},
    233: {'question_text': 'Select the pair which follows the same pattern as that followed by the two set of pairs given below. Both pairs follow the same pattern. PTL : NRJ, AEX : YCV'},
    236: {'options': ['NQRG', 'NGRQ', 'NQGR', 'NGQR']},
    237: {'options': ['WWTO', 'XXTP', 'XWSP', 'XXSP']},
    239: {'options': ['QDS', 'QDT', 'PCR', 'PCS']},
    240: {'options': ['PRO', 'RTQ', 'STQ', 'PQO']},
    241: {'options': ['YQQJ', 'XQSI', 'YQPI', 'XQQI']},
    242: {'question_text': 'Select the option that is related to the fifth letter-cluster in the same way as the second letter-cluster is related to the first letter-cluster and the fourth letter-cluster is related to the third letter-cluster. DOY : PAK :: BQM : NCY :: ILU : ?'},
    245: {'question_text': 'Select the option that is related to the fifth letter-cluster in the same way as the second letter-cluster is related to the first letter-cluster and the fourth letter-cluster is related to the third letter-cluster. OUR : NPTVQS :: BIG : ACHJFH :: FOR : ?',
          'options': ['EGNPQS', 'GENPRS', 'EGNOQR', 'GEPNSQ']},
    247: {'options': ['ONQL', 'OMQK', 'PNRL', 'PMRK']},
    249: {'question_text': 'TCKS is related to WFNV in a certain way based on the English alphabetical order. In the same way, YHPX is related to BKSA. To which of the following is HPXZ related, following the same logic?'},
    250: {'question_text': 'OGMI is related to LDJF in a certain way based on the English alphabetical order. In the same way, SKQM is related to PHNJ. To which of the following is VNTP related, following the same logic?',
          'options': ['SKQM', 'KSMQ', 'SKMQ', 'KSQM']},
    252: {'options': ['PQLK', 'PQKL', 'LQPK', 'LQKP']},
    253: {'question_text': 'MNQP is related to STWV in a certain way based on the English alphabetical order. In the same way, ABED is related to GHKJ. To which of the following is IJML related, following the same logic?'},
    254: {'options': ['QOMKBZZX', 'OQKMZBXZ', 'QOKMBZXZ', 'OQMKZBXZ']},
}

# Comprehensive pattern solver
def val(c): return ord(c.upper()) - 64
def chr_v(v): return chr(((v - 1) % 26) + 65)
def opp_c(c): return chr(155 - ord(c.upper()))  # A(65)->Z(90)

VOWELS = 'AEIOU'
def next_vowel(c, step=1):
    if c in VOWELS:
        return VOWELS[(VOWELS.index(c) + step) % 5]
    return c

def extract_clusters_from_prompt(qt):
    # Extract clean uppercase tokens ignoring common English words in prose
    # Find last sentence or portion containing ':'
    if ':' in qt:
        # Handle "X is related to Y ... A is related to B ... Z" too
        m_rel = re.findall(r"([A-Z]{2,}(?:\s+\d+)?)\s+(?:is\s+related\s+to|→)\s+([A-Z?]{2,}(?:\s+\d+)?|[?]|_+)", qt, re.I)
        # Or colon chunks
        idx_c = qt.find(':')
        # walk back to start of word before first ':'
        s_idx = idx_c
        while s_idx > 0 and (qt[s_idx-1].isalnum() or qt[s_idx-1] in " '_-?"):
            if qt[s_idx-1] == ' ' and s_idx >= 2 and qt[s_idx-2] in '.':
                break
            if re.match(r'\bto\s+$', qt[:s_idx], re.I):
                break
            s_idx -= 1
    return None

def parse_analogy_terms(qt):
    # Method 1: explicit A : B :: C : D (or with 3 pairs A:B :: C:D :: E:?)
    # Clean "is related to" -> ":" style? No handle both!
    s = qt
    # Case: "ACCIDENT is related to TNEDICCA ... PASSENGER is related to ?"
    rels = re.findall(r"['\"]?([A-Z0-9]+(?:\s+\d+)?)['\"]?\s+is\s+related\s+to\s+['\"]?([A-Z0-9\?_]+(?:\s+\d+)?)['\"]?", s)
    # Also "To which of the following is VNTP related"
    m_to = re.search(r"To\s+which\s+of\s+the\s+following\s+is\s+([A-Z0-9]+)\s+related", s)
    if len(rels) >= 2 and m_to:
        return [('pair', rels[0][0], rels[0][1]), ('pair', rels[1][0], rels[1][1]), ('query', m_to.group(1), '?')]
    if len(rels) >= 1 and any(x[1] in ('?', '___', '_') or '?' in x[1] or '_' in x[1] for x in rels):
        return [('pair' if b not in ('?', '___', '_') else 'query', a, b) for a, b in rels]

    # Method 2: colon notation
    # Grab substring starting at first uppercase word followed by ':'
    m_col = re.search(r"([A-Z][A-Z0-9\s]*\s*:\s*[^$]+)", s)
    if not m_col:
        # Check for single pair question like "RSPQ : QPSR" or multiple given pairs "DKG : HSN, VLM : ZTT"
        pairs = re.findall(r'([A-Z0-9]{2,})\s*:\s*([A-Z0-9\?_]+)', s)
        return [('given', a, b) for a, b in pairs]
    expr = m_col.group(1).strip()
    # Split on '::' or ',' or whitespace between pairs
    # First normalize '::' and ':' spacing
    pairs = re.findall(r'([A-Z0-9]+(?:\s+\d+)?|\?)\s*:\s*([A-Z0-9]+(?:\s+\d+)?|\?|_+|)', expr)
    # Wait regex above can match empty RHS, refine:
    parts = [p.strip() for p in re.split(r'::|,(?!\d)', expr) if p.strip()]
    out = []
    for pt in parts:
        if ':' in pt:
            a, b = [x.strip() for x in pt.split(':', 1)]
            out.append((a, b))
        else:
            out.append((pt, ''))
    return out

def infer_and_apply(a, b, c):
    # Given pair a -> b, apply same rule to c and return candidate string(s) or None
    a, b, c = a.replace(' ', ''), b.replace(' ', ''), c.replace(' ', '')
    if not (a.isalpha() and b.isalpha() and c.isalpha()):
        return []
    cands = []
    n = len(a)
    if len(b) == n and len(c) == len(c):
        # 1. Direct positional shift (uniform or per-position if same length)
        if len(c) == n:
            diffs = [((ord(b[i]) - ord(a[i])) + 26) % 26 for i in range(n)]
            diffs_signed = [d - 26 if d > 13 else d for d in diffs]
            cands.append(('shift_pos', ''.join(chr_v(val(c[i]) + diffs_signed[i]) for i in range(n)), diffs_signed))
            # reverse then shift
            rdiffs = [((ord(b[i]) - ord(a[n - 1 - i])) + 26) % 26 for i in range(n)]
            rd_s = [d - 26 if d > 13 else d for d in rdiffs]
            cands.append(('rev_shift_pos', ''.join(chr_v(val(c[n - 1 - i]) + rd_s[i]) for i in range(n)), rd_s))
            # opp + shift
            odiffs = [((ord(b[i]) - ord(opp_c(a[i]))) + 26) % 26 for i in range(n)]
            od_s = [d - 26 if d > 13 else d for d in odiffs]
            if all(abs(d) <= 8 for d in od_s):
                cands.append(('opp_shift_pos', ''.join(chr_v(val(opp_c(c[i])) + od_s[i]) for i in range(n)), od_s))
            # rev opp + shift
            rodiffs = [((ord(b[i]) - ord(opp_c(a[n - 1 - i]))) + 26) % 26 for i in range(n)]
            rod_s = [d - 26 if d > 13 else d for d in rodiffs]
            if all(abs(d) <= 8 for d in rod_s):
                cands.append(('rev_opp_shift_pos', ''.join(chr_v(val(opp_c(c[n - 1 - i])) + rod_s[i]) for i in range(n)), rod_s))

        # 2. Pure uniform shift across variable lengths (if reverse word)
        if len(set(((ord(b[i]) - ord(a[i])) % 26) for i in range(n))) == 1:
            k = (ord(b[0]) - ord(a[0])) % 26
            cands.append(('const_shift', ''.join(chr_v(val(x) + k) for x in c), k))
        if len(set(((ord(b[i]) - ord(a[n - 1 - i])) % 26) for i in range(n))) == 1:
            k = (ord(b[0]) - ord(a[n - 1])) % 26
            cands.append(('rev_const_shift', ''.join(chr_v(val(x) + k) for x in c[::-1]), k))
        if all(b[i] == opp_c(a[i]) for i in range(n)):
            cands.append(('opposite', ''.join(opp_c(x) for x in c), None))
        if all(b[i] == opp_c(a[n - 1 - i]) for i in range(n)):
            cands.append(('rev_opposite', ''.join(opp_c(x) for x in c[::-1]), None))

        # 3. Pure permutation (for any length if same length as a)
        if sorted(a) == sorted(b) and len(c) == n and sorted(a) != list(b):
            # Only unique letter permutation if distinct letters, or try standard rules
            # Check alphabetical sort forward & reverse
            if list(b) == sorted(a):
                cands.append(('alpha_sort', ''.join(sorted(c)), None))
            if list(b) == sorted(a, reverse=True):
                cands.append(('rev_alpha_sort', ''.join(sorted(c, reverse=True)), None))
            if b == a[::-1]:
                cands.append(('reverse', c[::-1], None))
            # Half/chunk reversals
            if n % 2 == 0:
                h = n // 2
                if b == a[:h][::-1] + a[h:][::-1]:
                    cands.append(('half_rev', c[:h][::-1] + c[h:][::-1], None))
                if b == a[h:] + a[:h]:
                    cands.append(('half_swap', c[len(c)//2:] + c[:len(c)//2], None))
            # Swap adjacent pairs
            if n % 2 == 0 and b == ''.join(a[i+1]+a[i] for i in range(0, n, 2)):
                cands.append(('pair_swap', ''.join(c[i+1]+c[i] for i in range(0, len(c), 2)), None))
            if len(set(a)) == n:
                perm = [a.index(ch) for ch in b]
                cands.append(('perm', ''.join(c[p] for p in perm), perm))

        # 4. Sorted + uniform/pos shift (e.g. Q86, Q134, Q139, Q140)
        sa, sr = ''.join(sorted(a)), ''.join(sorted(a, reverse=True))
        sc, scr = ''.join(sorted(c)), ''.join(sorted(c, reverse=True))
        for tag, base_a, base_c in [('sort', sa, sc), ('rsort', sr, scr)]:
            sd = [((ord(b[i]) - ord(base_a[i])) % 26) for i in range(len(b))]
            sd_s = [d - 26 if d > 13 else d for d in sd]
            if len(set(sd_s)) == 1:
                k = sd_s[0]
                cands.append((f'{tag}+const', ''.join(chr_v(val(x) + k) for x in base_c), k))
            elif len(base_c) == len(sd_s) and all(abs(d) <= 6 for d in sd_s):
                cands.append((f'{tag}+pos', ''.join(chr_v(val(base_c[i]) + sd_s[i]) for i in range(len(base_c))), sd_s))
            elif sd_s == list(range(1, len(b)+1)):
                cands.append((f'{tag}+1..n', ''.join(chr_v(val(base_c[i]) + i + 1) for i in range(len(base_c))), None))

        # 5. Vowel/Consonant rules (A-L +1, M-Z +2; vowel prev/next; vowels sorted then cons sorted)
        va = [ch for ch in a if ch in VOWELS]
        ca = [ch for ch in a if ch not in VOWELS]
        vc = [ch for ch in c if ch in VOWELS]
        cc = [ch for ch in c if ch not in VOWELS]
        if b == ''.join(sorted(va)) + ''.join(sorted(ca)):
            cands.append(('v_sort+c_sort', ''.join(sorted(vc)) + ''.join(sorted(cc)), None))
        if b == ''.join(sorted(va, reverse=True)) + ''.join(sorted(ca)):
            cands.append(('v_rsort+c_sort', ''.join(sorted(vc, reverse=True)) + ''.join(sorted(cc)), None))
        # Vowel shift / Cons shift
        v_diffs = set(((ord(b[i]) - ord(a[i])) % 26) for i in range(n) if a[i] in VOWELS)
        c_diffs = set(((ord(b[i]) - ord(a[i])) % 26) for i in range(n) if a[i] not in VOWELS)
        if len(v_diffs) <= 1 and len(c_diffs) <= 1 and (v_diffs or c_diffs):
            vd = next(iter(v_diffs), 0)
            cd = next(iter(c_diffs), 0)
            cands.append(('vc_const', ''.join(chr_v(val(x) + (vd if x in VOWELS else cd)) for x in c), (vd, cd)))

    # 6. Double-length expansion (DUNE -> BGSXLQCH: -2,+2 per letter)
    if len(b) == 2 * len(a):
        d1 = set(((ord(b[2*i]) - ord(a[i])) % 26) for i in range(len(a)))
        d2 = set(((ord(b[2*i+1]) - ord(a[i])) % 26) for i in range(len(a)))
        if len(d1) == 1 and len(d2) == 1:
            k1, k2 = next(iter(d1)), next(iter(d2))
            cands.append(('expand2', ''.join(chr_v(val(x)+k1) + chr_v(val(x)+k2) for x in c), (k1, k2)))
    return cands

# Quick test across all 254 using P40 keys
matched_p40 = 0
unsolved = []
for item in parsed:
    qn = item['q_num']
    fix = vis_fixes.get(qn, {})
    qt = fix.get('question_text', item['question_text'])
    opts = fix.get('options', item['options'])
    ans_idx = p40_ans[qn] - 1
    ans_str = opts[ans_idx].strip()

    terms = parse_analogy_terms(qt)
    solved = False
    # Handle 2-example prompt (P1:R1, P2:R2, Q:?)
    if len(terms) >= 3 and terms[0][0] == 'pair':
        (_, a1, b1), (_, a2, b2), (_, c, _) = terms[0], terms[1], terms[-1]
        c1 = {res for _, res, _ in infer_and_apply(a1, b1, c)}
        c2 = {res for _, res, _ in infer_and_apply(a2, b2, c)}
        both = c1 & c2
        ans_clean = ans_str.replace(' ', '')
        if ans_clean in both or (c1 and ans_clean in c1 and not c2):
            solved = True
    elif terms and all(isinstance(t, tuple) and len(t) == 2 for t in terms):
        if len(terms) == 2 and '?' not in terms[0][0] and '?' not in terms[0][1]:
            (a, b), (c, d) = terms[0], terms[1]
            if not a and b:
                pass
            if '?' in d or '_' in d or d == '':
                cands = infer_and_apply(a, b, c)
                for tag, res, info in cands:
                    if res == ans_str.replace(' ', ''):
                        solved = True
                        break
            elif '?' in c:
                # reverse rule ? : d -> find option that produces d
                for o_i, opt in enumerate(opts):
                    cands = infer_and_apply(a, b, opt)
                    if any(res == d.replace(' ', '') for _, res, _ in cands):
                        if o_i == ans_idx:
                            solved = True
                            break
        elif len(terms) == 3 and ('?' in terms[2][1] or '_' in terms[2][1] or terms[2][1] == ''):
            (a1, b1), (a2, b2), (c, _) = terms[0], terms[1], terms[2]
            c1 = {res for _, res, _ in infer_and_apply(a1, b1, c)}
            c2 = {res for _, res, _ in infer_and_apply(a2, b2, c)}
            if ans_str.replace(' ', '') in (c1 & c2):
                solved = True

    if solved:
        matched_p40 += 1
    else:
        unsolved.append((qn, qt, opts, p40_ans[qn], exps.get(qn, {}).get('ans'), exps.get(qn, {}).get('text', '')[:80]))

print(f"\nQuick Solver confirmed P40 key: {matched_p40}/254! Remaining to verify/expand solver: {len(unsolved)}")
for qn, qt, opts, pa, ea, et in unsolved:
    print(f"  UNSOLVED Q{qn:3d} (P40={pa}, Exp={ea}): {qt[:85]} | opts={opts} | exp={et[:60]}")
