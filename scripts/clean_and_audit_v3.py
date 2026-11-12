import json, re, sys
sys.path.insert(0, 'scripts')
import solve_t4_254_v3 as v3

def clean_prompt_full(qt):
    s = qt
    s = s.replace('LPNg', 'LPNQ')
    # Fix line-break / period splits inside words
    s = re.sub(r'relat\.?\s*ed\b', 'related', s, flags=re.I)
    s = re.sub(r'let\.?\s*ter[- ]*c[hl]?uster', 'letter-cluster', s, flags=re.I)
    s = re.sub(r'l[eE]t\.?\s*ter\b', 'letter', s, flags=re.I)
    s = re.sub(r'\b[iI]etter[- ]*c[hl]?[ua]ster|\bletter[- ]*c[hiu]uster|\bletter[- ]*duster', 'letter-cluster', s, flags=re.I)
    s = re.sub(r'\bietter\b', 'letter', s, flags=re.I)
    # Fix glued uppercase tokens
    s = re.sub(r'([A-Z0-9]{2,})(isrelatedto|isrelated|relatedto|related|is|to|in|based)\b', r'\1 \2', s)
    s = re.sub(r'\b(to|is|as|of|the|way|following|waybased\s*on\s*the\s*English|is)(?=[A-Z0-9]{2,})', lambda m: m.group(1)+' ', s, flags=re.I)
    # Aggressive glued English prose words
    glued = [
        (r'waybased', 'way based'), (r'onthe', 'on the'), (r'ofthe', 'of the'), (r'inthe', 'in the'),
        (r'asthe', 'as the'), (r'tothe', 'to the'), (r'fromthe', 'from the'), (r'forther?', 'for the'),
        (r'isrelatedto', 'is related to'), (r'isrelated', 'is related'), (r'relatedto', 'related to'),
        (r'sameway', 'same way'), (r'thatis', 'that is'), (r'termis', 'term is'), (r'clusteris', 'cluster is'),
        (r'thefirstterm', 'the first term'), (r'thesecondterm', 'the second term'), (r'thethirdterm', 'the third term'),
        (r'thefourthterm', 'the fourth term'), (r'thefifthterm', 'the fifth term'),
        (r'thefirst', 'the first'), (r'thesecond', 'the second'), (r'thethird', 'the third'),
        (r'thefourth', 'the fourth'), (r'thefifth', 'the fifth'), (r'thesixth', 'the sixth'),
        (r'theoption', 'the option'), (r'thefollowing', 'the following'), (r'Towhich', 'To which'),
        (r'whichof', 'which of'), (r'alikein', 'alike in'), (r'somemannerandone', 'some manner and one'),
        (r'somemanner', 'some manner'), (r'andone', 'and one'), (r'andthe', 'and the'),
        (r'Selectthe', 'Select the'), (r'followingsame', 'following same'), (r'samelogic', 'same logic'),
        (r'Engl[ih]+sh', 'English'), (r'alphabet[ilc]*al', 'alphabetical'), (r'followingis', 'following is'),
    ]
    for pat, rep in glued:
        s = re.sub(pat, rep, s, flags=re.I)
    # Fix OCR single-word corruptions
    typos = [
        (r'\bbc[eo]n\b', 'been'),
        (r'\bopt[il]?on\b', 'option'), (r'\bopton\b', 'option'), (r'\boptlon\b', 'option'), (r'\bopuon\b', 'option'), (r'\boptilon\b', 'option'),
        (r'\bth[il]rd\b', 'third'), (r'\bthtrd\b', 'third'),
        (r'\bseco[nm]d\b', 'second'),
        (r'\bfrst\b|\bflrst\b|\bf[il]rst\b', 'first'),
        (r'\bfourth\b|\bfouith\b', 'fourth'),
        (r'\bffth\b|\bfth\b|\bftfh\b|\bfiflth\b|\bfifih\b|\bfith\b|\btfth\b|\btth\b', 'fifth'),
        (r'\bsixth\b|\bslxth\b', 'sixth'),
        (r'\bteim\b|\btemm\b|\btenn\b|\btem\b|\btern\b', 'term'),
        (r'\bfollow(?:t|l|m|i|e)?ng\b|\bfolowing\b|\bfoliowing\b|\bfoIlowing\b', 'following'),
        (r'\bcerta[il]n\b', 'certain'),
        (r'\blog[ilI][ec]\b', 'logic'),
        (r'\brelair\b|\brelat[ec]d\b', 'related'),
        (r'\bsam\b(?=\s+way)', 'same'),
        (r'\bglven\b|\bgtven\b', 'given'),
        (r'\bquest[il]?on\b', 'question'),
        (r'\balternat[il]ves\b', 'alternatives'),
        (r'\brelatlons?h[il]p\b', 'relationship'),
        (r'\bsha[rn]ed\b', 'shared'),
        (r'\bpai[rn]s?\b', lambda m: m.group(0)),
        (r'\bIs\s+related\b', 'is related'),
        (r'\b([a-z])\.([a-z])', r'\1 \2'),
        (r'\s+,\s*', ', '),
    ]
    for pat, rep in typos:
        s = re.sub(pat, rep, s)
    # Fix missing space before/after isolated uppercase clusters
    s = re.sub(r'([A-Z]{2,})(is|to|in|on|as|the|way|related)', r'\1 \2', s)
    s = re.sub(r'(to|is|as|of|the|way|following|in)([A-Z]{2,})', r'\1 \2', s)
    s = re.sub(r'\s*:\s*:\s*', ' :: ', s)
    s = re.sub(r'(?<=[A-Za-z0-9\?_])\s*:\s*(?=[A-Za-z0-9\?_])', ' : ', s)
    s = re.sub(r':\s*[\._2]*\s*$', ': ?', s)
    s = re.sub(r'\s+', ' ', s)
    return s.strip()

