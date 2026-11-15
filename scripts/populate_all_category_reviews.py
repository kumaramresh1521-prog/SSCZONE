# -*- coding: utf-8 -*-
"""
Populates questions needing review across all 4 categories:
- Reasoning (Q.1 - Q.25)
- GK / GS (Q.26 - Q.50)
- Maths (Q.51 - Q.75)
- English (Q.76 - Q.100)
Into the math_review table so admin can review and approve them.
"""

import sys
sys.path.insert(0, 'scripts')
from supabase_env import get_supabase_credentials
import urllib.request, json, re

u, k = get_supabase_credentials()
headers = {
    'apikey': k,
    'Authorization': f'Bearer {k}',
    'Accept': 'application/json',
    'Content-Type': 'application/json',
    'Prefer': 'return=representation'
}

# 1. Fetch existing question_ids in math_review to avoid duplicates
req_mr = urllib.request.Request(f'{u}/rest/v1/math_review?select=question_id', headers=headers)
with urllib.request.urlopen(req_mr) as r:
    existing_qids = set(x['question_id'] for x in json.loads(r.read()))

print(f"Already in review table: {len(existing_qids)} questions")

# 2. Query papers across 2024 and 2023 to find questions with issues
req_papers = urllib.request.Request(
    f'{u}/rest/v1/previous_papers?select=id,title,year&order=id.desc&limit=25',
    headers=headers
)
with urllib.request.urlopen(req_papers) as r:
    papers = json.loads(r.read())

print(f"Scanning {len(papers)} papers for all-category review candidates...")

to_insert = []
counts = {'reasoning': 0, 'gk': 0, 'maths': 0, 'english': 0}
MAX_PER_CAT = 25  # Healthy balanced initial queue per category

for p in papers:
    pid = p['id']
    req_q = urllib.request.Request(
        f'{u}/rest/v1/paper_questions?paper_id=eq.{pid}&select=id,paper_id,question_number,question_text,option_a,option_b,option_c,option_d&order=question_number.asc',
        headers=headers
    )
    with urllib.request.urlopen(req_q) as r:
        questions = json.loads(r.read())

    for q in questions:
        qid = q['id']
        if qid in existing_qids:
            continue

        q_num = q.get('question_number') or 0
        text = q.get('question_text') or ''

        # Determine category
        if 1 <= q_num <= 25:
            cat = 'reasoning'
        elif 26 <= q_num <= 50:
            cat = 'gk'
        elif 51 <= q_num <= 75:
            cat = 'maths'
        elif 76 <= q_num <= 100:
            cat = 'english'
        else:
            continue

        if counts[cat] >= MAX_PER_CAT:
            continue

        # Check for review-worthy issues
        has_img = '![' in text or '.png' in text or 'Figure' in text or 'image' in text.lower()
        has_latex = '\\frac' in text or '\\sqrt' in text or '\\times' in text or '^' in text or '\\theta' in text
        has_table = 'Table' in text or 'Column A' in text or 'Match the' in text
        has_passage = 'Read the following' in text or 'Comprehension' in text or 'Cloze' in text
        has_missing_opt = not q.get('option_a') or not q.get('option_b')

        issue_note = None
        if cat == 'reasoning' and has_img:
            issue_note = f"Reasoning Visual/Figure Q.{q_num}"
        elif cat == 'maths' and (has_latex or has_img or has_table):
            issue_note = f"Maths Formula/Diagram Q.{q_num}"
        elif cat == 'gk' and (has_table or has_img):
            issue_note = f"GK Match/Diagram Q.{q_num}"
        elif cat == 'english' and (has_passage or has_missing_opt or has_img or 'Select the' in text):
            issue_note = f"English Question Q.{q_num}"

        if issue_note:
            # Extract image url if present
            img_match = re.search(r'!\[.*?\]\((.*?)\)', text)
            img_url = img_match.group(1).strip() if img_match else None

            to_insert.append({
                'question_id': qid,
                'paper_id': pid,
                'question_number': q_num,
                'field_name': 'question_text',
                'original_text': text,
                'suggested_latex': text,  # Default to current text so admin can edit
                'status': 'pending',
                'source_image_url': img_url,
                'review_notes': f"[{cat.upper()}] {issue_note} - {p.get('title', '')[:30]}",
            })
            existing_qids.add(qid)
            counts[cat] += 1

print(f"Candidates prepared: {counts} (Total: {len(to_insert)})")

# Insert in chunks of 20
if to_insert:
    inserted_total = 0
    chunk_size = 20
    for i in range(0, len(to_insert), chunk_size):
        chunk = to_insert[i:i+chunk_size]
        req_post = urllib.request.Request(
            f'{u}/rest/v1/math_review',
            data=json.dumps(chunk).encode('utf-8'),
            headers=headers,
            method='POST'
        )
        try:
            with urllib.request.urlopen(req_post) as r:
                res = json.loads(r.read())
                inserted_total += len(res)
        except Exception as e:
            print(f"Insert error at chunk {i}: {e}")

    print(f"Successfully inserted {inserted_total} questions into review table across all categories!")
else:
    print("No new candidates to insert.")
