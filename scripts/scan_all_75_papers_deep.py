# -*- coding: utf-8 -*-
"""
Deep scan of all 75 papers (7,500 questions in paper_questions)
to detect every type of issue across all 4 subjects:
- Maths: unrendered LaTeX, math symbols, raw fractions, geometry figures, DI tables
- Reasoning: mirror images, embedded figures, series, paper folding, analogies
- GK / GS: Match Column tables, glued OCR words, science diagrams, biological charts
- English: comprehension passages, cloze blanks, sentence improvement brackets
"""

import sys
sys.path.insert(0, 'scripts')
from supabase_env import get_supabase_credentials
import urllib.request, json, re
from collections import defaultdict

u, k = get_supabase_credentials()
headers = {'apikey': k, 'Authorization': f'Bearer {k}', 'Accept': 'application/json'}

# 1. Fetch all existing question_ids in math_review so we know what's already there
req_mr = urllib.request.Request(f'{u}/rest/v1/math_review?select=question_id', headers=headers)
with urllib.request.urlopen(req_mr) as r:
    existing_mr_qids = set(x['question_id'] for x in json.loads(r.read()))

print(f"Currently in review table: {len(existing_mr_qids)} questions")

# 2. Fetch all 75 previous papers
req_papers = urllib.request.Request(f'{u}/rest/v1/previous_papers?select=id,title,year&order=id.asc&limit=100', headers=headers)
with urllib.request.urlopen(req_papers) as r:
    papers = json.loads(r.read())

print(f"Total papers to scan: {len(papers)}")
papers_map = {p['id']: p for p in papers}

# Patterns for error detection
MATH_PATTERNS = [
    r'\\frac', r'\\sqrt', r'\\times', r'\\div', r'\\theta', r'\\pi', r'\\pm',
    r'\\le', r'\\ge', r'\\sin', r'\\cos', r'\\tan', r'\\degree', r'\\Delta',
    r'\bcm\^2\b', r'\bm\^2\b', r'\bcm\^3\b', r'\bm\^3\b', r'\bx\^2\b', r'\by\^2\b',
    r'!\[.*?\]\(.*?\)', r'/images/pyq/', r'Table', r'Chart'
]

GLUED_OCR_WORDS = [
    'declinein', 'contractionof', 'foreignexchange', 'reductionin', 'externalvalue',
    'AsiaticSociety', 'SanskritCollege', 'FortWilliam', 'CalcuttaMadrasa',
    'GlobalSystem', 'KasturbaGandhi', 'Socialreform', 'Alzheimer', 'AffectedOrgans',
    'Electriccurrent', 'PhysicalProperty', 'ModernPeriodicTable', 'RoleinDNA',
    'Commonname', 'Blue-green', 'Brownalgae', 'OrganismResponsible'
]

issues_found = defaultdict(list)
total_scanned = 0