with open('scripts/pdf_samples/t4_parsed_254.json', 'r', encoding='utf-8') as f:
    raw = json.load(f)

VALID_WORDS = set("""
select the option that is related to third fifth sixth first second fourth letter cluster letter-cluster
clusters letter-clusters in same way as term terms a certain based on english alphabetical order
which of following same logic given alternatives pairs below share relationship shared by pair set
three are alike odd will replace question mark following series what how form given out which four have been
some manner and one different pair words
""".split())

suspects = []
uncertain_exams = []
for item in raw:
    qn = item['q_num']
    fix = v3.manual.get(qn, {})
    qt = clean_prompt_full(fix.get('question_text', item['question_text']))
    ex = fix.get('exam_tag', item.get('exam_tag', ''))

    # Check math via clean_prompt_full!
    kind, payload = v3.parse_q_v3(qt, fix.get('options', item['options']))
    if kind == 'unknown':
        print(f"STILL UNKNOWN PARSE: Q{qn}: {qt}")

    for w in re.findall(r"[A-Za-z-]+", qt):
        if w.isupper() and len(w) >= 2: continue
        wl = w.lower().strip('-')
        if wl in VALID_WORDS or wl in {'tis','sit','tip','pit','ten'} or len(wl) == 1:
            continue
        suspects.append((qn, w, qt))

    # Classify exam tag clarity
    # First check if it's purely cleanable or genuinely missing/ambiguous shift/year
    m_date = re.search(r'(\d{2}\.\d{2}\.\d{4})', ex)
    # Check shift substring
    m_sh = re.search(r'(?:Shift|Shif|Slift|Shiff|Shft|Shit|Sht|Stif|Shir|Sh|Sitting)\s*[-:\.]?\s*([A-Za-z0-9]*)', ex, re.I)
    good_shift = False
    sh_tok = m_sh.group(1) if m_sh else None
    if sh_tok and sh_tok.upper() in {'I', 'II', 'III', 'IV', '1', '1L', '1M', 'IL', 'II1', '1I', 'IM', 'M', 'LS'}:
        pass
    # Actually let's list ANY exam tag that doesn't cleanly parse to (date + exact Shift I/II/III/IV or TF No/Sitting)
    if not m_date or ('Sitting' not in ex and 'Kolkata' not in ex and 'TF' not in ex and (not m_sh or not re.match(r'^(I|II|III|IV|Il|IIl|1|11|111)$', sh_tok or ''))):
        uncertain_exams.append((qn, ex))

print(f"Remaining suspect prose words ({len(suspects)}):")
for qn, w, qt in suspects[:60]:
    print(f"  Q{qn:3d} [{w}] -> {qt}")
print(f"\nUncertain/ambiguous exam tags ({len(uncertain_exams)}):")
for qn, ex in uncertain_exams:
    print(f"  Q{qn:3d}: {repr(ex)}")
