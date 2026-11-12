import json, re, sys
sys.path.insert(0, 'scripts')

# 1. Load raw parsed + v3 solver internals cleanly
with open('scripts/pdf_samples/t4_parsed_254.json', 'r', encoding='utf-8') as f:
    raw = json.load(f)

with open('scripts/solve_t4_254_v3.py', 'r', encoding='utf-8') as f:
    v3_src = f.read()

ns = {}
cut = v3_src.find('\nverified = {}')
exec(v3_src[:cut], ns)

manual = ns['manual']
p40_ans = ns['p40_ans']
normalize_prompt = ns['normalize_prompt']
parse_q_v3 = ns['parse_q_v3']
find_pair_rule_v3 = ns['find_pair_rule_v3']
val = ns['val']
chr_v = ns['chr_v']
opp = ns['opp']

# Improved priority order: put simple pos_shift / rev_pos_shift BEFORE compound sort_asc+pos / sort_desc+pos
# Keep pure sort_asc / sort_desc (no shift) high for pure alphabetical rearrangement questions (e.g., Q74).
PRIORITY_PREFIXES_V4 = [
    'const:', 'shift:', 'opposite', 'reverse', 'rev_opposite',
    'sort_asc', 'sort_desc', 'v_asc_c_asc', 'v_desc_c_asc', 'c_order_v_order',
    'pos_shift:', 'vc_shift:', 'nv_c', 'pv_c', 'splitAL_',
    'rev_shift:', 'rev_pos_shift:', 'opp_shift:', 'rev_opp_shift:', 'rev_inc_1n',
    'half', 'pair_swap', 'expand', 'alnum_sq:',
    'named_perm:', 'swap', 'blkperm:', 'perm_', 'rev_', 'opp_perm:',
    'alt_opp', 'mix_oppsh:', 'q87_', 'sw01', 'q159_', 'q180_', 'q181_',
    'sort_asc+', 'sort_desc+',
]

def rank_rid_v4(rid):
    # Distinguish pure 'sort_asc'/'sort_desc' from 'sort_asc+...' / 'sort_desc+...'
    if rid == 'sort_asc':
        return (5, rid)
    if rid == 'sort_desc':
        return (6, rid)
    for i, pref in enumerate(PRIORITY_PREFIXES_V4):
        if pref in ('sort_asc', 'sort_desc'):
            continue
        if rid.startswith(pref) or rid == pref:
            return (i, rid)
    return (len(PRIORITY_PREFIXES_V4), rid)

# 2. Import our visually verified exam tag builder
from verify_254_exams_table import norm_exam_name

