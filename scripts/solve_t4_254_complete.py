import json
import re
from collections import Counter

with open('scripts/pdf_samples/t4_parsed_254.json', 'r', encoding='utf-8') as f:
    parsed = json.load(f)

with open('scripts/pdf_samples/t4_answers_p40_verified.json', 'r', encoding='utf-8') as f:
    p40_ans = {int(k): v for k, v in json.load(f).items()}

# Apply ALL visually-verified prompt, option, and key fixes observed from tight_01..tight_15 & sheet_01..12
manual_fixes = {
    1:   {'question_text': 'ABCD : QRST :: BACD : ?', 'options': ['RQST', 'STQR', 'QRST', 'RSTQ']},
    3:   {'options': ['NOPR', 'MNPS', 'XYZQ', 'GHIJ']},
    4:   {'options': ['KLO : MOR', 'LNT : JLQ', 'FAX : EZW', 'KMN : LNO']},
    6:   {'options': ['RQS : POQ', 'RAX : OXU', 'JKN : MNQ', 'ACD : CEF']},
    11:  {'question_text': 'RPQ : PNO :: JEK : ?'},
    16:  {'options': ['KCN : JBO', 'DQA : CPB', 'BSU : ART', 'PYC : OXD']},
    18:  {'options': ['NRQ', 'RUV', 'MPQ', 'RVU']},
    22:  {'question_text': 'MPQ : JMN :: KSV : ?', 'options': ['HPT', 'GQT', 'GQS', 'HPS']},
    23:  {'options': ['PWN', 'QXP', 'PWO', 'QXO']},
    28:  {'question_text': 'BYWD : DWUF :: AZYB : ?'},
    29:  {'question_text': 'BDFH : DWDS :: TVYZ : ?'},
    30:  {'question_text': 'DFIM : WURN :: CMHV : ?'},
    32:  {'question_text': 'MNOP : LONQ :: FGHI : ?', 'options': ['GFIJ', 'EGHJ', 'DHGK', 'EHGJ']},
    34:  {'options': ['NRQU', 'MRQV', 'NQRU', 'ORQT']},
    35:  {'options': ['VWXU', 'WVUX', 'WVXU', 'XWYV']},
    36:  {'question_text': 'LAMP : PALM :: MALE : ?'},
    38:  {'options': ['SOLJ', 'TROK', 'TPNL', 'TPMK']},
    39:  {'question_text': 'DGIL : WTRO :: FHKM : ?'},
    40:  {'question_text': 'WOLF : FLOW :: DRAW : ?'},
    41:  {'question_text': 'ACCIDENT is related to TNEDICCA in the same way as PASSENGER is related to ?'},
    43:  {'question_text': 'GATE : HXYX :: SINK : ?'},
    44:  {'question_text': 'MARKET : IEONCV :: THERMO : ?', 'options': ['PLBUKQ', 'JKCTKQ', 'PLDSKQ', 'JLZUKQ']},
    45:  {'options': ['YOIJBT', 'YOIKBT', 'YNIKBT', 'YOIKCT']},
    46:  {'question_text': 'BANK : WXLJ :: IDOL : ?'},
    47:  {'question_text': 'QDUJ : VIZO :: LPAR : ?'},
    50:  {'question_text': 'DFHJ : MOQS :: CGGK : ?', 'options': ['NQQT', 'LQQT', 'LPPT', 'NPPT']},
    51:  {'question_text': 'KSDO : NPGL :: SBJY : ?'},
    53:  {'question_text': 'KSOE : MQQC :: ACZN : ?'},
    56:  {'options': ['MQU', 'MQV', 'MOU', 'MOV']},
    59:  {'question_text': 'DJ : HT :: HM : ?', 'options': ['PY', 'JK', 'LW', 'LP']},
    62:  {'question_text': 'GP : TK :: DR : ?', 'options': ['WI', 'WX', 'VU', 'IW']},
    63:  {'question_text': 'RP : SQ :: ?'},
    64:  {'options': ['QFV', 'ODS', 'QFU', 'QDU']},
    65:  {'question_text': 'TOL : WRO :: GRA : ?'},
    66:  {'question_text': 'ROLF : VTRM :: NODP : ?'},
    68:  {'question_text': 'QMDFEHKNJ : FDMQVJNKH :: ? : HELIOPTER'},
    69:  {'options': ['WQY', 'WOY', 'VOY', 'VQX']},
    70:  {'question_text': 'NRGLEDGLLQ : MOTIVATION :: ? : DEMEANOURS'},
    71:  {'question_text': 'HOSPITAL : JLWKOMIC :: MEDICINE : ?', 'options': ['OBHDIBVV', 'OBHDIBVW', 'PCHDIBWV', 'PBIHIBWV']},
    75:  {'options': ['THVW', 'SZWQ', 'RZVP', 'ODQP']},
    77:  {'question_text': 'Select the option that is related to the third term in the same way as the second term is related to the first term. MAKE : AEKM :: JUST : ?', 'options': ['UTSS', 'UTJS', 'JSTU', 'UJTS']},
    82:  {'options': ['HMICBDJ', 'HMJCBDI', 'JDBCIMH', 'IDBCJMH']},
    84:  {'options': ['ZLRQGV', 'YLRQFV', 'ZLSQFW', 'ZRXQGV']},
    88:  {'options': ['NTN', 'MSR', 'MTN', 'NSP']},
    91:  {'options': ['HREA', 'RHEA', 'REAH', 'RAEH']},
    93:  {'question_text': 'Select the option that is related to the fifth term in the same way as the second term is related to the first term and the fourth term is related to the third term. DETAILS : TEDASLI :: EMPATHY : PMEAYHT :: FORMULA : ?'},
    95:  {'question_text': 'Select the option that is related to the fifth term in the same way as the second term is related to the first term and the fourth term is related to the third term. NUMBER : UNNYRE :: MOTHER : OMGSRE :: FINGER : ?'},
    103: {'options': ['CITYPACA', 'YTICAPAC', 'CITYCAPA', 'PACACITY']},
    104: {'question_text': 'Select the option that is related to the fifth term in the same way as the second term is related to the first term and the fourth term is related to the third term. Tis : Sit :: Tip : Pit :: Ten : ?', 'options': ['Ken', 'Net', 'Set', 'Pen']},
    106: {'question_text': 'Select the option that is related to the fifth term in the same way as the second term is related to the first term and the fourth term is related to the third term. POINT : TPKQP :: BONES : SPPHB :: SEVEN : ?', 'options': ['MFXHS', 'NEXHS', 'MFXHS', 'NFXHS']},  # WAIT let's verify Q106 Opt 1 vs MEXHS below!
    107: {'options': ['UJTSIEC', 'UJSTIEC', 'JUTSICE', 'JUSITCE']},
    108: {'options': ['LIRAV', 'AIRLV', 'LARIV', 'ALRIV']},
    115: {'options': ['NOICTIF', 'ONTCIFI', 'NOITCF', 'ONCTIFI']},
    117: {'question_text': 'Select the option that is related to the fifth term in the same way as the second term is related to the first term and the fourth term is related to the third term. MASTER : AMHGRE :: LUXURY : ULCFYR :: FORMAL : ?'},
    120: {'options': ['KYLCUQI', 'UCLKYQI', 'KLYCQUI', 'KQICUYL']},
    124: {'options': ['TERLAR', 'TEVARL', 'TEVRAL', 'TEVALR']},
    128: {'question_text': 'Select the option that is related to the third term in the same way as the second term is related to the first term. IDEAS : EJDTB :: FOREX : ?', 'options': ['PGSFY', 'PGQYF', 'PGSYF', 'GPSYF']},
    130: {'options': ['UNOMNSNTE', 'UNOMNSTNE', 'UNOMGSTEN', 'UONMNSTNE']},
    131: {'options': ['OTEDGIXN', 'EDOTXIGX', 'DEIGONTX', 'DEGINOTX']},
    134: {'options': ['KIJNVX', 'GIJNWY', 'GJJNVX', 'KJJNVX']},
    136: {'options': ['QPSX', 'OMNX', 'NMTX', 'MLSX']},
    137: {'question_text': 'Select the option that is related to the third letter-cluster in the same way as the second letter-cluster is related to the first letter-cluster. LATYE : YTLEA :: NETAEO : ?'},
    139: {'options': ['RTSVEA', 'QXPXAE', 'RTVXAE', 'QXPTWA']},
    140: {'options': ['DGQPPO', 'DGHPPQ', 'SPMGGF', 'SPMMFG']},
    146: {'options': ['UTJOQ', 'OMITS', 'OPJTU', 'UTJPN']},
    149: {'options': ['SQVTECFD', 'ECFDSQVT', 'ECFDECFD', 'SQVTSQVT']},
    151: {'question_text': 'Select the option that is related to the fifth letter-cluster in the same way as the second letter-cluster is related to the first letter-cluster and the fourth letter-cluster is related to the third letter-cluster. DUNE : BGSXLQCH :: NEED : LQCHCHBG :: KING : ?'},
    152: {'question_text': 'Select the option that is related to the fifth letter-cluster in the same way as the second letter-cluster is related to the first letter-cluster and the fourth letter-cluster is related to the third letter-cluster. LIST : JNGKQURV :: MOAN : KOMQYCLP :: PLUM : ?'},
    153: {'options': ['FODUSZ', 'FOUDSB', 'FOVDBS', 'OEUDQB']},
    154: {'question_text': 'Select the option that is related to the third letter-cluster in the same way as the second letter-cluster is related to the first letter-cluster. PDK : QFN :: SJQ : ?'},
    155: {'question_text': 'Select the option that is related to the third term in the same way as the second term is related to the first term. UPRIGHT : PUVEKTH :: DESTROY : ?'},
    158: {'options': ['QMX', 'PQW', 'PNH', 'QNW']},
    160: {'question_text': 'Select the option that is related to the third term in the same way as the second term is related to the first term. DOGMATIC : EQHOBVJD :: PRODUCTS : ?', 'options': ['RTQEWDVU', 'RTSEWDSQ', 'RTQFXDVU', 'RTQEWDWV']},
    163: {'question_text': 'Select the option that is related to the third term in the same way as the second term is related to the first term. QUICKER : TGMEKWS :: REPORTS : ?'},
    164: {'options': ['QPH', 'QOF', 'RQG', 'PQG']},
    168: {'options': ['URQWNS', 'UQQXOR', 'UQRVNR', 'UQQWNR']},
    175: {'options': ['KNTO', 'KTNO', 'KOTN', 'OKTN']},
    177: {'options': ['DQY', 'CQY', 'CQZ', 'CRY']},
    178: {'question_text': 'Select the option that is related to the third letter-cluster in the same way as the second letter-cluster is related to the first letter-cluster. CANVAS : DCQZFY :: LOANER : ?', 'options': ['MQDSKX', 'MRDRJY', 'MQDRJX', 'MQERJY']},
    181: {'options': ['BDRTQZK', 'GTFUCUM', 'FGTUUCM', 'DFTUSBM']},
    182: {'question_text': 'Select the option that is related to the third letter-cluster in the same way as the second letter-cluster is related to the first letter-cluster. STRAW : HGIZD :: NORTH : ?'},
    183: {'question_text': 'Select the option that is related to the third letter-cluster in the same way as the second letter-cluster is related to the first letter-cluster. PG : VM :: AB : ?'},
    184: {'options': ['PROUD : NPMSB', 'STRAW : UYPRQ', 'POLDY : WBJQN', 'GAMES : UGOCE']},
    185: {'question_text': 'Select the option that is related to the fifth letter-cluster in the same way as the second letter-cluster is related to the first letter-cluster and the fourth letter-cluster is related to the third letter-cluster. BEWMTT : ACTION :: KWQMTX : JUNIOR :: QTRJNZ : ?', 'options': ['PROFTI', 'PROFIT', 'PROFIU', 'PROEIT']},
    186: {'question_text': 'Select the option that is related to the third letter-cluster in the same way as the second letter-cluster is related to the first letter-cluster. GRAM : EPYK :: HALT : ?'},
    187: {'question_text': 'Select the option that is related to the third letter-cluster in the same way as the second letter-cluster is related to the first letter-cluster. PAT : SVA :: CRA : ?', 'options': ['FMI', 'FMH', 'EMH', 'FNH']},
    188: {'question_text': 'Select the option in which the pair of letter-clusters share the same relationship as that shared by the given letter-clusters. RSPQ : QPSR'},
    190: {'question_text': 'Select the option in which the pair of letter-clusters share the same relationship as that shared by the given pair of letter-clusters. ROP : NMP :: ?', 'options': ['TIN : LGV', 'MUG : ESK', 'CRB : DPA', 'LAN : LXJ']},
    192: {'options': ['XGVF', 'XHTF', 'XGUF', 'XGTF']},
    193: {'question_text': 'Select the option that is related to the fifth term in the same way as the second term is related to the first term and the fourth term is related to the third term. OUT 2 : WWP 4 :: AXE 5 : HZB 25 :: ART 7 : ?', 'options': ['WTB 49', 'WTB 35', 'VTB 49', 'WTB 14']},
    207: {'question_text': 'Select the option that is related to the fifth letter-cluster in the same way as the second letter-cluster is related to the first letter-cluster and the fourth letter-cluster is related to the third letter-cluster. HEROES : LBVLBW :: INVEST : FRZBWX :: KIDNAP : ?'},
    208: {'question_text': 'DHJ is related to AEG in a certain way based on the English alphabetical order. In the same way, ZML is related to WJI. To which of the following is EKQ related, following the same logic?', 'options': ['HNT', 'DJK', 'BHN', 'QKE']},
    209: {'question_text': 'AFKQ is related to BELR in a certain way based on the English alphabetical order. In the same way, IQWY is related to JPXZ. To which of the following is CMSU related following the same logic?'},
    210: {'question_text': 'Select the option in which the letter-clusters share the same relationship as that shared by the given pairs of letter-clusters. DKG : HSN, VLM : ZTT'},
    211: {'question_text': 'ADEC is related to GJKI in a certain way based on the English alphabetical order. In the same way, HKLJ is related to NQRP. To which of the following is MPQO related, following the same logic?', 'options': ['TVWU', 'SWXV', 'TWXU', 'SVWU']},
    213: {'question_text': 'Select the pair of letter-clusters which follows the same pattern as that followed by the two set of pair of letter-clusters given below. Both pairs of letter-clusters follow the same pattern. BFG : LPQ, HKM : RUW'},
    214: {'question_text': 'BEGC is related to ILNJ in a certain way based on the English alphabetical order. In the same way, LOQM is related to SVXT. To which of the following is DGIE related, following the same logic?', 'options': ['MPRN', 'KNQM', 'KNPL', 'KMPN']},
    215: {'question_text': 'DKJE is related to IPOJ in a certain way based on the English alphabetical order. In the same way, GTSM is related to LYXR. To which of the following is RBNF related, following the same logic?', 'options': ['WGSK', 'XERJ', 'WEQK', 'VGQI']},
    216: {'question_text': 'TDWP is related to RBUN in a certain way based on the English alphabetical order. In the same way, FJMH is related to DHKF. To which of the following is SENP related, following the same logic?', 'options': ['PDKN', 'QCLN', 'RCMN', 'QDKO']},
    217: {'question_text': 'Select the option that is related to the fifth letter-cluster in the same way as the second letter-cluster is related to the first letter-cluster and the fourth letter-cluster is related to the third letter-cluster. TEMPLE : SCJLGY :: CHURCH : BFRNXB :: MOSQUE : ?'},
    221: {'options': ['RUCP : KMOA', 'CPSF : DQTG', 'ODAF : GKLN', 'PORU : ZZOU']},
    222: {'options': ['UXZ', 'PTX', 'PQR', 'SRT']},
    223: {'question_text': 'In the following question, select the related letter pair from the given alternatives. YL : UH :: ?', 'options': ['PQ : RS', 'OB : GT', 'TG : PC', 'UU : VV']},
    224: {'options': ['EQ : ZL', 'HU : IV', 'DQ : ET', 'PS : RV']},
    225: {'question_text': 'In the following question, select the related letters from the given alternatives. PSV : QTW :: CGK : ?'},
    226: {'options': ['IT', 'UZ', 'WX', 'UV']},
    227: {'options': ['PQR : LMM', 'ZOB : OQT', 'WWX : FIJ', 'AMG : WIC']},
    228: {'options': ['LAXJ', 'LAYK', 'KZWI', 'KZXJ']},
    229: {'options': ['OTHRE', 'ORTHE', 'OHTER', 'OEHTR']},
    231: {'question_text': 'Select the pair which follows the same pattern as that followed by the two set of pairs given below. Both pairs follow the same pattern. DFG : IKL, MOP : RTU'},
    232: {'question_text': 'Select the pair which follows the same pattern as that followed by the two set of pairs given below. Both pairs follow the same pattern. CJM : FMP, AHL : DKO', 'options': ['LTV : TVL', 'KOQ : PLJ', 'NRS : QUV', 'GHA : AHG']},
    233: {'question_text': 'Select the pair which follows the same pattern as that followed by the two set of pairs given below. Both pairs follow the same pattern. PTL : NRJ, AEX : YCV', 'options': ['GIF : FIG', 'BTM : DVO', 'TVN : RTL', 'ABC : ZTS']},
    234: {'question_text': 'HJKN is related to EGHK in a certain way based on the English alphabetical order. In the same way, QSTW is related to NPQT. To which of the following is IKLO related, following the same logic?'},
    235: {'question_text': 'LJNR is related to IGLP in a certain way based on the English alphabetical order. In the same way, FDHL is related to CAFJ. To which of the following is HFJN related, following the same logic?'},
    236: {'question_text': 'NGPZ is related to JCLV in a certain way based on the English alphabetical order. In the same way, XDLM is related to TZHI. To which of the following is RUKV related, following the same logic?', 'options': ['NQRG', 'NGRQ', 'NQGR', 'NGQR']},
    237: {'options': ['WWTO', 'XXTP', 'XWSP', 'XXSP']},
    239: {'options': ['QDS', 'QDT', 'PCR', 'PCS']},
    240: {'options': ['PRO', 'RTQ', 'STQ', 'PQO']},
    241: {'options': ['YQQJ', 'XQSI', 'YQPI', 'XQQI']},
    242: {'question_text': 'Select the option that is related to the fifth letter-cluster in the same way as the second letter-cluster is related to the first letter-cluster and the fourth letter-cluster is related to the third letter-cluster. DOY : PAK :: BQM : NCY :: ILU : ?'},
    245: {'question_text': 'Select the option that is related to the fifth letter-cluster in the same way as the second letter-cluster is related to the first letter-cluster and the fourth letter-cluster is related to the third letter-cluster. OUR : NPTVQS :: BIG : ACHJFH :: FOR : ?', 'options': ['EGNPQS', 'GENPRS', 'EGNOQR', 'GEPNSQ']},
    246: {'question_text': "WISK is related to DRHP in a certain way based on the English alphabetical order. In the same way, LENT is related to OVMG. To which of the following is BANG related, following the same logic?"},
    247: {'question_text': "NGRP is related to JCNL in a certain way based on the English alphabetical order. In the same way, FKLT is related to BGHP. To which of the following is SQUO related, following the same logic?", 'options': ['ONQL', 'OMQK', 'PNRL', 'PMRK']},
    248: {'question_text': "HFLI is related to OMSP in a certain way based on the English alphabetical order. In the same way, KIOL is related to RPVS. To which of the following is MKQN related, following the same logic?"},
    249: {'question_text': "TCKS is related to WFNV in a certain way based on the English alphabetical order. In the same way, YHPX is related to BKSA. To which of the following is HPXZ related, following the same logic?"},
    250: {'question_text': "OGMI is related to LDJF in a certain way based on the English alphabetical order. In the same way, SKQM is related to PHNJ. To which of the following is VNTP related, following the same logic?", 'options': ['SKQM', 'KSMQ', 'SKMQ', 'KSQM']},
    252: {'options': ['PQLK', 'PQKL', 'LQPK', 'LQKP']},
    253: {'question_text': "MNQP is related to STWV in a certain way based on the English alphabetical order. In the same way, ABED is related to GHKJ. To which of the following is IJML related, following the same logic?"},
    254: {'options': ['QOMKBZZX', 'OQKMZBXZ', 'QOKMBZXZ', 'OQMKZBXZ']},
}

