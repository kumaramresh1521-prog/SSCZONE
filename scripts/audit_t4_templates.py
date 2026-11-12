import json, re
from collections import Counter

with open('scripts/pdf_samples/t4_parsed_254.json', 'r', encoding='utf-8') as f:
    raw = json.load(f)
with open('scripts/solve_t4_254_v3.py', 'r', encoding='utf-8') as f:
    v3_src = f.read()
ns = {}
exec(v3_src[:v3_src.find('# Run strict') if '# Run strict' in v3_src else v3_src.find('\nresults =')], ns)
manual = ns['manual']

from dump_exams_and_grammar import polish_english_prose

def full_polish(qt, qn):
    s = polish_english_prose(qt, qn)
    s = re.sub(r'related\.\s*ed\b', 'related', s, flags=re.I)
    s = re.sub(r'\blet-\s*\.\s*(letter-cluster)', r'\1', s, flags=re.I)
    s = re.sub(r'letiercluster', 'letter-cluster', s, flags=re.I)
    s = re.sub(r'\bgliven\b', 'given', s, flags=re.I)
    s = re.sub(r'\bthesame\b', 'the same', s, flags=re.I)
    s = re.sub(r'\btheoption\b', 'the option', s, flags=re.I)
    s = re.sub(r'in which pair of letter-clusters share same relationship',
               'in which the pair of letter-clusters share the same relationship', s)
    s = s.replace('consonants/ vowels', 'consonants/vowels')
    if qn == 196:
        s = s.replace('LAMP : BNMQ : MOON : PPNO : MARS : ?', 'LAMP : BNMQ :: MOON : PPNO :: MARS : ?')
    # Fix punctuation right before/after expression
    s = re.sub(r'\s+:', ' :', s)
    s = re.sub(r'([A-Z]):\s*\?', r'\1 : ?', s)
    return re.sub(r'\s+', ' ', s).strip()

prose_counts = Counter()
prose_qns = {}
all_polished = {}
for item in raw:
    qn = item['q_num']
    qt = full_polish(manual.get(qn, {}).get('question_text', item['question_text']), qn)
    all_polished[qn] = qt
    m_sep = re.match(r'^(.+?\.)\s+(.+)$', qt)
    if m_sep:
        prose, expr = m_sep.group(1), m_sep.group(2)
    else:
        prose, expr = qt, ''
    prose_counts[prose] += 1
    prose_qns.setdefault(prose, []).append(qn)

print(f"Total distinct prose templates: {len(prose_counts)}")
for p, cnt in prose_counts.most_common():
    if cnt <= 4:
        print(f"  [{cnt}] Q{prose_qns[p]}: {p}")
    else:
        print(f"  [{cnt}] {p}")