# 3. Complete English prose polish + Batch 5 newline formatting
def polish_question_text(qt, qn):
    s = normalize_prompt(qt)
    s = re.sub(r'^\([^)]*\)\s*', '', s)
    s = re.sub(r'\blet\.?\s*[- ]*\s*ter\s*[- ]*\s*c[hl]?[au]?s[- ]*\.?\s*ter', 'letter-cluster', s, flags=re.I)
    s = re.sub(r'\blet[- ]\.\s*ter', 'letter', s, flags=re.I)
    s = re.sub(r'\blet\.?\s*ter', 'letter', s, flags=re.I)
    s = re.sub(r'letter\.\s*cluster', 'letter-cluster', s, flags=re.I)
    s = re.sub(r'\blet-\s*\.\s*(letter-cluster)', r'\1', s, flags=re.I)
    s = re.sub(r'\b[iI]etter[- ]*c[hl]?[au]ster|\bletter[- ]*c[hiu]uster|\bletter[- ]*duster|\blettercluster|\bletiercluster', 'letter-cluster', s, flags=re.I)
    s = re.sub(r'\bsecond-cluster\b', 'second letter-cluster', s, flags=re.I)
    s = re.sub(r'\blet-\s+ter', 'letter', s, flags=re.I)
    s = re.sub(r'\bter-\s*cluster\b', 'letter-cluster', s, flags=re.I)
    s = re.sub(r'first\s+letter-clusterand', 'first letter-cluster and', s, flags=re.I)

    split_pats = [
        (r'andmustnotberelated', 'and must not be related'),
        (r'mustnotberelated', 'must not be related'),
        (r'numberofconsonants', 'number of consonants'),
        (r'toeach', 'to each'), (r'otherbased', 'other based'),
        (r'thenumber', 'the number'), (r'alikein', 'alike in'),
        (r'somemannerandone', 'some manner and one'),
        (r'somemanner', 'some manner'), (r'andone', 'and one'),
        (r'waybased', 'way based'), (r'basedon', 'based on'),
        (r'onthe', 'on the'), (r'ofthe', 'of the'),
        (r'inthe', 'in the'), (r'asthe', 'as the'), (r'tothe', 'to the'),
        (r'fromthe', 'from the'), (r'forthe', 'for the'), (r'andthe', 'and the'),
        (r'followingthe', 'following the'), (r'followingquestion', 'following question'),
        (r'sameway', 'same way'), (r'thatis', 'that is'), (r'thatare', 'that are'),
        (r'termis', 'term is'), (r'termin', 'term in'), (r'termand', 'term and'),
        (r'termfn', 'term in'), (r'fnthe', 'in the'),
        (r'clusteris', 'cluster is'), (r'clustersare', 'clusters are'),
        (r'clusterand', 'cluster and'), (r'whichof', 'which of'),
        (r'Selectthe', 'Select the'), (r'followingsame', 'following same'),
        (r'samelogic', 'same logic'), (r'followingis', 'following is'),
        (r'isrelated', 'is related'), (r'relatedto', 'related to'),
        (r'samerelationship', 'same relationship'),
        (r'thatsha\b', 'that shared'), (r'sharedby', 'shared by'),
        (r'ofletter-clusters', 'of letter-clusters'),
        (r'secondternis', 'second term is'), (r'secondterm', 'second term'),
        (r'fifthterin', 'fifth term'), (r'fourthtem', 'fourth term'),
        (r'thefth', 'the fifth'), (r'theffth', 'the fifth'),
        (r'theopton', 'the option'), (r'theoptlon', 'the option'),
        (r'theoption', 'the option'), (r'thefourth', 'the fourth'),
        (r'thesame', 'the same'), (r'theEnglhsh', 'the English'),
        (r'theEnglish', 'the English'), (r'thattsrelated', 'that is related'),
        (r'certainway', 'certain way'),
        (r'(the)(first|second|third|fourth|fifth|sixth|option|following|same|way)', r'\1 \2'),
        (r'(first|second|third|fourth|fifth|sixth)(term|letter)', r'\1 \2'),
        (r'(way)(as|is|based|the)', r'\1 \2'),
        (r'(is|as|in|to|of|by|the|that|and|from|with|are|for)(the|same|first|second|third|fourth|fifth|sixth|option|given|one|two|four|three|letter-clusters)', r'\1 \2'),
        (r'(in|as|is|to|at|of|by)(a)\b', r'\1 \2'),
        (r'(same)(letter)', r'\1 \2'),
    ]
    for _ in range(5):
        for pat, rep in split_pats:
            s = re.sub(pat, rep, s, flags=re.I)

    word_fixes = {
        'bcen': 'been', 'bcon': 'been', 'becn': 'been',
        'optlon': 'option', 'opton': 'option', 'opuon': 'option', 'optilon': 'option', 'oplion': 'option', 'optin': 'option',
        'thlrd': 'third', 'thtrd': 'third', 'thrid': 'third', 'tnird': 'third',
        'seconcl': 'second', 'secomd': 'second', 'secnd': 'second',
        'frst': 'first', 'flrst': 'first', 'firt': 'first', 'f1rst': 'first',
        'fouith': 'fourth', 'fouth': 'fourth', 'fourt': 'fourth', 'fourtn': 'fourth',
        'fth': 'fifth', 'ffth': 'fifth', 'ftfh': 'fifth', 'fiflth': 'fifth', 'fifih': 'fifth', 'fith': 'fifth', 'tfth': 'fifth', 'tth': 'fifth', 'ftth': 'fifth', 'fiflh': 'fifth', 'flfth': 'fifth',
        'slxth': 'sixth', 'sth': 'sixth', 'stxth': 'sixth',
        'teim': 'term', 'temm': 'term', 'tenn': 'term', 'tem': 'term', 'tern': 'term', 'terrn': 'term',
        'terin': 'term', 'terins': 'terms', 'terns': 'terms', 'terims': 'terms',
        'ietter': 'letter', 'letier': 'letter', 'letler': 'letter', 'lctter': 'letter',
        'cluister': 'cluster', 'custer': 'cluster', 'ciuster': 'cluster', 'chuster': 'cluster', 'duster': 'cluster', 'clustcr': 'cluster', 'cluter': 'cluster', 'clustr': 'cluster',
        'certaln': 'certain', 'certian': 'certain', 'ceitain': 'certain',
        'englsh': 'English', 'englhsh': 'English', 'engish': 'English', 'engllsh': 'English', 'english': 'English',
        'alphabetcal': 'alphabetical', 'alphabeticai': 'alphabetical', 'alphabetlcal': 'alphabetical', 'alphabettcal': 'alphabetical',
        'loglc': 'logic', 'logle': 'logic', 'logie': 'logic', 'log1c': 'logic',
        'reiated': 'related', 'relatcd': 'related', 'relair': 'related', 'releted': 'related', 'relsted': 'related', 'relat': 'related',
        'glven': 'given', 'gtven': 'given', 'g1ven': 'given',
        'questlon': 'question', 'queston': 'question', 'questioin': 'question',
        'alternatves': 'alternatives', 'alternatlves': 'alternatives', 'altermatives': 'alternatives', 'givenaltematives': 'given alternatives', 'altematives': 'alternatives', 'altermattves': 'alternatives',
        'relatlonship': 'relationship', 'relatlonshlp': 'relationship',
        'sam': 'same', 'sane': 'same', 'sarme': 'same',
        'thc': 'the', 'tbe': 'the', 'rhe': 'the',
        's': 'is', 'ln': 'in', 'ot': 'of', 'lo': 'to', 'fn': 'in', 'tn': 'in',
        'ts': 'is', 'ls': 'is', 'fs': 'is',
        'wlth': 'with', 'whch': 'which', 'whtch': 'which', 'wh1ch': 'which',
        'manner': 'manner', 'maner': 'manner',
        'follwing': 'following', 'followmg': 'following', 'folowlng': 'following', 'followng': 'following', 'foiiowing': 'following',
        'pa1r': 'pair', 'patr': 'pair', 'pait': 'pair',
        'pains': 'pairs', 'patrs': 'pairs',
        'share': 'share', 'shere': 'share', 'snare': 'share', 'shered': 'shared', 'shated': 'shared',
        'threc': 'three', 'thiee': 'three', 'thre': 'three',
        'altke': 'alike', 'allke': 'alike',
        'odc': 'odd', 'ond': 'and', 'older': 'order',
        'repiace': 'replace', 'replac': 'replace',
        'serles': 'series', 'senes': 'series',
    }
    def repl_word(m):
        w = m.group(0)
        if w.isupper() and len(w) >= 2:
            return w
        wl = w.lower()
        if wl in word_fixes:
            rep = word_fixes[wl]
            if w[0].isupper() and rep[0].islower():
                rep = rep[0].upper() + rep[1:]
            return rep
        return w
    s = re.sub(r"\b[A-Za-z0-9']+\b", repl_word, s)
    for _ in range(2):
        for pat, rep in split_pats:
            s = re.sub(pat, rep, s, flags=re.I)

    s = re.sub(r'related\.\s*ed\b', 'related', s, flags=re.I)
    s = re.sub(r'\blet-\s*\.\s*letter-cluster', 'letter-cluster', s, flags=re.I)
    s = re.sub(r"\b(in|the|related)\s+'", r"\1 ", s)
    s = re.sub(r"(?i)([A-Za-z])'(same|option|letter)", r"\1 \2", s)
    s = re.sub(r"'(same|option|letter)", r"\1", s)
    s = re.sub(r'\bthesame\b', 'the same', s, flags=re.I)
    s = re.sub(r'\btheoption\b', 'the option', s, flags=re.I)
    s = re.sub(r'\bgliven\b', 'given', s, flags=re.I)
    s = re.sub(r'\bletiercluster\b', 'letter-cluster', s, flags=re.I)
    s = s.replace('is related way as', 'is related to the third term in the same way as')
    s = s.replace("option'that", "option that")
    s = s.replace("to'the", "to the")
    s = s.replace('consonants/ vowels', 'consonants/vowels')
    s = re.sub(r'\bletter\s*\.\s*cluster\b', 'letter-cluster', s, flags=re.I)
    s = re.sub(r'\bthird letter\s+cluster\b', 'third letter-cluster', s)
    s = re.sub(r'\bsecond letter\s+cluster\b', 'second letter-cluster', s)
    s = re.sub(r'\bfirst letter\s+cluster\b', 'first letter-cluster', s)
    s = re.sub(r'\bfourth letter\s+cluster\b', 'fourth letter-cluster', s)
    s = re.sub(r'\bfifth letter\s+cluster\b', 'fifth letter-cluster', s)
    s = re.sub(r'\bsixth letter\s+cluster\b', 'sixth letter-cluster', s)
    s = re.sub(r'\bpair of letter\s+clusters\b', 'pair of letter-clusters', s)
    s = re.sub(r'\bpairs of letter\s+clusters\b', 'pairs of letter-clusters', s)
    s = re.sub(r'in which pair of letter-clusters share same relationship',
               'in which the pair of letter-clusters share the same relationship', s)
    s = re.sub(r"\b(in|the|related)\s+'", r"\1 ", s)
    s = re.sub(r"'(same|option|letter)", r"\1", s)
    s = re.sub(r'\.\.+', '.', s)
    # Normalize :: and : WITHOUT ever turning :: into : :
    s = re.sub(r'\s*:\s*:\s*', ' :: ', s)
    s = re.sub(r'\s*(?<!:):(?!:)\s*', ' : ', s)
    # Fix OCR single ':' acting as proportion separator between pairs (e.g. Q82, Q97, Q142, Q144, Q146, Q196)
    for _ in range(3):
        s = re.sub(
            r'([A-Za-z0-9\?_]+(?:\s+\d+)?\s+:\s+[A-Za-z0-9\?_]+(?:\s+\d+)?)\s+:\s+(?=[A-Za-z0-9\?_]+(?:\s+\d+)?\s+:\s+[A-Za-z0-9\?_]+(?:\s+\d+)?)',
            r'\1 :: ',
            s,
        )
    s = re.sub(r'\s+', ' ', s).strip()

    if qn == 41:
        s = "ACCIDENT is related to TNEDICCA in the same way as PASSENGER is related to _____."

    # Clean punctuation in sentence-style exam questions ("In the same way.")
    s = re.sub(r'In the same way\.\s+', 'In the same way, ', s)

    # Put a newline between leading instruction prose and standalone expression, matching Type-V
    if not s.startswith(('Four letter-clusters', 'ACCIDENT')) and 'To which of the following' not in s and 'Which of the following is related' not in s:
        if 'following series?' in s:
            s = s.replace('following series? ', 'following series?\n', 1)
        elif 'Both pairs of letter-clusters follow the same pattern.' in s:
            s = s.replace('same pattern. ', 'same pattern.\n', 1)
        elif 'Both pairs follow the same pattern.' in s:
            s = s.replace('same pattern. ', 'same pattern.\n', 1)
        else:
            m_sep = re.match(r'^(.+?\.\s*(?:\([^)]+\)\s*)?)(.+)$', s)
            if m_sep:
                p1, p2 = m_sep.group(1).strip(), m_sep.group(2).strip()
                if ':' in p2 or ',' in p2 or '?' in p2:
                    s = f"{p1}\n{p2}"
    return s