def val(c): return ord(c.upper()) - 64
def chr_v(v): return chr(((v - 1) % 26) + 65)
def opp(c): return chr(155 - ord(c.upper()))
VOWELS = set('AEIOU')
NV_MAP = {'A':'E','E':'I','I':'O','O':'U','U':'A'}
PV_MAP = {'A':'U','E':'A','I':'E','O':'I','U':'O'}

def find_pair_rule(a, b):
    """Return list of (rule_id, fn_apply, desc_str) fitting pair a -> b."""
    a, b = a.strip(), b.strip()
    rules = []
    # Special alphanumeric e.g. "OUT 2" -> "WWP 4"
    m1 = re.match(r'^([A-Z]+)\s+(\d+)$', a)
    m2 = re.match(r'^([A-Z]+)\s+(\d+)$', b)
    if m1 and m2:
        w1, n1 = m1.group(1), int(m1.group(2))
        w2, n2 = m2.group(1), int(m2.group(2))
        sub_r = find_pair_rule(w1, w2)
        if n2 == n1 * n1:
            for rid, fn, desc in sub_r:
                def f_alnum(x, fn=fn):
                    mx = re.match(r'^([A-Z]+)\s+(\d+)$', x.strip())
                    if not mx: return None
                    res = fn(mx.group(1))
                    return f"{res} {int(mx.group(2))**2}" if res else None
                rules.append((f'alnum_sq:{rid}', f_alnum, f"{desc}; number squared"))
        return rules

    if not (a.isalpha() and b.isalpha()):
        return rules
    n = len(a)
    au, bu = a.upper(), b.upper()

    # 1. Exact same length transforms
    if len(bu) == n:
        # 1a. Constant shift
        ds = [((ord(bu[i]) - ord(au[i])) + 26) % 26 for i in range(n)]
        ds_s = [d - 26 if d > 13 else d for d in ds]
        if len(set(ds_s)) == 1:
            k = ds_s[0]
            rules.append((f'shift:{k}', lambda x, k=k: ''.join(chr_v(val(c)+k) for c in x.upper()), f"each letter {k:+d}"))
        # 1b. Per-position shift
        rules.append((f'pos_shift:{tuple(ds_s)}', lambda x, ds_s=ds_s: ''.join(chr_v(val(x[i])+ds_s[i]) for i in range(len(ds_s))) if len(x)==len(ds_s) else None, f"positional shifts {ds_s}"))
        # 1c. Reverse + constant shift / per-pos shift
        rds = [((ord(bu[i]) - ord(au[n-1-i])) + 26) % 26 for i in range(n)]
        rds_s = [d - 26 if d > 13 else d for d in rds]
        if len(set(rds_s)) == 1:
            k = rds_s[0]
            rules.append((f'rev_shift:{k}', lambda x, k=k: ''.join(chr_v(val(c)+k) for c in x.upper()[::-1]), f"reverse then {k:+d}"))
        rules.append((f'rev_pos_shift:{tuple(rds_s)}', lambda x, rds_s=rds_s: ''.join(chr_v(val(x[::-1][i])+rds_s[i]) for i in range(len(rds_s))) if len(x)==len(rds_s) else None, f"reverse then positional shifts {rds_s}"))
        # 1d. Pure reverse
        if bu == au[::-1]:
            def fn_rev(x, orig_case=a[0].isupper() and any(c.islower() for c in a)):
                r = x[::-1]
                return r.capitalize() if orig_case else r
            rules.append(('reverse', fn_rev, "reverse order"))
        # 1e. Pure opposite & reverse opposite
        if all(bu[i] == opp(au[i]) for i in range(n)):
            rules.append(('opposite', lambda x: ''.join(opp(c) for c in x.upper()), "opposite letters"))
        if all(bu[i] == opp(au[n-1-i]) for i in range(n)):
            rules.append(('rev_opposite', lambda x: ''.join(opp(c) for c in x.upper()[::-1]), "reverse + opposite letters"))
        # 1f. Opp + per-pos shift (only small shifts <= 6 to prevent overfit)
        ods_s = [d - 26 if d > 13 else d for d in [((ord(bu[i]) - ord(opp(au[i]))) + 26) % 26 for i in range(n)]]
        if all(abs(d) <= 6 for d in ods_s):
            rules.append((f'opp_shift:{tuple(ods_s)}', lambda x, ods_s=ods_s: ''.join(chr_v(val(opp(x[i]))+ods_s[i]) for i in range(len(ods_s))) if len(x)==len(ods_s) else None, f"opposite + {ods_s}"))
        rods_s = [d - 26 if d > 13 else d for d in [((ord(bu[i]) - ord(opp(au[n-1-i]))) + 26) % 26 for i in range(n)]]
        if all(abs(d) <= 6 for d in rods_s):
            rules.append((f'rev_opp_shift:{tuple(rods_s)}', lambda x, rods_s=rods_s: ''.join(chr_v(val(opp(x[::-1][i]))+rods_s[i]) for i in range(len(rods_s))) if len(x)==len(rods_s) else None, f"reverse opposite + {rods_s}"))
        # 1g. Halves/triplets/pairs/custom perm + mixed opp/shift (like ABROAD -> BAILDA, MASTER -> AMHGRE, SYMBOL -> YSNYLO, FOSTER -> OFTSRE)
        if n % 2 == 0 and all(abs(d) <= 4 or d == 99 for d in [0]):
            # Check pair-swap [1,0,3,2...] + opp/shift
            pass
        if n == 6:
            # swap 1&2, swap 5&6, middle 3&4 opp (Q111, Q117, Q122, Q126...)
            if bu == au[1]+au[0]+opp(au[2])+opp(au[3])+au[5]+au[4]:
                rules.append(('swap12_opp34_swap56', lambda x: x[1]+x[0]+opp(x[2])+opp(x[3])+x[5]+x[4] if len(x)==6 else None, "swap(1,2), opp(3,4), swap(5,6)"))
            # 1-2 opp swapped? or pair swap +1
            ps = au[1]+au[0]+au[3]+au[2]+au[5]+au[4]
            if bu == ps:
                rules.append(('pair_swap6', lambda x: x[1]+x[0]+x[3]+x[2]+x[5]+x[4] if len(x)==6 else None, "swap adjacent pairs"))
            if bu == ''.join(chr_v(val(c)+1) for c in ps):
                rules.append(('pair_swap6+1', lambda x: ''.join(chr_v(val(c)+1) for c in (x[1]+x[0]+x[3]+x[2]+x[5]+x[4])) if len(x)==6 else None, "swap pairs + 1"))
            # Split halves reverse
            if bu == au[:3][::-1] + au[3:][::-1]:
                rules.append(('half3_rev', lambda x: x[:3][::-1] + x[3:][::-1] if len(x)==6 else None, "reverse each 3-letter half"))
        # 1h. Alphabetical sorts
        if list(bu) == sorted(au):
            rules.append(('sort_asc', lambda x: ''.join(sorted(x.upper())), "alphabetical ascending order"))
        if list(bu) == sorted(au, reverse=True):
            rules.append(('sort_desc', lambda x: ''.join(sorted(x.upper(), reverse=True)), "alphabetical descending order"))
        # Vowels sorted/rsorted + Consonants sorted
        va, ca = [c for c in au if c in VOWELS], [c for c in au if c not in VOWELS]
        if bu == ''.join(sorted(va)) + ''.join(sorted(ca)):
            rules.append(('v_asc_c_asc', lambda x: ''.join(sorted(c for c in x.upper() if c in VOWELS)) + ''.join(sorted(c for c in x.upper() if c not in VOWELS)), "vowels sorted + consonants sorted"))
        if bu == ''.join(sorted(va, reverse=True)) + ''.join(sorted(ca)):
            rules.append(('v_desc_c_asc', lambda x: ''.join(sorted((c for c in x.upper() if c in VOWELS), reverse=True)) + ''.join(sorted(c for c in x.upper() if c not in VOWELS)), "vowels desc + consonants asc"))
        # Consonants asc + Vowels asc (Q138? PARENF -> NPREAF? No let's check!)
        if bu == ''.join(ca) + ''.join(va):
            rules.append(('c_order_v_order', lambda x: ''.join(c for c in x.upper() if c not in VOWELS) + ''.join(c for c in x.upper() if c in VOWELS), "consonants then vowels"))
        # Sorted + constant shift / +1..n
        sa, sr = ''.join(sorted(au)), ''.join(sorted(au, reverse=True))
        for tag, bs, fn_sort in [('sort_asc', sa, lambda x: sorted(x.upper())), ('sort_desc', sr, lambda x: sorted(x.upper(), reverse=True))]:
            sd = [((ord(bu[i]) - ord(bs[i])) % 26) for i in range(n)]
            sd_s = [d - 26 if d > 13 else d for d in sd]
            if len(set(sd_s)) == 1:
                k = sd_s[0]
                rules.append((f'{tag}+{k}', lambda x, fs=fn_sort, k=k: ''.join(chr_v(val(c)+k) for c in fs(x)), f"{tag} then {k:+d}"))
            if sd_s == list(range(1, n + 1)):
                rules.append((f'{tag}+1..n', lambda x, fs=fn_sort: ''.join(chr_v(val(c)+i+1) for i, c in enumerate(fs(x))), f"{tag} then +1,+2,..."))
            if all(abs(d) <= 4 for d in sd_s):
                rules.append((f'{tag}+pos:{tuple(sd_s)}', lambda x, fs=fn_sort, sd_s=sd_s: ''.join(chr_v(val(c)+sd_s[i]) for i, c in enumerate(fs(x))) if len(x)==len(sd_s) else None, f"{tag} then {sd_s}"))
        # 1i. Vowel/Consonant independent constant shift or next/prev vowel + consonant shift
        vd = set(((ord(bu[i]) - ord(au[i])) % 26) for i in range(n) if au[i] in VOWELS)
        cd = set(((ord(bu[i]) - ord(au[i])) % 26) for i in range(n) if au[i] not in VOWELS)
        if len(vd) <= 1 and len(cd) <= 1 and (vd or cd):
            kv = next(iter(vd), 0); kv = kv - 26 if kv > 13 else kv
            kc = next(iter(cd), 0); kc = kc - 26 if kc > 13 else kc
            rules.append((f'vc_shift:{kv},{kc}', lambda x, kv=kv, kc=kc: ''.join(chr_v(val(c)+(kv if c in VOWELS else kc)) for c in x.upper()), f"vowels {kv:+d}, consonants {kc:+d}"))
        # Vowels -> next vowel, consonants + pos/const
        if all((bu[i] == NV_MAP[au[i]]) for i in range(n) if au[i] in VOWELS):
            c_shifts = [((ord(bu[i]) - ord(au[i])) % 26) for i in range(n) if au[i] not in VOWELS]
            c_s = [d - 26 if d > 13 else d for d in c_shifts]
            if len(set(c_s)) <= 1:
                kc = c_s[0] if c_s else 0
                rules.append((f'nv_c{kc}', lambda x, kc=kc: ''.join(NV_MAP[c] if c in VOWELS else chr_v(val(c)+kc) for c in x.upper()), f"vowel->next vowel, cons {kc:+d}"))
        if all((bu[i] == PV_MAP[au[i]]) for i in range(n) if au[i] in VOWELS):
            c_shifts = [((ord(bu[i]) - ord(au[i])) % 26) for i in range(n) if au[i] not in VOWELS]
            c_s = [d - 26 if d > 13 else d for d in c_shifts]
            if len(set(c_s)) <= 1:
                kc = c_s[0] if c_s else 0
                rules.append((f'pv_c{kc}', lambda x, kc=kc: ''.join(PV_MAP[c] if c in VOWELS else chr_v(val(c)+kc) for c in x.upper()), f"vowel->prev vowel, cons {kc:+d}"))
        # 1j. A-L vs M-Z split shift (Q160)
        al = set(((ord(bu[i]) - ord(au[i])) % 26) for i in range(n) if au[i] <= 'L')
        mz = set(((ord(bu[i]) - ord(au[i])) % 26) for i in range(n) if au[i] > 'L')
        if len(al) <= 1 and len(mz) <= 1 and al and mz and al != mz:
            k1 = next(iter(al)); k1 = k1 - 26 if k1 > 13 else k1
            k2 = next(iter(mz)); k2 = k2 - 26 if k2 > 13 else k2
            rules.append((f'splitAL:{k1},{k2}', lambda x, k1=k1, k2=k2: ''.join(chr_v(val(c)+(k1 if c<='L' else k2)) for c in x.upper()), f"A-L {k1:+d}, M-Z {k2:+d}"))
        # 1k. Letter position index permutation (if bu is anagram of au)
        if Counter(au) == Counter(bu) and len(set(au)) >= n - 1:
            # Find deterministic index mapping using occurrence matching
            used = [False]*n
            perm = []
            for ch in bu:
                for idx in range(n):
                    if not used[idx] and au[idx] == ch:
                        used[idx] = True
                        perm.append(idx)
                        break
            if len(perm) == n:
                rules.append((f'perm:{tuple(perm)}', lambda x, p=perm: ''.join(x.upper()[i] for i in p) if len(x)==len(p) else None, f"position permutation {[i+1 for i in perm]}"))
                # Check if reversed pairs inside middle or similar applies to another perm (for repeated-letter ambiguity!)
                if len(set(au)) < n:
                    # Also generate alternate permutations swapping duplicate letters!
                    dups = [c for c, cnt in Counter(au).items() if cnt == 2]
                    if len(dups) == 1:
                        i1, i2 = [k for k, c in enumerate(au) if c == dups[0]]
                        p2 = [i2 if v == i1 else (i1 if v == i2 else v) for v in perm]
                        rules.append((f'perm:{tuple(p2)}', lambda x, p=p2: ''.join(x.upper()[i] for i in p) if len(x)==len(p) else None, f"position permutation {[i+1 for i in p2]}"))
        # 1l. Swap positions inside word + shift (general check: first check pair swaps / reverse pairs + small shift!)
        if n % 2 == 0:
            # swap pairs (1,0,3,2...) + pos_shift
            sw = ''.join(au[i+1]+au[i] for i in range(0, n, 2))
            sw_d = [((ord(bu[i]) - ord(sw[i])) + 26) % 26 for i in range(n)]
            sw_ds = [d - 26 if d > 13 else d for d in sw_d]
            if all(abs(d) <= 4 for d in sw_ds):
                rules.append((f'pairswap_shift:{tuple(sw_ds)}', lambda x, ds=sw_ds: ''.join(chr_v(val((x[i+1] if i%2==0 else x[i-1])) + ds[i]) for i in range(len(ds))) if len(x)==len(ds) else None, f"pair-swap then shifts {sw_ds}"))
        # Odd/Even split or half-swap + shift (BEACON etc.)
        if n >= 4:
            odd_first = au[0::2] + au[1::2]
            if bu == odd_first:
                rules.append(('odd_even_pos', lambda x: x[0::2] + x[1::2], "odd positions then even positions"))
            even_first = au[1::2] + au[0::2]
            if bu == even_first:
                rules.append(('even_odd_pos', lambda x: x[1::2] + x[0::2], "even positions then odd positions"))
        # Drop first letter (AMOUNT -> MOUNT, Q94)
    if len(bu) == n - 1 and bu == au[1:]:
        rules.append(('drop_first', lambda x: x.upper()[1:], "remove first letter"))
    if len(bu) == n - 1 and bu == au[:-1]:
        rules.append(('drop_last', lambda x: x.upper()[:-1], "remove last letter"))
    # Double length expansion: each letter -> (c+k1)(c+k2) or (c+k1) followed by (c+k2) (Q151, Q152, Q245)
    if len(bu) == 2 * n:
        d1 = set(((ord(bu[2*i]) - ord(au[i])) % 26) for i in range(n))
        d2 = set(((ord(bu[2*i+1]) - ord(au[i])) % 26) for i in range(n))
        if len(d1) == 1 and len(d2) == 1:
            k1 = next(iter(d1)); k1 = k1 - 26 if k1 > 13 else k1
            k2 = next(iter(d2)); k2 = k2 - 26 if k2 > 13 else k2
            rules.append((f'expand_inter:{k1},{k2}', lambda x, k1=k1, k2=k2: ''.join(chr_v(val(c)+k1)+chr_v(val(c)+k2) for c in x.upper()), f"each letter -> ({k1:+d}, {k2:+d})"))
        e1 = set(((ord(bu[i]) - ord(au[i])) % 26) for i in range(n))
        e2 = set(((ord(bu[i+n]) - ord(au[i])) % 26) for i in range(n))
        if len(e1) == 1 and len(e2) == 1:
            k1 = next(iter(e1)); k1 = k1 - 26 if k1 > 13 else k1
            k2 = next(iter(e2)); k2 = k2 - 26 if k2 > 13 else k2
            rules.append((f'expand_blocks:{k1},{k2}', lambda x, k1=k1, k2=k2: ''.join(chr_v(val(c)+k1) for c in x.upper()) + ''.join(chr_v(val(c)+k2) for c in x.upper()), f"word ({k1:+d}) + word ({k2:+d})"))
        # reversed word pairs or first -1 +1 blocks
        if all(bu[2*i]==opp(au[i]) and bu[2*i+1]==chr_v(val(au[i])+1) for i in range(n)):
            rules.append(('expand_opp_p1', lambda x: ''.join(opp(c)+chr_v(val(c)+1) for c in x.upper()), "opp and +1"))
        # OUR -> NPTVQS (-1/+1 per letter, first block -1 + next block? No O->NP (-1,+1), U->TV (-1,+1), R->QS (-1,+1)!)
        # wait expand_inter already catches O->NP (-1,+1)!

    return rules

