import json, re, sys
sys.path.insert(0, 'scripts')
import solve_t4_254_v3 as v3

with open('scripts/pdf_samples/t4_parsed_254.json', 'r', encoding='utf-8') as f:
    raw = json.load(f)

print("Q237 repr:", repr(raw[236]['question_text']))
print("Q251 repr:", repr(raw[250]['question_text']))
print("Q252 repr:", repr(raw[251]['question_text']))

# Check ALL 254 post-manual question_text & exam_tag
ENGLISH_FIXES = [
    (r'\bi[eE]tter[- ]?c[hl]?uster\b|\bletter[- ]?chuster\b|\bletter[- ]?duster\b|\bletter[- ]?ciuster\b', 'letter-cluster'),
    (r'\bopt[il]?on\b', 'option'),
    (r'\bth[il]rd\b', 'third'),
    (r'\bseco[nm]d\b', 'second'),
    (r'\bf[il]?rst\b', 'first'),
    (r'\bf[ou]?urth\b', 'fourth'),
    (r'\bf(?:i|l|t|f)?fth\b|\bffth\b|\bfth\b|\bftfh\b|\bfiflth\b', 'fifth'),
    (r'\bs[il]xth\b', 'sixth'),
    (r'\bfollow(?:t|l|m|i|e)?ng\b|\bfolowing\b|\bfoliowing\b', 'following'),
    (r'\bEngl[ih]sh\b', 'English'),
    (r'\balphabet[ilc]*al\b', 'alphabetical'),
    (r'\bcerta[il]n\b', 'certain'),
    (r'\bsam\b(?=\s+way)', 'same'),
    (r'\blog[ilI][ec]\b', 'logic'),
    (r'\brelat(?:cd|ed)\b', 'related'),
    (r'\bisrelatedto\b', 'is related to'),
    (r'\bisrelated\b', 'is related'),
    (r'\brelatedto\b', 'related to'),
    (r'\brelat\.\s*ed\b', 'related'),
]

VALID_WORDS = set("""
select the option that is related to third fifth sixth first second fourth letter cluster letter-cluster
clusters letter-clusters in same way as term terms a certain based on english alphabetical order
which of following same logic given alternatives pairs below share relationship shared by pair set
three are alike odd will replace question mark following series what how form
""".split())

suspect_prompts = []
bad_exams = []

for item in raw:
    qn = item['q_num']
    fix = v3.manual.get(qn, {})
    qt = v3.normalize_prompt(fix.get('question_text', item['question_text']))
    ex = fix.get('exam_tag', item.get('exam_tag', ''))

    # Check lowercase words before colon or uppercase tokens
    # Extract non-all-caps words (except Tis, Sit, Tip, Pit, Ten)
    words = re.findall(r"[A-Za-z-]+", qt)
    bad_w = []
    for w in words:
        if w.isupper() and len(w) >= 2:
            continue
        wl = w.lower().strip('-')
        if wl in VALID_WORDS or wl in {'tis','sit','tip','pit','ten','ken','net','set','pen','i','ii','iii','iv','cgl','chsl','mts','gd','cpo'}:
            continue
        if len(wl) == 1:
            continue
        bad_w.append(w)
    if bad_w:
        suspect_prompts.append((qn, bad_w, qt))

    # Check exam tag completeness
    m_date = re.search(r'(\d{2}\.\d{2}\.\d{4})', ex)
    has_shift = bool(re.search(r'Shift-[IV]+|Sitting|Tier-|Exam', ex))
    m_sh = re.search(r'Shift-([A-Za-z0-9]*)', ex)
    incomplete_shift = (m_sh and m_sh.group(1) not in {'I', 'II', 'III', 'IV'}) or ('Shift' in ex and not m_sh)
    if not m_date or incomplete_shift or 'Shif' in ex or 'Slift' in ex or 'Tler' in ex or 'TIer' in ex or 'Shift-)' in ex or not ex.endswith(')') or not ex.startswith('('):
        bad_exams.append((qn, ex))

print(f"\nSuspect prompt words in {len(suspect_prompts)}/254 questions:")
for qn, bw, qt in suspect_prompts[:80]:
    print(f"  Q{qn:3d}: {bw} | {qt}")
if len(suspect_prompts) > 80:
    print("  ... remaining:", [x[0] for x in suspect_prompts[80:]])

print(f"\nExam tags needing fix/verification ({len(bad_exams)}/254):")
for qn, ex in bad_exams[:100]:
    print(f"  Q{qn:3d}: {repr(ex)}")
print("Total bad_exams:", len(bad_exams))