def fmt_shift_k(k):
    return f"+{k}" if k > 0 else str(k)

FRIENDLY_PERM_ZERO = {
    (3, 1, 0, 2): "Swap the 1st and 4th letters while keeping the 2nd and 3rd letters unchanged",
    (4, 5, 6, 7, 0, 1, 2, 3): "Split into two 4-letter halves and swap the two halves",
    (2, 1, 0, 3, 6, 5, 4): "Reverse the first 3 letters, keep the middle (4th) letter fixed, and reverse the last 3 letters",
    (3, 4, 2, 0, 1, 5): "Swap the (1st, 2nd) letter pair with the (4th, 5th) letter pair while keeping the 3rd and 6th letters fixed",
    (4, 5, 6, 3, 0, 1, 2): "Swap the first 3 letters and the last 3 letters around the unchanged middle (4th) letter",
    (0, 5, 2, 3, 4, 1, 6): "Swap the 2nd and 6th letters while keeping all other letters fixed",
    (5, 2, 1, 4, 3, 0): "Swap the outer letters (1st <-> 6th), swap (2nd <-> 3rd), and swap (4th <-> 5th)",
    (4, 0, 2, 3, 1, 5): "Move the 5th letter to the front and shift the 1st and 2nd letters right (new positions: [5, 1, 3, 4, 2, 6])",
    (3, 2, 7, 6, 1, 0, 5, 4): "Pair the letters as (1,2)(3,4)(5,6)(7,8), place pairs in order (3,4), (7,8), (1,2), (5,6) and reverse each pair",
    (3, 2, 1, 0, 4, 5, 6): "Reverse the first 4 letters while keeping the last 3 letters unchanged",
    (3, 2, 1, 0, 6, 5, 4): "Reverse the first 4 letters and reverse the last 3 letters separately",
    (0, 1, 6, 7, 2, 3, 4, 5): "Keep the first 2 letters fixed, and move the last 2 letters (7th, 8th) before the middle 4 letters",
    (1, 0, 2, 3, 4, 6, 5): "Swap the first two letters (1st <-> 2nd) and the last two letters (6th <-> 7th), keeping the middle three fixed",
    (5, 6, 2, 3, 4, 0, 1): "Swap the first two letters (1st, 2nd) with the last two letters (6th, 7th), keeping the middle three fixed",
    (0, 4, 3, 2, 1, 5): "Keep the outer letters (1st & 6th) fixed and reverse the middle 4 letters",
    (2, 1, 0, 3, 4, 6, 5): "Reverse the first 3 letters, keep the middle two (4th & 5th) fixed, and swap the last two letters",
    (1, 0, 3, 2, 6, 5, 4): "Swap the 1st & 2nd letters, swap the 3rd & 4th letters, and reverse the last 3 letters",
    (1, 0, 5, 4, 3, 2): "Swap the first two letters (1st <-> 2nd) and reverse the last 4 letters",
    (3, 2, 1, 0, 5, 4): "Reverse the first 4 letters and swap the last two letters (5th <-> 6th)",
    (0, 3, 2, 1, 4): "Keep the outer letters (1st & 5th) fixed and reverse the middle 3 letters",
    (1, 0, 2, 4, 3): "Swap the first two letters (1st <-> 2nd) and the last two letters (4th <-> 5th), keeping the middle letter fixed",
}

