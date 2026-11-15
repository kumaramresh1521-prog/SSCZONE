import sys
sys.path.insert(0, 'c:/ssczone/scripts')
from supabase_env import get_supabase_credentials
import urllib.request, json

u, k = get_supabase_credentials()

# Check paper 113 questions
req = urllib.request.Request(
    f'{u}/rest/v1/paper_questions?paper_id=eq.113&select=id,question_number,question_text,option_a,option_b,option_c,option_d,correct_answer,explanation',
    headers={'apikey': k, 'Authorization': f'Bearer {k}'}
)
with urllib.request.urlopen(req) as r:
    data = json.loads(r.read())
    print('Total questions in Paper 113:', len(data))
    for q in data:
        txt = q['question_text'] or ''
        # Let's check for tables, images, markdown or anything modified
        if '|' in txt or '![' in txt or '$$' in txt or '\\' in txt or 'match' in txt.lower() or 'column' in txt.lower():
            print(f"Q#{q['id']} (Q.{q['question_number']}):")
            print("  Text:", repr(txt[:300]))
            print("  Options:", q['option_a'], "|", q['option_b'], "|", q['option_c'], "|", q['option_d'])
            print("  Answer:", q['correct_answer'])
            print()
