import requests
import re
import sys

sys.stdout.reconfigure(encoding='utf-8')

env = {}
with open(r'c:\ssczone\.env.local', 'r', encoding='utf-8') as f:
    for line in f:
        line = line.strip()
        if '=' in line and not line.startswith('#'):
            k, v = line.split('=', 1)
            env[k.strip()] = v.strip().strip('"\'')

SUPABASE_URL = env['NEXT_PUBLIC_SUPABASE_URL']
SUPABASE_KEY = env['SUPABASE_SERVICE_ROLE_KEY']
HEADERS = {'apikey': SUPABASE_KEY, 'Authorization': f'Bearer {SUPABASE_KEY}'}

r = requests.get(f'{SUPABASE_URL}/rest/v1/previous_papers?order=id.asc', headers=HEADERS)
papers = r.json()

print(f"Total papers to audit: {len(papers)}")

broken_questions = []

for p in papers:
    pid = p['id']
    title = p.get('title', '')
    qr = requests.get(f'{SUPABASE_URL}/rest/v1/paper_questions?paper_id=eq.{pid}&order=question_number.asc', headers=HEADERS)
    qs = qr.json()
    
    for q in qs:
        qnum = q['question_number']
        txt = (q['question_text'] or "").strip()
        a = (q['option_a'] or "").strip()
        b = (q['option_b'] or "").strip()
        c = (q['option_c'] or "").strip()
        d = (q['option_d'] or "").strip()
        
        # Reasons for being broken:
        # 1. Empty or nearly empty question text
        # 2. Missing equation: text ends with "Evaluate:" or "Simplify:" or "Calculate:" with nothing else
        # 3. Empty options
        # 4. Text has unresolved placeholders like "__" or "—" as the main formula
        issue = None
        if not txt:
            issue = "EMPTY_TEXT"
        elif re.match(r'^(?:Evaluate|Simplify|Solve|Calculate)\s*:\s*(?:ज्ञात\s*कीजिए|सरल\s*कीजिए)?\s*[।.]?\s*$', txt, re.IGNORECASE):
            issue = "MISSING_FORMULA"
        elif not a or not b or not c or not d:
            issue = "EMPTY_OPTION"
        elif len(txt) < 15 and not ('![' in txt or '<img' in txt):
            issue = "TOO_SHORT"
            
        if issue:
            broken_questions.append({
                'paper_id': pid,
                'paper_title': title,
                'qnum': qnum,
                'issue': issue,
                'text': txt,
                'a': a, 'b': b, 'c': c, 'd': d
            })

print(f"\nAUDIT COMPLETE: Found {len(broken_questions)} broken/defective questions across all papers!")
for bq in broken_questions[:30]:
    print(f"\n[Paper {bq['paper_id']} - {bq['paper_title'][:35]}] Q.{bq['qnum']} ({bq['issue']}):")
    print(f"  TEXT: '{bq['text']}'")
    print(f"  OPTS: A: '{bq['a']}' | B: '{bq['b']}' | C: '{bq['c']}' | D: '{bq['d']}'")