def describe_rule_readable(rid, desc):
    if rid.startswith('alnum_sq:'):
        inner = rid.split(':', 1)[1]
        return describe_rule_readable(inner, desc.split(';')[0]).rstrip('.') + ", and square the number."
    if rid.startswith(('const:', 'const_', 'shift:')):
        nums = re.findall(r'[+-]?\d+', desc)
        k = int(nums[0]) if nums else 0
        return f"Each letter shifts by {fmt_shift_k(k)} in the English alphabetical order."
    if rid.startswith('expand') or '-> (' in desc:
        return "Each letter expands into two letters: " + desc.split('-> ')[-1] + "." if '-> ' in desc else desc + "."
    if rid == 'opposite':
        return "Each letter is replaced by its opposite letter in the English alphabet (sum of positions = 27)."
    if rid == 'reverse':
        return "The letters are written in reverse order."
    if rid == 'rev_opposite':
        return "Reverse the letter-cluster and replace each letter with its opposite letter (sum = 27)."
    if rid == 'sort_asc':
        return "Arrange all letters in alphabetical (ascending) order."
    if rid == 'sort_desc':
        return "Arrange all letters in reverse alphabetical (descending) order."
    if rid == 'v_desc_c_asc':
        return "Arrange the vowels (A, E, I, O, U) in descending alphabetical order, followed by the consonants in ascending alphabetical order."
    if rid == 'v_asc_c_asc':
        return "Arrange the vowels in ascending alphabetical order, followed by the consonants in ascending alphabetical order."
    if rid == 'c_order_v_order':
        return "Write all consonants first (in their given order), followed by all vowels."
    if rid.startswith('pos_shift:'):
        return f"Position-wise alphabetical shifts: ({', '.join(fmt_shift_k(d) for d in eval(rid.split(':')[1]))})."
    if rid.startswith('rev_shift:'):
        k = int(rid.split(':')[1])
        return f"Reverse the letter-cluster, then shift each letter by {fmt_shift_k(k)}."
    if rid.startswith('rev_pos_shift:'):
        ds = eval(rid.split(':')[1])
        return f"Reverse the letter-cluster, then apply shifts ({', '.join(fmt_shift_k(d) for d in ds)})."
    if rid == 'rev_inc_1n':
        return "Reverse the letter-cluster, then apply +1, +2, +3, ... sequentially."
    if rid.startswith('opp_shift:'):
        ds = eval(rid.split(':')[1])
        return f"Replace each letter with its opposite letter (sum = 27), then apply shifts ({', '.join(fmt_shift_k(d) for d in ds)})."
    if rid.startswith('rev_opp_shift:'):
        ds = eval(rid.split(':')[1])
        return f"Reverse the letter-cluster, take each letter's opposite (sum = 27), then apply shifts ({', '.join(fmt_shift_k(d) for d in ds)})."
    if rid.startswith('vc_shift:'):
        vk, ck = [int(x) for x in rid.split(':')[1].split(',')]
        return f"Vowels (A, E, I, O, U) shift by {fmt_shift_k(vk)} and consonants shift by {fmt_shift_k(ck)}."
    if rid == 'expand':
        return "Each letter is replaced by two letters: one immediately preceding (-1) and one immediately succeeding (+1) it."
    if rid.startswith('sort_asc+'):
        if rid == 'sort_asc+0..n-1':
            return "Arrange letters in ascending alphabetical order, then apply sequential shifts (+0, +1, +2, ...)."
        if 'pos:' in rid:
            ds = eval(rid.split(':', 1)[1])
            return f"Arrange letters in alphabetical order, then apply shifts ({', '.join(fmt_shift_k(d) for d in ds)})."
        return f"Arrange letters in alphabetical order, then apply {desc.split('then ')[1]}."
    if rid.startswith('sort_desc+'):
        return f"Arrange letters in reverse alphabetical order, then apply {desc.split('then ')[1]}."
    if rid.startswith('halfrev+'):
        k = int(rid.split('+')[1])
        base = "Split the letter-cluster into two equal halves and reverse each half separately"
        return base + (f", then shift each letter by {fmt_shift_k(k)}." if k != 0 else ".")
    if rid == 'half3_rev':
        return "Split the 6-letter cluster into two 3-letter halves and reverse each half separately."
    if rid.startswith('pair_swap'):
        if '+1' in rid:
            return "Swap every adjacent pair of letters (1st <-> 2nd, 3rd <-> 4th, 5th <-> 6th), then shift each letter by +1."
        return "Swap every adjacent pair of letters (1st <-> 2nd, 3rd <-> 4th, ...)."
    if rid.startswith('pairswap_shift:'):
        ds = eval(rid.split(':')[1])
        if all(d == 0 for d in ds):
            return "Swap every adjacent pair of letters (1st <-> 2nd, 3rd <-> 4th, ...)."
        return f"Swap adjacent pairs of letters, then apply shifts ({', '.join(fmt_shift_k(d) for d in ds)})."
    if rid == 'swap12_opp34_swap56':
        return "Swap the first two letters (1st <-> 2nd), replace the middle two letters (3rd & 4th) with their opposite letters (sum = 27), and swap the last two letters (5th <-> 6th)."
    if rid == 'rev4_oppmid_rev4':
        return "Reverse the first 4 letters, replace the middle (5th) letter with its opposite letter (sum = 27), and reverse the last 4 letters."
    if rid == 'q87_3r1_m2opp_3r1':
        return "Reverse the first 3 letters and shift each by +1, replace the middle 2 letters with their opposite letters (sum = 27), and reverse the last 3 letters and shift each by +1."
    if rid == 'swap04_mid123':
        return "Swap the 1st and 5th letters, and shift the middle three letters (2nd, 3rd, 4th) by (+1, +2, +3)."
    if rid == 'sw01_p2_sw45':
        return "Swap the first two letters (1st <-> 2nd), shift each of the middle two letters (3rd & 4th) by +2, and swap the last two letters (5th <-> 6th)."
    if rid == 'sw01p1_m1_sw34p1':
        return "Swap the first two letters and shift each by +1, shift the middle (3rd) letter by -1, and swap the last two letters and shift each by +1."
    if rid == 'rev3m1_rev3p1':
        return "Reverse the first 3 letters and shift each by -1; reverse the last 3 letters and shift each by +1."
    if rid == 'sw01_sw23m1_sw45':
        return "Swap every adjacent pair of letters (1st <-> 2nd, 3rd <-> 4th, 5th <-> 6th), and shift the middle swapped pair (3rd & 4th) by -1."
    if rid == 'sw01_p4m4p4_sw56':
        return "Swap the first two letters (1st <-> 2nd), shift the middle three letters (3rd, 4th, 5th) by (+4, -4, +4), and swap the last two letters (6th <-> 7th)."
    if rid == 'q159_opprev3_m6_rev3p3':
        return "Reverse the last 3 letters and take their opposite letters (sum = 27) for the front, shift the middle (4th) letter by -6, and reverse the first 3 letters and shift each by +3 for the back."
    if rid == 'q180_swp1m1_m1_swm1p1':
        return "Swap the first two letters (1st <-> 2nd) and apply (+1, -1), shift the middle (3rd) letter by -1, and swap the last two letters (4th <-> 5th) and apply (-1, +1)."
    if rid == 'q181_rev321_mid_rev321':
        return "Reverse the first 3 letters and the last 3 letters separately with shifts (+3, +2, +1) on each half, while keeping the middle (4th) letter unchanged."
    if rid.startswith('out4_') or rid.startswith('sw01_') or 'swap middle' in desc:
        nums = re.findall(r'[+-]?\d+', desc)
        if len(nums) >= 2:
            return f"Outer letters (1st & 4th) shift by {fmt_shift_k(int(nums[0]))}, and middle two letters (2nd & 3rd) swap positions and shift by {fmt_shift_k(int(nums[1]))}."
        return desc.replace('+(', ' ').replace(')', '') + "."
    if rid.startswith(('perm_', 'named_perm:', 'blkperm:')):
        if rid.startswith('blkperm:'):
            p = eval(rid.split(':', 1)[1])
            k = 0
        elif rid.startswith('named_perm:'):
            p_str, k_str = rid.split(':', 1)[1].rsplit('+', 1)
            p, k = eval(p_str), int(k_str)
        else:
            p_str, k_str = rid[len('perm_'):].rsplit('+', 1) if '+' in rid else (rid[len('perm_'):], '0')
            p, k = eval(p_str), int(k_str)
        if tuple(p) in FRIENDLY_PERM_ZERO:
            base = FRIENDLY_PERM_ZERO[tuple(p)]
        elif tuple(p) == (1, 2, 0, 3):
            base = "Move the 1st letter to the 3rd position while shifting 2nd & 3rd left and keeping the 4th fixed (new positions: [2, 3, 1, 4])"
        else:
            base = f"Rearrange the letter positions in the order {[i+1 for i in p]}"
        return base + (f", then shift each letter by {fmt_shift_k(k)}." if k != 0 else ".")
    if rid.startswith('mix_oppsh:'):
        combo = eval(rid.split(':', 1)[1])
        parts = []
        for idx, (typ, k) in enumerate(combo, 1):
            if typ == 'opp':
                parts.append(f"Pos {idx}: Opposite" + (f" {fmt_shift_k(k)}" if k else ""))
            else:
                parts.append(f"Pos {idx}: {fmt_shift_k(k)}")
        return "Per-position transformation: " + "; ".join(parts) + "."
    if rid.startswith('alt_opp_sh:'):
        k = int(rid.split(':')[1])
        return f"Odd positions are replaced by their opposite letters (sum = 27), and even positions shift by {fmt_shift_k(k)}."
    if rid.startswith(('splitAL:', 'splitAL_')):
        nums = re.findall(r'[+-]?\d+', desc)
        return f"Letters from A-L shift by {fmt_shift_k(int(nums[0]))}, and letters from M-Z shift by {fmt_shift_k(int(nums[1]))}." if len(nums) >= 2 else desc + "."
    if rid == 'nv_c':
        return "Consonants are replaced by the next consonant and vowels are replaced by the previous vowel (in cyclic alphabetical order)."
    if rid == 'pv_c':
        return "Consonants and vowels follow fixed position/opposite shifts."
    return desc.capitalize() + ("." if not desc.endswith('.') else "")