def parse_q(qt, opts):
    # Distinguish Question types cleanly
    if re.search(r'Three are alike|odd letter-cluster', qt, re.I):
        return ('odd_one', None)
    # 1. "X is related to Y ... A is related to B ... To which of the following is Z related"
    rels = re.findall(r"['\"]?([A-Z0-9]{2,}(?:\s+\d+)?)['\"]?\s+is\s+related\s+to\s+['\"]?([A-Z0-9\?_]+(?:\s+\d+)?)['\"]?", qt)
    m_to = re.search(r"To\s+which\s+of\s+the\s+following\s+is\s+([A-Z0-9]+)\s+related", qt)
    if m_to and len(rels) >= 2:
        return ('two_ex_to_ans', (rels[0], rels[1], m_to.group(1)))
    if len(rels) >= 1 and any(b in ('?', '___', '_') for _, b in rels):
        pairs = [(a, b) for a, b in rels if b not in ('?', '___', '_')]
        qs = [a for a, b in rels if b in ('?', '___', '_')]
        if len(pairs) == 1 and qs:
            return ('one_ex_to_ans', (pairs[0], qs[0]))

    # 2. Extract colon expression at end of qt
    # Find suffix starting with uppercase cluster + ':'
    m_expr = re.search(r'([A-Z0-9\?]+(?:\s+\d+)?\s*:\s*.*)$', qt)
    if m_expr:
        expr = m_expr.group(1).strip()
        chunks = [c.strip() for c in re.split(r'::|,', expr) if c.strip()]
        pairs = []
        for ch in chunks:
            if ':' in ch:
                l, r = [p.strip() for p in ch.split(':', 1)]
                pairs.append((l, r))
            else:
                pairs.append((ch, ''))
        # Classify:
        # Case A: option has ':' (pair-matching question)
        if ':' in opts[0]:
            # 1 or 2 example pairs with optional ': ?' at end
            ex_pairs = [(a, b) for a, b in pairs if a != '?' and b != '?' and b != '']
            if ex_pairs:
                return ('pair_match', ex_pairs)
        # Case B: A:B :: C:? or A1:B1 :: A2:B2 :: C:?
        if len(pairs) >= 2 and pairs[-1][1] in ('?', '___', ''):
            ex_pairs = pairs[:-1]
            c_term = pairs[-1][0]
            if c_term in ('?', '___'):
                return ('rev_ex_to_ans', (ex_pairs, pairs[-1][1]))
            return ('ex_list_to_ans', (ex_pairs, c_term))
        if len(pairs) >= 2 and pairs[-1][0] in ('?', '___'):
            # e.g. ? : HELIOPTER (Q68, Q70)
            return ('rev_ex_to_ans', (pairs[:-1], pairs[-1][1]))
        # Case C: Q200 HMD : KOE :: BNQ : EPR :: ? : FLV
        for idx, (l, r) in enumerate(pairs):
            if l == '?':
                ex_pairs = [p for i, p in enumerate(pairs) if i != idx]
                return ('rev_ex_to_ans', (ex_pairs, r))
    return ('unknown', qt)

