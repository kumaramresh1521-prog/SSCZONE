# -*- coding: utf-8 -*-
"""
Populates a comprehensive set of real issues across all 75 papers and all 4 subjects:
- Maths (Formulas, DI Tables, Geometry Figures)
- Reasoning (Mirror Images, Paper Folding, Embedded Figures, Analogies)
- GK / GS (Match Tables, Glued OCR Text, Science Diagrams)
- English (Comprehension Passages, Cloze Blanks, Sentence Improvement Brackets)
"""

import sys
sys.path.insert(0, 'scripts')
from supabase_env import get_supabase_credentials
import urllib.request, json, re
from collections import defaultdict

u, k = get_supabase_credentials()
headers = {
    'apikey': k,
    'Authorization': f'Bearer {k}',
    'Accept': 'application/json',
    'Content-Type': 'application/json',
    'Prefer': 'return=representation'
}

# 1. Existing question_ids in math_review
req_mr = urllib.request.Request(f'{u}/rest/v1/math_review?select=question_id', headers=headers)
with urllib.request.urlopen(req_mr) as r:
    existing_mr_qids = set(x['question_id'] for x in json.loads(r.read()))

print(f"Already in review table: {len(existing_mr_qids)} questions")

# 2. Fetch all 75 papers
req_papers = urllib.request.Request(f'{u}/rest/v1/previous_papers?select=id,title,year&order=id.asc&limit=100', headers=headers)
with urllib.request.urlopen(req_papers) as r:
    papers = json.loads(r.read())

papers_map = {p['id']: p for p in papers}

# Error patterns
GLUED_OCR_WORDS = [
    'declinein', 'contractionof', 'foreignexchange', 'reductionin', 'externalvalue',
    'AsiaticSociety', 'SanskritCollege', 'FortWilliam', 'CalcuttaMadrasa',
    'GlobalSystem', 'KasturbaGandhi', 'Socialreform', 'Alzheimer', 'AffectedOrgans',
    'Electriccurrent', 'PhysicalProperty', 'ModernPeriodicTable', 'RoleinDNA',
    'Commonname', 'Blue-green', 'Brownalgae', 'OrganismResponsible'
]

to_insert = []
target_per_cat = {
    'gk': 60,         # All GK issues
    'maths': 100,     # Top 100 Maths
    'reasoning': 100, # Top 100 Reasoning
    'english': 100    # Top 100 English
}
current_added = defaultdict(int)