def letter_steps(a, b, rid):
    au, bu = a.upper(), b.upper()
    if rid.startswith('alnum_sq:'):
        m1 = re.match(r'^([A-Z]+)\s+(\d+)$', au)
        m2 = re.match(r'^([A-Z]+)\s+(\d+)$', bu)
        if m1 and m2:
            inner = rid.split(':', 1)[1]
            return letter_steps(m1.group(1), m2.group(1), inner) + [f"Number: {m1.group(2)}² = {m2.group(2)}"]
    if (rid.startswith('expand') or len(bu) == 2 * len(au)) and len(bu) == 2 * len(au):
        lines = []
        for i, ch in enumerate(au):
            c1, c2 = bu[2*i], bu[2*i+1]
            d1 = ((val(c1) - val(ch)) + 26) % 26; d1 = d1 - 26 if d1 > 13 else d1
            d2 = ((val(c2) - val(ch)) + 26) % 26; d2 = d2 - 26 if d2 > 13 else d2
            lines.append(f"{ch} ({val(ch)}) -> {fmt_shift_k(d1)} = {c1} ({val(c1)}), {fmt_shift_k(d2)} = {c2} ({val(c2)})")
        return lines
    if rid in ('reverse', 'sort_asc', 'sort_desc') or rid.startswith(('half', 'v_asc', 'c_order')) or rid == 'q94':
        if rid.startswith('half') and len(au) == len(bu) and len(au) % 2 == 0:
            h = len(au) // 2
            return [f"First half reversed: {au[:h]} -> {bu[:h]}", f"Second half reversed: {au[h:]} -> {bu[h:]}"]
        if len(au) == len(bu) or rid == 'q94':
            return [f"{au} -> {bu}"]
    if rid == 'v_desc_c_asc' and len(au) == len(bu):
        vs = ''.join(sorted((c for c in au if c in 'AEIOU'), reverse=True))
        cs = ''.join(sorted(c for c in au if c not in 'AEIOU'))
        return [f"Vowels (descending): {vs or 'None'}", f"Consonants (ascending): {cs or 'None'}", f"Combined: {au} -> {bu}"]
    if rid.startswith('blkperm:') and len(au) == len(bu):
        p = eval(rid.split(':', 1)[1])
        return [f"Rearrange positions {[i+1 for i in p]}: {au} -> {bu}"]
    if rid.startswith('named_perm:') and len(au) == len(bu):
        perm_str, k_str = rid.split(':', 1)[1].rsplit('+', 1)
        p = eval(perm_str)
        k = int(k_str)
        reord = ''.join(au[i] for i in p)
        if k == 0:
            return [f"Rearrange positions {[i+1 for i in p]}: {au} -> {bu}"]
        lines = [f"Rearrange positions {[i+1 for i in p]}: {au} -> {reord}"]
        for ca, cb in zip(reord, bu):
            lines.append(f"{ca} ({val(ca)}) {fmt_shift_k(k)} = {cb} ({val(cb)})")
        return lines
    if rid.startswith('perm_') and len(au) == len(bu):
        perm_str, k_str = rid[len('perm_'):].rsplit('+', 1) if '+' in rid else (rid[len('perm_'):], '0')
        p = eval(perm_str)
        k = int(k_str)
        reord = ''.join(au[i] for i in p)
        if k == 0:
            return [f"Rearrange positions {[i+1 for i in p]}: {au} -> {bu}"]
        lines = [f"Rearrange positions {[i+1 for i in p]}: {au} -> {reord}"]
        for ca, cb in zip(reord, bu):
            lines.append(f"{ca} ({val(ca)}) {fmt_shift_k(k)} = {cb} ({val(cb)})")
        return lines
    if rid.startswith('opp_perm:') and len(au) == len(bu):
        p = eval(rid.split(':', 1)[1])
        reord = ''.join(au[i] for i in p)
        lines = [f"Rearrange positions {[i+1 for i in p]}: {au} -> {reord}"]
        for ca, cb in zip(reord, bu):
            lines.append(f"{ca} ({val(ca)}) <-> {cb} ({val(cb)}) [opposite]")
        return lines
    if (rid.startswith('pairswap_shift:') or rid.startswith('pair_swap')) and len(au) == len(bu):
        sw = ''.join(au[i^1] if (i^1)<len(au) else au[i] for i in range(len(au)))
        if sw == bu:
            return [f"Swap adjacent pairs: {au} -> {bu}"]
        lines = [f"Swap adjacent pairs: {au} -> {sw}"]
        for ca, cb in zip(sw, bu):
            d = ((val(cb) - val(ca)) + 26) % 26
            d = d - 26 if d > 13 else d
            lines.append(f"{ca} ({val(ca)}) {fmt_shift_k(d)} = {cb} ({val(cb)})")
        return lines
    if (rid.startswith('out4_') or rid.startswith('sw01_') and len(au) == 4 or rid.startswith('sw_')) and len(au) == 4 and len(bu) == 4:
        k1 = ((val(bu[0]) - val(au[0])) + 26) % 26; k1 = k1 - 26 if k1 > 13 else k1
        k2 = ((val(bu[1]) - val(au[2])) + 26) % 26; k2 = k2 - 26 if k2 > 13 else k2
        return [
            f"Outer 1st letter: {au[0]} ({val(au[0])}) {fmt_shift_k(k1)} = {bu[0]} ({val(bu[0])})",
            f"Swap middle letters (2nd, 3rd): {au[1:3]} -> {au[2]+au[1]}; {au[2]} ({val(au[2])}) {fmt_shift_k(k2)} = {bu[1]} ({val(bu[1])}), {au[1]} ({val(au[1])}) {fmt_shift_k(k2)} = {bu[2]} ({val(bu[2])})",
            f"Outer 4th letter: {au[3]} ({val(au[3])}) {fmt_shift_k(k1)} = {bu[3]} ({val(bu[3])})",
        ]
    if rid == 'swap04_mid123' and len(au) == 5 and len(bu) == 5:
        return [
            f"Swap 1st & 5th letters: {au[0]} <-> {au[4]} -> {au[4]}(...){au[0]}",
            f"Middle 2nd: {au[1]} ({val(au[1])}) +1 = {bu[1]} ({val(bu[1])})",
            f"Middle 3rd: {au[2]} ({val(au[2])}) +2 = {bu[2]} ({val(bu[2])})",
            f"Middle 4th: {au[3]} ({val(au[3])}) +3 = {bu[3]} ({val(bu[3])})",
        ]
    if rid == 'swap12_opp34_swap56' and len(au) == 6 and len(bu) == 6:
        return [
            f"Swap (1st, 2nd): {au[:2]} -> {bu[:2]}",
            f"Opposite (3rd, 4th): {au[2]} ({val(au[2])}) <-> {bu[2]} ({val(bu[2])}), {au[3]} ({val(au[3])}) <-> {bu[3]} ({val(bu[3])})",
            f"Swap (5th, 6th): {au[4:]} -> {bu[4:]}",
        ]
    if rid == 'rev4_oppmid_rev4' and len(au) == 9 and len(bu) == 9:
        return [
            f"Reverse first 4 letters: {au[:4]} -> {bu[:4]}",
            f"Middle (5th) letter opposite: {au[4]} ({val(au[4])}) <-> {bu[4]} ({val(bu[4])})",
            f"Reverse last 4 letters: {au[5:]} -> {bu[5:]}",
        ]
    if rid == 'q87_3r1_m2opp_3r1' and len(au) == 8 and len(bu) == 8:
        r1, r2 = au[:3][::-1], au[5:][::-1]
        return [
            f"Reverse first 3: {au[:3]} -> {r1}; shift +1: " + ", ".join(f"{c} ({val(c)}) +1 = {r} ({val(r)})" for c, r in zip(r1, bu[:3])),
            f"Middle 2 opposite: {au[3]} ({val(au[3])}) <-> {bu[3]} ({val(bu[3])}), {au[4]} ({val(au[4])}) <-> {bu[4]} ({val(bu[4])})",
            f"Reverse last 3: {au[5:]} -> {r2}; shift +1: " + ", ".join(f"{c} ({val(c)}) +1 = {r} ({val(r)})" for c, r in zip(r2, bu[5:])),
        ]
    if rid == 'sw01_p2_sw45' and len(au) == 6 and len(bu) == 6:
        return [
            f"Swap (1st, 2nd): {au[:2]} -> {bu[:2]}",
            f"Middle two (+2): {au[2]} ({val(au[2])}) +2 = {bu[2]} ({val(bu[2])}), {au[3]} ({val(au[3])}) +2 = {bu[3]} ({val(bu[3])})",
            f"Swap (5th, 6th): {au[4:]} -> {bu[4:]}",
        ]
    if rid == 'sw01p1_m1_sw34p1' and len(au) == 5 and len(bu) == 5:
        s1, s2 = au[:2][::-1], au[3:][::-1]
        return [
            f"Swap (1st, 2nd): {au[:2]} -> {s1}; {s1[0]} ({val(s1[0])}) +1 = {bu[0]} ({val(bu[0])}), {s1[1]} ({val(s1[1])}) +1 = {bu[1]} ({val(bu[1])})",
            f"Middle (3rd): {au[2]} ({val(au[2])}) -1 = {bu[2]} ({val(bu[2])})",
            f"Swap (4th, 5th): {au[3:]} -> {s2}; {s2[0]} ({val(s2[0])}) +1 = {bu[3]} ({val(bu[3])}), {s2[1]} ({val(s2[1])}) +1 = {bu[4]} ({val(bu[4])})",
        ]
    if rid == 'rev3m1_rev3p1' and len(au) == 6 and len(bu) == 6:
        r1, r2 = au[:3][::-1], au[3:][::-1]
        return [
            f"Reverse first 3: {au[:3]} -> {r1}; shift -1: " + ", ".join(f"{c} ({val(c)}) -1 = {r} ({val(r)})" for c, r in zip(r1, bu[:3])),
            f"Reverse last 3: {au[3:]} -> {r2}; shift +1: " + ", ".join(f"{c} ({val(c)}) +1 = {r} ({val(r)})" for c, r in zip(r2, bu[3:])),
        ]
    if rid == 'sw01_sw23m1_sw45' and len(au) == 6 and len(bu) == 6:
        sw2 = au[3] + au[2]
        return [
            f"Swap (1st, 2nd): {au[:2]} -> {bu[:2]}",
            f"Swap (3rd, 4th): {au[2:4]} -> {sw2}; {sw2[0]} ({val(sw2[0])}) -1 = {bu[2]} ({val(bu[2])}), {sw2[1]} ({val(sw2[1])}) -1 = {bu[3]} ({val(bu[3])})",
            f"Swap (5th, 6th): {au[4:]} -> {bu[4:]}",
        ]
    if rid == 'sw01_p4m4p4_sw56' and len(au) == 7 and len(bu) == 7:
        return [
            f"Swap (1st, 2nd): {au[:2]} -> {bu[:2]}",
            f"Middle 3 letters: {au[2]} ({val(au[2])}) +4 = {bu[2]} ({val(bu[2])}), {au[3]} ({val(au[3])}) -4 = {bu[3]} ({val(bu[3])}), {au[4]} ({val(au[4])}) +4 = {bu[4]} ({val(bu[4])})",
            f"Swap (6th, 7th): {au[5:]} -> {bu[5:]}",
        ]
    if rid == 'q159_opprev3_m6_rev3p3' and len(au) == 7 and len(bu) == 7:
        r_last, r_first = au[4:][::-1], au[:3][::-1]
        return [
            f"Last 3 reversed -> opposite (front): {au[4:]} -> {r_last}; " + ", ".join(f"{c} ({val(c)}) <-> {r} ({val(r)})" for c, r in zip(r_last, bu[:3])),
            f"Middle (4th) letter: {au[3]} ({val(au[3])}) -6 = {bu[3]} ({val(bu[3])})",
            f"First 3 reversed -> shift +3 (back): {au[:3]} -> {r_first}; " + ", ".join(f"{c} ({val(c)}) +3 = {r} ({val(r)})" for c, r in zip(r_first, bu[4:])),
        ]
    if rid == 'q180_swp1m1_m1_swm1p1' and len(au) == 5 and len(bu) == 5:
        s1, s2 = au[:2][::-1], au[3:][::-1]
        return [
            f"Swap (1st, 2nd): {au[:2]} -> {s1}; {s1[0]} ({val(s1[0])}) +1 = {bu[0]} ({val(bu[0])}), {s1[1]} ({val(s1[1])}) -1 = {bu[1]} ({val(bu[1])})",
            f"Middle (3rd) letter: {au[2]} ({val(au[2])}) -1 = {bu[2]} ({val(bu[2])})",
            f"Swap (4th, 5th): {au[3:]} -> {s2}; {s2[0]} ({val(s2[0])}) -1 = {bu[3]} ({val(bu[3])}), {s2[1]} ({val(s2[1])}) +1 = {bu[4]} ({val(bu[4])})",
        ]
    if rid == 'q181_rev321_mid_rev321' and len(au) == 7 and len(bu) == 7:
        r1, r2 = au[:3][::-1], au[4:][::-1]
        return [
            f"First 3 reversed: {au[:3]} -> {r1}; (+3, +2, +1): {r1[0]} ({val(r1[0])}) +3 = {bu[0]} ({val(bu[0])}), {r1[1]} ({val(r1[1])}) +2 = {bu[1]} ({val(bu[1])}), {r1[2]} ({val(r1[2])}) +1 = {bu[2]} ({val(bu[2])})",
            f"Middle (4th) letter unchanged: {au[3]} -> {bu[3]}",
            f"Last 3 reversed: {au[4:]} -> {r2}; (+3, +2, +1): {r2[0]} ({val(r2[0])}) +3 = {bu[4]} ({val(bu[4])}), {r2[1]} ({val(r2[1])}) +2 = {bu[5]} ({val(bu[5])}), {r2[2]} ({val(r2[2])}) +1 = {bu[6]} ({val(bu[6])})",
        ]
    lines = []
    if len(au) == len(bu):
        work_a = au[::-1] if rid.startswith(('rev_', 'rev+')) else (''.join(sorted(au)) if rid.startswith('sort_asc+') else (''.join(sorted(au, reverse=True)) if rid.startswith('sort_desc+') else au))
        if work_a != au:
            step_lbl = "Reversed" if rid.startswith(('rev_', 'rev+')) else ("Sorted ascending" if rid.startswith('sort_asc+') else "Sorted descending")
            lines.append(f"{step_lbl}: {au} -> {work_a}")
        if rid in ('opposite', 'rev_opposite'):
            for ca, cb in zip(work_a, bu):
                lines.append(f"{ca} ({val(ca)}) <-> {cb} ({val(cb)}) [opposite]")
            return lines
        if rid.startswith(('opp_shift:', 'rev_opp_shift:')):
            opp_w = ''.join(opp(c) for c in work_a)
            lines.append(f"Opposite letters: {work_a} -> {opp_w}")
            for ca, cb in zip(opp_w, bu):
                d = ((val(cb) - val(ca)) + 26) % 26
                d = d - 26 if d > 13 else d
                lines.append(f"{ca} ({val(ca)}) {fmt_shift_k(d)} = {cb} ({val(cb)})")
            return lines
        if rid.startswith('mix_oppsh:'):
            combo = eval(rid.split(':', 1)[1])
            for ca, cb, (typ, k) in zip(work_a, bu, combo):
                va, vb = val(ca), val(cb)
                if typ == 'opp':
                    oc = opp(ca)
                    if k == 0:
                        lines.append(f"{ca} ({va}) -> Opposite {cb} ({vb})")
                    else:
                        lines.append(f"{ca} ({va}) -> Opposite {oc} ({val(oc)}) {fmt_shift_k(k)} = {cb} ({vb})")
                else:
                    lines.append(f"{ca} ({va}) {fmt_shift_k(k)} = {cb} ({vb})")
            return lines
        for idx_c, (ca, cb) in enumerate(zip(work_a, bu)):
            if not (ca.isalpha() and cb.isalpha()):
                lines.append(f"{ca} -> {cb}")
                continue
            va, vb = val(ca), val(cb)
            if cb == opp(ca) and ((rid.startswith('alt_opp') and idx_c % 2 == 0) or rid.startswith(('opp', 'rev_opp'))):
                lines.append(f"{ca} ({va}) -> Opposite {cb} ({vb})")
            else:
                d = (vb - va + 26) % 26
                d = d - 26 if d > 13 else d
                lines.append(f"{ca} ({va}) {fmt_shift_k(d)} = {cb} ({vb})")
        return lines
    return [f"{au} -> {bu}"]