# Fetch questions for all papers in chunks of 5 papers
for i in range(0, len(papers), 5):
    chunk_pids = [p['id'] for p in papers[i:i+5]]
    pid_filter = ','.join(str(pid) for pid in chunk_pids)
    req_q = urllib.request.Request(
        f'{u}/rest/v1/paper_questions?paper_id=in.({pid_filter})&select=id,paper_id,question_number,question_text,option_a,option_b,option_c,option_d,explanation&order=id.asc&limit=1000',
        headers=headers
    )
    with urllib.request.urlopen(req_q) as r:
        qs = json.loads(r.read())

    total_scanned += len(qs)

    for q in qs:
        qid = q['id']
        pid = q['paper_id']
        qnum = q.get('question_number') or 0
        text = q.get('question_text') or ''
        opts = [q.get('option_a') or '', q.get('option_b') or '', q.get('option_c') or '', q.get('option_d') or '']
        expl = q.get('explanation') or ''
        all_text = f"{text} {' '.join(opts)} {expl}"

        # Determine subject
        if 1 <= qnum <= 25:
            cat = 'reasoning'
        elif 26 <= qnum <= 50:
            cat = 'gk'
        elif 51 <= qnum <= 75:
            cat = 'maths'
        elif 76 <= qnum <= 100:
            cat = 'english'
        else:
            cat = 'other'

        detected_issues = []

        # ── 1. Image / Figure Issues (All Subjects) ──
        img_match = re.search(r'!\[.*?\]\((.*?)\)', text)
        if img_match or '/images/pyq/' in text or 'Figure' in text or 'figure' in text:
            img_url = img_match.group(1).strip() if img_match else None
            detected_issues.append(('figure_image', f"Figure / Image crop: {text[:60]}", img_url))

        # ── 2. Maths Issues: Unrendered LaTeX & Symbols ──
        if cat == 'maths':
            for pat in MATH_PATTERNS[:14]:  # LaTeX symbols
                if re.search(pat, all_text):
                    detected_issues.append(('math_latex', f"Unrendered Math / LaTeX symbol ({pat})", None))
                    break
            if 'table' in text.lower() or 'chart' in text.lower():
                detected_issues.append(('math_table', "Data Interpretation / Matrix Table", None))

        # ── 3. Reasoning Issues: Visual Figures & Analogies ──
        if cat == 'reasoning':
            for kw in ['mirror image', 'water image', 'embedded figure', 'figure series', 'paper folding', 'unfolded', 'cube and dice', 'venn diagram', 'pattern completion']:
                if kw in text.lower():
                    detected_issues.append(('reasoning_visual', f"Reasoning Visual Question: {kw.title()}", None))
                    break
            if '::' in text or 'analog' in text.lower():
                detected_issues.append(('reasoning_analogy', "Analogy formatting", None))

        # ── 4. GK / GS Issues: Match Tables & OCR ──
        if cat == 'gk':
            if any(w in text.lower() for w in ['match', 'column a', 'list i', 'match the following']):
                detected_issues.append(('gk_match_table', "Match the Following Table / Matrix", None))
            for gw in GLUED_OCR_WORDS:
                if gw.lower() in text.lower():
                    detected_issues.append(('gk_ocr_glitch', f"Glued OCR text: '{gw}'", None))
                    break

        # ── 5. English Issues: Passages, Blanks & Brackets ──
        if cat == 'english':
            if any(w in text.lower() for w in ['comprehension', 'read the passage', 'read the following passage', 'cloze test']):
                detected_issues.append(('english_passage', "Reading Comprehension / Cloze Passage", None))
            elif any(w in text.lower() for w in ['select the most appropriate', 'in the following passage', 'blank no.', 'blank number']):
                detected_issues.append(('english_cloze_blank', "Cloze Test Blank", None))
            elif any(w in text for w in ['[', ']', 'underlined', 'italicised', 'bracketed']):
                detected_issues.append(('english_bracket_part', "Sentence Improvement / Bracket Part", None))
            elif not q.get('option_a') or not q.get('option_b'):
                detected_issues.append(('english_missing_opt', "Missing Option text", None))

        # ── 6. Null Bytes or Broken Encodings ──
        if '\x00' in all_text:
            detected_issues.append(('encoding_null_byte', "Broken null byte character in text", None))

        if detected_issues:
            issues_found[cat].append({
                'qid': qid,
                'pid': pid,
                'qnum': qnum,
                'text': text,
                'issues': detected_issues,
                'already_in_mr': qid in existing_mr_qids
            })

print(f"\nScan complete! Scanned {total_scanned} questions across {len(papers)} papers.")
print("\n=== ISSUES DETECTED BY CATEGORY ===")
for cat, items in sorted(issues_found.items()):
    in_mr = sum(1 for x in items if x['already_in_mr'])
    not_in_mr = len(items) - in_mr
    print(f"{cat.upper():<12}: {len(items):>5} questions with issues ({in_mr} in review, {not_in_mr} new available!)")
