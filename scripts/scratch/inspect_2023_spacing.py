import sys
sys.path.insert(0, 'c:/ssczone/scripts')
from supabase_env import get_supabase_credentials
import urllib.request, json, re

u, k = get_supabase_credentials()

# Check paper 110 (2023) questions
req = urllib.request.Request(
    f'{u}/rest/v1/paper_questions?paper_id=eq.110&select=question_number,question_text,option_a,option_b,option_c,option_d&order=question_number.asc&limit=25',
    headers={'apikey': k, 'Authorization': f'Bearer {k}'}
)
with urllib.request.urlopen(req) as r:
    data = json.loads(r.read())
    print('Checking Paper 110 (2023) questions for formatting patterns:')
    for q in data:
        qno = q['question_number']
        txt = q['question_text'] or ''
        # Check if multiple spaces exist
        has_multi_space = bool(re.search(r'[^\S\r\n]{2,}', txt))
        # Check if newlines exist
        newlines_count = txt.count('\n')
        # Check if tab exists
        has_tab = '\t' in txt
        
        print(f"Q.{qno}: len={len(txt)}, newlines={newlines_count}, multi_spaces={has_multi_space}, has_tab={has_tab}")
        if newlines_count > 0 or has_multi_space:
            lines = txt.split('\n')
            for l_idx, l in enumerate(lines):
                print(f"   L{l_idx+1}: {repr(l)}")
        print()