# Build all 254 items cleanly
items_out = []
rule_changes = []
for item in raw:
    qn = item['q_num']
    if qn == 112:
        continue  # Remove exact duplicate of Q91 (LEAN : NEAL :: MEAN : NEAM :: HEAR : ?, 06.06.2022 Shift-I)
    fix = manual.get(qn, {})
    qt_raw = fix.get('question_text', item['question_text'])
    opts = [re.sub(r'\s+', ' ', o.strip()) for o in fix.get('options', item['options'])]
    ans_num = fix.get('correct_ans', p40_ans[qn])
    ans_idx = ans_num - 1
    ans_letter = ['A', 'B', 'C', 'D'][ans_idx]

    qt_clean = polish_question_text(qt_raw, qn)
    exam_clean = norm_exam_name(qn, item.get('exam_tag', ''))

    kind, payload = parse_q_v3(qt_raw, opts)
    solved_rid = None
    solved_desc = None
    matching_opts = []
    ex_pairs_used = []
    q_term_used = None
    target_r_used = None

    if kind == 'odd_one':
        matching_opts = [2]
        solved_rid = 'odd_one'
        solved_desc = "1st * 2nd letter position = 3rd letter position; GCV fails (7 * 3 = 21 != 22)"
        exp = (
            "Pattern: Product of alphabetical positions of the first two letters equals the alphabetical position of the third letter:\n"
            "(A) FBL: F (6) × B (2) = 12 = L (12)\n"
            "(B) DDP: D (4) × D (4) = 16 = P (16)\n"
            "(C) GCV: G (7) × C (3) = 21 = U (not V = 22) -> Odd one out\n"
            "(D) BJT: B (2) × J (10) = 20 = T (20)\n\n"
            f"Hence, the correct option is ({ans_letter})."
        )
    elif kind == 'series':
        terms = [t for t in payload if t != '?']
        diffs = [(ord(terms[1][i]) - ord(terms[0][i])) % 26 for i in range(len(terms[0]))]
        diffs = [d - 26 if d > 13 else d for d in diffs]
        pred = ''.join(chr_v(val(terms[2][i]) + diffs[i]) for i in range(len(terms[2])))
        matching_opts = [i for i, o in enumerate(opts) if o.strip().upper() == pred]
        solved_rid = 'series'
        solved_desc = f"Each position shifts by ({', '.join(fmt_shift_k(d) for d in diffs)}) from one term to the next."
        exp_lines = [f"Given series: {', '.join(payload)}", f"Logic: {solved_desc}"]
        for idx_s in range(len(terms[0])):
            exp_lines.append(f"Position {idx_s+1}: {terms[0][idx_s]} -> {terms[1][idx_s]} -> {terms[2][idx_s]} ({fmt_shift_k(diffs[idx_s])}) = {pred[idx_s]} ({val(pred[idx_s])})")
        exp_lines.append(f"Next term: {pred} (also verifying {pred} -> {terms[3]}).")
        exp_lines.append(f"\nHence, the correct option is ({ans_letter}).")
        exp = '\n'.join(exp_lines)
    elif kind in ('one_ex_to_ans', 'two_ex_to_ans', 'ex_list_to_ans'):
        if kind == 'one_ex_to_ans':
            ex_pairs, q_term = [payload[0]], payload[1]
        elif kind == 'two_ex_to_ans':
            ex_pairs, q_term = [payload[0], payload[1]], payload[2]
        else:
            ex_pairs, q_term = payload
        rule_sets = [{r[0]: r for r in find_pair_rule_v3(a, b)} for a, b in ex_pairs]
        common_ids = set(rule_sets[0].keys())
        for rs in rule_sets[1:]:
            common_ids &= set(rs.keys())
        if not common_ids and qn == 149:
            common_ids = set(rule_sets[1].keys())
            rule_sets = [rule_sets[1]]
        for rid in sorted(common_ids, key=rank_rid_v4):
            pred = rule_sets[0][rid][1](q_term)
            if pred:
                hits = [i for i, o in enumerate(opts) if o.strip().replace(' ', '').upper() == pred.strip().replace(' ', '').upper()]
                if len(hits) == 1:
                    matching_opts = hits
                    solved_rid = rid
                    solved_desc = rule_sets[0][rid][2]
                    break
        assert matching_opts == [ans_idx], f"Failed Q{qn}: hits={matching_opts} ans={ans_idx}"
        ex_pairs_used = ex_pairs
        q_term_used = q_term
        rule_txt = describe_rule_readable(solved_rid, solved_desc)
        lines = [f"Pattern: {rule_txt}"]
        for pi, (ea, eb) in enumerate(ex_pairs_used, 1):
            hdr = f"Given pair: {ea} : {eb}" if len(ex_pairs_used) == 1 else f"Pair {pi}: {ea} : {eb}"
            lines.append(hdr)
            lines.extend(letter_steps(ea, eb, solved_rid))
            lines.append("")
        lines.append(f"Similarly, for {q_term_used}:")
        lines.extend(letter_steps(q_term_used, opts[ans_idx], solved_rid))
        lines.append(f"Result is {opts[ans_idx]}.")
        lines.append(f"\nHence, the correct option is ({ans_letter}).")
        exp = '\n'.join(lines)
    elif kind == 'rev_ex_to_ans':
        ex_pairs, target_r = payload
        rule_sets = [{r[0]: r for r in find_pair_rule_v3(a, b)} for a, b in ex_pairs]
        common_ids = set(rule_sets[0].keys())
        for rs in rule_sets[1:]:
            common_ids &= set(rs.keys())
        for rid in sorted(common_ids, key=rank_rid_v4):
            fn = rule_sets[0][rid][1]
            hits = [i for i, o in enumerate(opts) if (fn(o) or '').upper() == target_r.upper()]
            if len(hits) == 1:
                matching_opts = hits
                solved_rid = rid
                solved_desc = rule_sets[0][rid][2]
                break
        assert matching_opts == [ans_idx], f"Failed Q{qn}"
        rule_txt = describe_rule_readable(solved_rid, solved_desc)
        lines = [f"Pattern: {rule_txt}"]
        for pi, (ea, eb) in enumerate(ex_pairs, 1):
            lines.append(f"Given pair {pi}: {ea} : {eb}" if len(ex_pairs)>1 else f"Given pair: {ea} : {eb}")
            lines.extend(letter_steps(ea, eb, solved_rid))
            lines.append("")
        lines.append(f"Checking Option ({ans_letter}): {opts[ans_idx]} : {target_r}")
        lines.extend(letter_steps(opts[ans_idx], target_r, solved_rid))
        lines.append(f"Thus, {opts[ans_idx]} corresponds to {target_r}.")
        lines.append(f"\nHence, the correct option is ({ans_letter}).")
        exp = '\n'.join(lines)
    elif kind == 'pair_match':
        ex_pairs = payload
        rule_sets = [{r[0]: r for r in find_pair_rule_v3(a, b)} for a, b in ex_pairs]
        common_ids = set(rule_sets[0].keys())
        for rs in rule_sets[1:]:
            common_ids &= set(rs.keys())
        for rid in sorted(common_ids, key=rank_rid_v4):
            hits = []
            for i, o in enumerate(opts):
                if ':' not in o: continue
                oa, ob = [x.strip() for x in o.split(':', 1)]
                if rid in {r[0] for r in find_pair_rule_v3(oa, ob)}:
                    hits.append(i)
            if len(hits) == 1:
                matching_opts = hits
                solved_rid = rid
                solved_desc = rule_sets[0][rid][2]
                break
        assert matching_opts == [ans_idx], f"Failed Q{qn}"
        rule_txt = describe_rule_readable(solved_rid, solved_desc)
        lines = [f"Pattern: {rule_txt}"]
        for pi, (ea, eb) in enumerate(ex_pairs, 1):
            lines.append(f"Given pair {pi}: {ea} : {eb}" if len(ex_pairs)>1 else f"Given pair: {ea} : {eb}")
            lines.extend(letter_steps(ea, eb, solved_rid))
            lines.append("")
        oa, ob = [x.strip() for x in opts[ans_idx].split(':', 1)]
        lines.append(f"Option ({ans_letter}) [{opts[ans_idx]}] follows the same rule:")
        lines.extend(letter_steps(oa, ob, solved_rid))
        lines.append(f"\nHence, the correct option is ({ans_letter}).")
        exp = '\n'.join(lines)

    if solved_rid != 'odd_one' and qn in [13, 26, 27, 31, 32, 33, 34, 37, 81, 86, 125, 127, 134, 140, 157, 209, 226, 237]:
        rule_changes.append((qn, solved_rid, solved_desc))

    # Format pair-match options cleanly (`A : B`)
    opts = [re.sub(r'\s*:\s*', ' : ', o) if ':' in o else o for o in opts]

    items_out.append({
        "q_num": len(items_out) + 1,
        "question_text": qt_clean,
        "options": opts,
        "correct_option": ans_letter,
        "exam_tag": exam_clean,
        "explanation": exp,
    })

