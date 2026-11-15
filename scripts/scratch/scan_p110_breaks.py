import sys
sys.path.insert(0, 'c:/ssczone/scripts')
from supabase_env import get_supabase_credentials
import urllib.request, json, re

u, k = get_supabase_credentials()

# Check paper 110 (2023) all 100 questions
req = urllib.request.Request(
    f'{u}/rest/v1/paper_questions?paper_id=eq.110&select=question_number,question_text&order=question_number.asc',
    headers={'apikey': k, 'Authorization': f'Bearer {k}'}
)
with urllib.request.urlopen(req) as r:
    data = json.loads(r.read())
    
print(f'Checking {len(data)} questions of Paper 110...')
for q in data:
    txt = q['question_text'] or ''
    # Check for empty lines, multiple spaces, \n\n, or strange patterns
    if '\n\n' in txt or re.search(r'[^\S\r\n]{4,}', txt) or txt.count('\n') >= 3:
        print(f"Q.{q['question_number']} (newlines={txt.count(chr(10))}):")
        print(repr(txt[:180]))
        print()