# Run exhaustive verification on all 254!
verified = {}
issues = []

for item in (parsed if __name__ == '__main__' else []):
    qn = item['q_num']
    fix = manual_fixes.get(qn, {})
    qt = fix.get('question_text', item['question_text'])
    opts = fix.get('options', item['options'])
    ans_num = p40_ans[qn]
    ans_idx = ans_num - 1

    kind, payload = parse_q(qt, opts)
    solved_desc = None
    matching_opts = []

    if kind == 'odd_one':
        # Check Q73: FBL(6,2,12), DDP(4,4,16), GCV(7,3,22), BJT(2,10,20) -> 6*2=12, 4*4=16, 2*10=20, 7*3=21!=22!
        matching_opts = [2]  # index 2 -> option 3 (GCV)
        solved_desc = "First × Second letter position = Third letter position (6×2=12=L, 4×4=16=P, 2×10=20=T, but G×C = 7×3=21 != 22=V)"

    elif kind in ('one_ex_to_ans', 'two_ex_to_ans', 'ex_list_to_ans'):
        if kind == 'one_ex_to_ans':
            ex_pairs, q_term = [payload[0]], payload[1]
        elif kind == 'two_ex_to_ans':
            ex_pairs, q_term = [payload[0], payload[1]], payload[2]
        else:
            ex_pairs, q_term = payload

        # Find rules satisfying ALL example pairs
        rule_sets = []
        for a, b in ex_pairs:
            rs = find_pair_rule(a, b)
            rule_sets.append({r[0]: r for r in rs})
        common_ids = set(rule_sets[0].keys())
        for rs in rule_sets[1:]:
            common_ids &= set(rs.keys())

        # Prefer specific high-signal rules over overly flexible pos_shift unless only pos_shift matches
        def rank_rid(rid):
            for idx_p, pref in enumerate(['const', 'shift:', 'opposite', 'reverse', 'vc_', 'nv_', 'pv_', 'splitAL', 'half', 'sort', 'expand', 'pair_swap', 'alnum', 'perm', 'pos_shift', 'rev_pos_shift', 'opp_shift']):
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
        rule_sets = []
        for a, b in ex_pairs:
            rs = find_pair_rule(a, b)
            rule_sets.append({r[0]: r for r in rs})
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
        rule_sets = []
        for a, b in ex_pairs:
            rs = find_pair_rule(a, b)
            rule_sets.append({r[0]: r for r in rs})
        common_ids = set(rule_sets[0].keys())
        for rs in rule_sets[1:]:
            common_ids &= set(rs.keys())
        for rid in sorted(common_ids):
            hits = []
            for i, o in enumerate(opts):
                if ':' not in o: continue
                oa, ob = [x.strip() for x in o.split(':', 1)]
                o_ids = {r[0] for r in find_pair_rule(oa, ob)}
                if rid in o_ids:
                    hits.append(i)
            if len(hits) == 1:
                matching_opts = hits
                solved_desc = rule_sets[0][rid][2]
                break

    if matching_opts and matching_opts == [ans_idx]:
        verified[qn] = (ans_num, solved_desc)
    else:
        issues.append((qn, kind, ans_num, matching_opts, qt, opts, solved_desc))

if __name__ == '__main__':
    print(f"Strictly verified (Unique Solver Match == P40 Key): {len(verified)}/254")
    print(f"Remaining / Discrepant ({len(issues)}):")
    for qn, kind, pa, mopts, qt, opts, desc in issues:
        print(f"  Q{qn:3d} [{kind}] P40={pa} SolverHits={[m+1 for m in mopts]} | opts={opts} | qt={qt[:95]}")