print(f"Built {len(items_out)}/253 verified Batch 4 items (book Q112 duplicate removed)!")
print("\nRe-prioritized sort_asc/desc sample:")
for qn, rid, desc in rule_changes:
    print(f"  Q{qn:3d}: [{rid}] -> {desc}")

with open('kiran_type4_254_verified.json', 'w', encoding='utf-8') as f:
    json.dump(items_out, f, indent=2, ensure_ascii=False)

# Export TXT in batch3/batch5 format
txt_blocks = []
for it in items_out:
    block = [
        f"Question {it['q_num']}:",
        it['question_text'],
        "",
        f"(A) {it['options'][0]}",
        f"(B) {it['options'][1]}",
        f"(C) {it['options'][2]}",
        f"(D) {it['options'][3]}",
        "",
        f"Answer: ({it['correct_option']})",
        f"Exam: ({it['exam_tag']})",
        "Explanation:",
        it['explanation'],
        "",
        "-" * 80,
    ]
    txt_blocks.append('\n'.join(block))

txt_content = '\n\n'.join(txt_blocks) + '\n'
with open('batch4_type4_letter_analogy_verified.txt', 'w', encoding='utf-8') as f:
    f.write(txt_content)
with open('public/batch4_type4_letter_analogy_verified.txt', 'w', encoding='utf-8') as f:
    f.write(txt_content)
print("Exported kiran_type4_254_verified.json, batch4_type4_letter_analogy_verified.txt, and public/batch4_type4_letter_analogy_verified.txt")
