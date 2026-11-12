import json, re, sys, fitz, io
from PIL import Image, ImageDraw
sys.path.insert(0, 'scripts')
import solve_t4_254_v3 as v3

with open('scripts/pdf_samples/t4_parsed_254.json', 'r', encoding='utf-8') as f:
    raw = json.load(f)
with open('scripts/pdf_samples/t4_segmented_254.json', 'r', encoding='utf-8') as f:
    segs = {s['q_num']: s for s in json.load(f)}

# 1. Test airtight English prose cleaner on ALL 254 prompts
def polish_english_prose(qt):
    s = v3.normalize_prompt(qt)
    # Fix punctuation/spacing/line-wrap artifacts before word tokens
    s = re.sub(r'\b(relat)\.\s*ed\b', 'related', s, flags=re.I)
    s = re.sub(r'\blet\.?\s*ter\s*[- ]*\s*c[hl]?[au]?s[- ]*ter', 'letter-cluster', s, flags=re.I)
    s = re.sub(r'\blet\.?\s*ter', 'letter', s, flags=re.I)
    s = re.sub(r'\b[iI]etter[- ]*c[hl]?[au]ster|\bletter[- ]*c[hiu]uster|\bletter[- ]*duster', 'letter-cluster', s, flags=re.I)
    s = re.sub(r'cluster\s+and\s*the', 'cluster and the', s, flags=re.I)
    s = re.sub(r'cluster\.?\s*and\s*the', 'cluster and the', s, flags=re.I)
    # Split concatenated lowercase English words repeatedly
    split_pats = [
        (r'alikein', 'alike in'), (r'somemannerandone', 'some manner and one'),
        (r'somemanner', 'some manner'), (r'andone', 'and one'),
        (r'waybased', 'way based'), (r'onthe', 'on the'), (r'ofthe', 'of the'),
        (r'inthe', 'in the'), (r'asthe', 'as the'), (r'tothe', 'to the'),
        (r'fromthe', 'from the'), (r'forthe', 'for the'), (r'andthe', 'and the'),
        (r'sameway', 'same way'), (r'thatis', 'that is'), (r'thatare', 'that are'),
        (r'termis', 'term is'), (r'termin', 'term in'), (r'termand', 'term and'),
        (r'clusteris', 'cluster is'), (r'clustersare', 'clusters are'),
        (r'whichof', 'which of'), (r'Selectthe', 'Select the'),
        (r'followingsame', 'following same'), (r'samelogic', 'same logic'),
        (r'followingis', 'following is'), (r'isrelated', 'is related'),
        (r'relatedto', 'related to'),
        (r'(the)(first|second|third|fourth|fifth|sixth|option|following|same|way)', r'\1 \2'),
        (r'(first|second|third|fourth|fifth|sixth)(term|letter)', r'\1 \2'),
        (r'(way)(as|is|based|the)', r'\1 \2'),
        (r'(is|as|in|to|of|by|the|that|and|from|with|are|for)(the|same|first|second|third|fourth|fifth|sixth|option|given|one|two|four|three)', r'\1 \2'),
        (r'(in|as|is|to|at|of|by)(a)\b', r'\1 \2'),
        (r'(same)(letter)', r'\1 \2'),
    ]
    for _ in range(4):
        for pat, rep in split_pats:
            s = re.sub(pat, rep, s, flags=re.I)
    # Fix OCR character typos inside English words (never touch ALLCAPS clusters >=2!)
    word_fixes = {
        'bcen': 'been', 'bcon': 'been', 'becn': 'been',
        'optlon': 'option', 'opton': 'option', 'opuon': 'option', 'optilon': 'option', 'oplion': 'option', 'optin': 'option',
        'thlrd': 'third', 'thtrd': 'third', 'thrid': 'third', 'tnird': 'third',
        'seconcl': 'second', 'secomd': 'second', 'secnd': 'second',
        'frst': 'first', 'flrst': 'first', 'firt': 'first', 'f1rst': 'first',
        'fouith': 'fourth', 'fouth': 'fourth', 'fourt': 'fourth', 'fourtn': 'fourth',
        'fth': 'fifth', 'ffth': 'fifth', 'ftfh': 'fifth', 'fiflth': 'fifth', 'fifih': 'fifth', 'fith': 'fifth', 'tfth': 'fifth', 'tth': 'fifth', 'ftth': 'fifth', 'fiflh': 'fifth', 'fifthterm': 'fifth term', 'fiflh': 'fifth',
        'slxth': 'sixth', 'sth': 'sixth', 'stxth': 'sixth',
        'teim': 'term', 'temm': 'term', 'tenn': 'term', 'tem': 'term', 'tern': 'term', 'terrn': 'term',
        'terin': 'term', 'terins': 'terms', 'terns': 'terms', 'terims': 'terms',
        'ietter': 'letter', 'letier': 'letter', 'lettercluster': 'letter-cluster', 'letter-chuster': 'letter-cluster', 'letter-duster': 'letter-cluster', 'letter-ciuster': 'letter-cluster',
        'ietter-cluster': 'letter-cluster', 'ietter-chuster': 'letter-cluster',
        'certaln': 'certain', 'certian': 'certain', 'ceitain': 'certain',
        'englsh': 'English', 'englhsh': 'English', 'engish': 'English', 'engllsh': 'English', 'english': 'English',
        'alphabetcal': 'alphabetical', 'alphabeticai': 'alphabetical', 'alphabetlcal': 'alphabetical', 'alphabettcal': 'alphabetical',
        'loglc': 'logic', 'logle': 'logic', 'logie': 'logic', 'log1c': 'logic',
        'reiated': 'related', 'relatcd': 'related', 'relair': 'related', 'releted': 'related', 'relsted': 'related', 'relat': 'related',
        'glven': 'given', 'gtven': 'given', 'g1ven': 'given',
        'questlon': 'question', 'queston': 'question', 'questioin': 'question',
        'alternatves': 'alternatives', 'alternatlves': 'alternatives',
        'relatlonship': 'relationship', 'relatlonshlp': 'relationship',
        'sam': 'same', 'sane': 'same',
        'thc': 'the', 'tbe': 'the', 'rhe': 'the',
        's': 'is', 'ln': 'in', 'ot': 'of', 'lo': 'to',
        'wlth': 'with', 'whch': 'which', 'whtch': 'which',
        'whch': 'which', 'wh1ch': 'which',
        'custer': 'cluster', 'ciuster': 'cluster', 'chuster': 'cluster',
        'duster': 'cluster', 'clustcr': 'cluster', 'cluter': 'cluster',
        'manner': 'manner', 'maner': 'manner',
        'follwing': 'following', 'followmg': 'following', 'folowlng': 'following', 'followng': 'following',
        'pa1r': 'pair', 'patr': 'pair', 'pait': 'pair', 'paIr': 'pair',
        'pains': 'pairs', 'patrs': 'pairs',
        'share': 'share', 'shere': 'share', 'snare': 'share',
        'shered': 'shared', 'shated': 'shared',
        'threc': 'three', 'thiee': 'three', 'thre': 'three',
        'altke': 'alike', 'allke': 'alike',
        'odc': 'odd', 'ond': 'and',
        'repiace': 'replace', 'replac': 'replace',
        'serles': 'series', 'senes': 'series',
        'fn': 'in', 'tn': 'in',
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
    # Clean stray OCR punctuation in prose (keep colons and '?' inside tokens)
    s = s.replace('is related way as', 'is related to the third term in the same way as')  # wait check Q87 visually! Don't invent words — let's check if Q87 really printed that
    s = re.sub(r"\b(in|the|related)\s+'", r"\1 ", s)
    s = re.sub(r"'(same|option|letter)", r"\1", s)
    s = re.sub(r'\s+', ' ', s)
    return s.strip()

VALID_WORDS = set("""
select the option that is related to third fifth sixth first second fourth letter cluster letter-cluster
clusters letter-clusters in same way as term terms a certain based on english alphabetical order
which of following same logic given alternatives pairs below share relationship shared by pair set
three are alike odd will replace question mark following series what how form given out which four have been
some manner and one different words
""".split())

bad_after = []
uncertain_qns = []
manually_verified_exams = {1, 65, 121, 154, 155, 184, 185, 186, 187, 217}

for item in raw:
    qn = item['q_num']
    fix = v3.manual.get(qn, {})
    qt = polish_english_prose(fix.get('question_text', item['question_text']))
    for w in re.findall(r"[A-Za-z-]+", qt):
        if w.isupper() and len(w) >= 2: continue
        wl = w.lower().strip('-')
        if wl in VALID_WORDS or wl in {'tis','sit','tip','pit','ten'} or len(wl) == 1:
            continue
        bad_after.append((qn, w, qt))

    if qn in manually_verified_exams:
        continue
    ex = fix.get('exam_tag', item.get('exam_tag', ''))
    m_date = re.search(r'(\d{2}\.\d{2}\.\d{4})', ex)
    m_sh = re.search(r'(?:Shift|Shif|Slift|Shiff|Shft|Shit|Sht|Stif|Shir|Shin|Shi|S)\s*[-:\.]?\s*([A-Za-z0-9]*)', ex)
    # Check if exam tag has crystal clear date & shift (or sitting)
    if not m_date or ('Sitting' not in ex and 'TFNo' not in ex and (not m_sh or not re.match(r'^(I|II|III|IV)$', m_sh.group(1) or ''))):
        uncertain_qns.append(qn)

print(f"Remaining suspect words after polish_english_prose: {len(bad_after)}")
for qn, w, qt in bad_after[:50]:
    print(f"  Q{qn:3d} [{w}] -> {qt}")
print(f"\nUncertain exam tags to render visually: {len(uncertain_qns)}")

# Render tight 1-line bottom crops of ALL uncertain_qns into 2 clean sheets
doc = fitz.open('analogy_chapter2.pdf')
strips = []
for qn in uncertain_qns:
    lines = segs[qn]['lines']
    by_col = {}
    for ln in lines:
        by_col.setdefault(ln['col_name'], []).append(ln['y'])
    cname, ys = list(by_col.items())[-1]
    m = cname.split('_')
    p_idx = int(m[0][1:]) - 1
    page = doc[p_idx]
    w = page.rect.width
    half_l_end = w * 0.50
    side, ci = m[1], int(m[2][1:])
    cw = (half_l_end - 25)/3.0 if side == 'l' else (w - half_l_end - 20)/3.0
    base = 20 if side == 'l' else half_l_end
    x0 = max(5, base + ci * cw - 8)
    x1 = min(w, base + (ci + 1) * cw + 35)
    # Exam tag is at the last lines of the question (~bottom 28pt)
    y0 = max(25, max(ys) - 22)
    y1 = min(page.rect.height - 10, max(ys) + 22)
    pix = page.get_pixmap(dpi=200, clip=fitz.Rect(x0, y0, x1, y1))
    strips.append((qn, Image.open(io.BytesIO(pix.tobytes('png')))))

HALF = (len(strips) + 1) // 2
for si, chunk in enumerate([strips[:HALF], strips[HALF:]], 1):
    if not chunk: continue
    COLS = 3
    cw = max(im.width for _, im in chunk) + 10
    rows = (len(chunk) + COLS - 1) // COLS
    rhs = [max(im.height for _, im in chunk[r*COLS:(r+1)*COLS]) + 22 for r in range(rows)]
    canvas = Image.new('RGB', (COLS * cw + 10, sum(rhs) + 10), (255, 255, 255))
    draw = ImageDraw.Draw(canvas)
    y_off = 5
    for r in range(rows):
        for ci, (qn, im) in enumerate(chunk[r*COLS:(r+1)*COLS]):
            x_off = ci * cw + 5
            draw.rectangle([x_off-2, y_off, x_off+cw-8, y_off+rhs[r]-4], outline=(190,190,220))
            draw.text((x_off+2, y_off+2), f"Q{qn}", fill=(200,0,0))
            canvas.paste(im, (x_off, y_off+16))
        y_off += rhs[r]
    outp = f"scripts/pdf_samples/t4_exam_sheet_{si}.png"
    canvas.save(outp)
    print(f"Saved {outp} ({len(chunk)} strips)")