# Process in chunks of 5 papers
for i in range(0, len(papers), 5):
    chunk_pids = [p['id'] for p in papers[i:i+5]]
    pid_filter = ','.join(str(pid) for pid in chunk_pids)
    req_q = urllib.request.Request(
        f'{u}/rest/v1/paper_questions?paper_id=in.({pid_filter})&select=id,paper_id,question_number,question_text,option_a,option_b,option_c,option_d,explanation&order=id.asc&limit=1000',
        headers=headers
    )
    with urllib.request.urlopen(req_q) as r:
        qs = json.loads(r.read())

    for q in qs:
        qid = q['id']
        if qid in existing_mr_qids:
            continue

        pid = q['paper_id']
        pinfo = papers_map.get(pid, {})
        qnum = q.get('question_number') or 0
        text = q.get('question_text') or ''
        opts = [q.get('option_a') or '', q.get('option_b') or '', q.get('option_c') or '', q.get('option_d') or '']
        all_text = f"{text} {' '.join(opts)}"

        if 1 <= qnum <= 25: cat = 'reasoning'
        elif 26 <= qnum <= 50: cat = 'gk'
        elif 51 <= qnum <= 75: cat = 'maths'
        elif 76 <= qnum <= 100: cat = 'english'
        else: continue

        if current_added[cat] >= target_per_cat[cat]:
            continue

        issue_tag = None
        issue_desc = None
        img_url = None

        # Check image
        img_m = re.search(r'!\[.*?\]\((.*?)\)', text)
        if img_m:
            img_url = img_m.group(1).strip()

        # Category-specific issue detection
        if cat == 'maths':
            if '\\frac' in all_text or '\\sqrt' in all_text or '\\times' in all_text or '\\theta' in all_text:
                issue_tag = "[Math Formula]"
                issue_desc = f"LaTeX formula: {text[:50]}"
            elif 'table' in text.lower() or 'chart' in text.lower():
                issue_tag = "[DI Table]"
                issue_desc = f"Data Interpretation Table: {text[:50]}"
            elif img_url:
                issue_tag = "[Math Figure]"
                issue_desc = f"Geometry/Trig figure: {text[:50]}"

        elif cat == 'reasoning':
            for kw in ['mirror image', 'water image', 'embedded figure', 'figure series', 'paper folding', 'unfolded', 'cube', 'dice', 'venn diagram']:
                if kw in text.lower():
                    issue_tag = f"[{kw.title()}]"
                    issue_desc = f"Visual reasoning: {kw.title()}"
                    break
            if not issue_tag and img_url:
                issue_tag = "[Reasoning Figure]"
                issue_desc = f"Figure question: {text[:50]}"
            elif not issue_tag and '::' in text:
                issue_tag = "[Analogy]"
                issue_desc = f"Analogy question: {text[:50]}"

        elif cat == 'gk':
            if any(w in text.lower() for w in ['match', 'column a', 'list i']):
                issue_tag = "[Match Table]"
                issue_desc = f"Match the following: {text[:50]}"
            elif any(gw.lower() in text.lower() for gw in GLUED_OCR_WORDS):
                issue_tag = "[OCR Glitch]"
                issue_desc = f"Glued OCR words in GK: {text[:50]}"
            elif img_url:
                issue_tag = "[GK Diagram]"
                issue_desc = f"Scientific/Historical diagram: {text[:50]}"

        elif cat == 'english':
            if any(w in text.lower() for w in ['comprehension', 'read the passage', 'read the following passage']):
                issue_tag = "[Passage]"
                issue_desc = f"Reading comprehension: {text[:50]}"
            elif any(w in text.lower() for w in ['in the following passage', 'blank no.', 'blank number']):
                issue_tag = "[Cloze Blank]"
                issue_desc = f"Cloze test blank: {text[:50]}"
            elif any(w in text for w in ['[', ']', 'underlined', 'italicised', 'bracketed']):
                issue_tag = "[Sentence Improvement]"
                issue_desc = f"Bracket/Sentence improvement: {text[:50]}"
            elif not q.get('option_a') or not q.get('option_b'):
                issue_tag = "[Missing Option]"
                issue_desc = f"Empty/Missing option: {text[:50]}"

        if issue_tag:
            to_insert.append({
                'question_id': qid,
                'paper_id': pid,
                'question_number': qnum,
                'field_name': 'question_text',
                'original_text': text,
                'suggested_latex': text,
                'status': 'pending',
                'source_image_url': img_url,
                'review_notes': f"[{cat.upper()}] {issue_tag} {issue_desc} - {pinfo.get('title', '')[:30]}",
            })
            existing_mr_qids.add(qid)
            current_added[cat] += 1

print(f"Prepared {len(to_insert)} new candidates: {dict(current_added)}")

# Insert in chunks of 25
inserted = 0
for i in range(0, len(to_insert), 25):
    chunk = to_insert[i:i+25]
    req_post = urllib.request.Request(
        f'{u}/rest/v1/math_review',
        data=json.dumps(chunk).encode('utf-8'),
        headers=headers,
        method='POST'
    )
    try:
        with urllib.request.urlopen(req_post) as r:
            res = json.loads(r.read())
            inserted += len(res)
    except Exception as e:
        print(f"Error at chunk {i}: {e}")

print(f"\nSuccessfully inserted {inserted} new diverse review questions!")
