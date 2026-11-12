import json, re, sys
sys.path.insert(0, 'scripts')

with open('scripts/pdf_samples/t4_parsed_254.json', 'r', encoding='utf-8') as f:
    raw = json.load(f)

# Load v3.manual safely without waiting or printing
with open('scripts/solve_t4_254_v3.py', 'r', encoding='utf-8') as f:
    v3_src = f.read()
ns = {}
# Only execute up to where helper/manual end (before '# Solve using verified PDF key')
cut = v3_src.find('# Run strict')
if cut == -1:
    cut = v3_src.find('\nresults =')
if cut == -1:
    cut = v3_src.find('\nfor item in')
exec(v3_src[:cut], ns)
manual = ns['manual']
normalize_prompt = ns['normalize_prompt']

def polish_english_prose(qt, qn=0):
    s = normalize_prompt(qt)
    # Remove any stray header bleed before sentence start
    s = re.sub(r'^\([^)]*\)\s*', '', s)
    # Fix punctuation/spacing/line-wrap artifacts
    s = re.sub(r'\blet\.?\s*[- ]*\s*ter\s*[- ]*\s*c[hl]?[au]?s[- ]*\.?\s*ter', 'letter-cluster', s, flags=re.I)
    s = re.sub(r'\blet[- ]\.\s*ter', 'letter', s, flags=re.I)
    s = re.sub(r'\blet\.?\s*ter', 'letter', s, flags=re.I)
    s = re.sub(r'letter\.\s*cluster', 'letter-cluster', s, flags=re.I)
    s = re.sub(r'\b[iI]etter[- ]*c[hl]?[au]ster|\bletter[- ]*c[hiu]uster|\bletter[- ]*duster|\blettercluster', 'letter-cluster', s, flags=re.I)
    s = re.sub(r'\bsecond-cluster\b', 'second letter-cluster', s, flags=re.I)
    # Restore known line-wrap hyphens inside prose
    s = re.sub(r'\blet-\s+ter', 'letter', s, flags=re.I)
    s = re.sub(r'\bter-\s*cluster\b', 'letter-cluster', s, flags=re.I)
    s = re.sub(r'first\s+letter-clusterand', 'first letter-cluster and', s, flags=re.I)
    s = re.sub(r'\blet\.\s*', 'letter ', s, flags=re.I) if 'let. ' in s else s
    # Split concatenated lowercase English words repeatedly
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
    # Fix missing Q87 phrase + punctuation
    s = s.replace('is related way as', 'is related to the third term in the same way as')
    s = s.replace("option'that", "option that")
    s = re.sub(r'\bthird letter\s+cluster\b', 'third letter-cluster', s)
    s = re.sub(r'\bsecond letter\s+cluster\b', 'second letter-cluster', s)
    s = re.sub(r'\bfirst letter\s+cluster\b', 'first letter-cluster', s)
    s = re.sub(r'\bfourth letter\s+cluster\b', 'fourth letter-cluster', s)
    s = re.sub(r'\bfifth letter\s+cluster\b', 'fifth letter-cluster', s)
    s = re.sub(r'\bsixth letter\s+cluster\b', 'sixth letter-cluster', s)
    s = re.sub(r'\bpair of letter\s+clusters\b', 'pair of letter-clusters', s)
    s = re.sub(r'\bpairs of letter\s+clusters\b', 'pairs of letter-clusters', s)
    s = re.sub(r'\bfrom\s+the\s+given', 'from the given', s)
    s = re.sub(r"\b(in|the|related)\s+'", r"\1 ", s)
    s = re.sub(r"'(same|option|letter)", r"\1", s)
    # Normalize single colon separator in Q196 if needed (check carefully!)
    s = re.sub(r'\s+', ' ', s)
    return s.strip()

VALID_WORDS = set("""
select the option that is related to third fifth sixth first second fourth letter cluster letter-cluster
clusters letter-clusters in same way as term terms a certain based on english alphabetical order from
which of following same logic given alternatives pairs below share relationship shared by pair set
three are alike odd will replace question mark following series what how form given out which four have been
some manner and one different words word meaningless actual not no number consonants vowels meaningful must
be considered count between other follows pattern followed two both letters
""".split())

bad = []
grammar_warns = []
for item in raw:
    qn = item['q_num']
    fix = manual.get(qn, {})
    qt = polish_english_prose(fix.get('question_text', item['question_text']), qn)
    for w in re.findall(r"[A-Za-z-]+", qt):
        if w.isupper() and len(w) >= 2: continue
        wl = w.lower().strip('-')
        if wl in VALID_WORDS or wl in {'tis','sit','tip','pit','ten'} or len(wl) == 1:
            continue
        bad.append((qn, w, qt))
    # Grammar sanity check
    prose = qt.split(':')[0]
    if any(p in prose for p in ['related the ', 'in same ', 'related third', 'the option is ', 'to the term ', 'pair of clusters', 'as second', 'as fourth', 'as third', 'related first']):
        grammar_warns.append((qn, prose))

print(f"Remaining suspect prose words: {len(bad)}")
for qn, w, qt in bad:
    print(f"  Q{qn:3d} [{w}] -> {qt}")
print(f"\nGrammar sanity warnings: {len(grammar_warns)}")
for qn, prose in grammar_warns:
    print(f"  Q{qn:3d}: {prose}")
