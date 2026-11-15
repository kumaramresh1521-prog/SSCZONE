import sys
sys.path.insert(0, 'c:/ssczone/scripts')
from supabase_env import get_supabase_credentials
import urllib.request, json

u, k = get_supabase_credentials()

# Fetch 2023 paper 110
req23 = urllib.request.Request(
    f'{u}/rest/v1/paper_questions?paper_id=eq.110&select=question_number,question_text,option_a,option_b,option_c,option_d&order=question_number.asc&limit=8',
    headers={'apikey': k, 'Authorization': f'Bearer {k}'}
)
with urllib.request.urlopen(req23) as r:
    data23 = json.loads(r.read())
    print('=== 2023 Paper 110 Questions ===')
    for q in data23:
        print(f"Q.{q['question_number']}:")
        print(repr(q['question_text']))
        print("Opts:", repr(q['option_a']), repr(q['option_b']), repr(q['option_c']), repr(q['option_d']))
        print()

# Fetch 2024 paper 66
req24 = urllib.request.Request(
    f'{u}/rest/v1/paper_questions?paper_id=eq.66&select=question_number,question_text,option_a,option_b,option_c,option_d&order=question_number.asc&limit=5',
    headers={'apikey': k, 'Authorization': f'Bearer {k}'}
)
with urllib.request.urlopen(req24) as r:
    data24 = json.loads(r.read())
    print('=== 2024 Paper 66 Questions ===')
    for q in data24:
        print(f"Q.{q['question_number']}:")
        print(repr(q['question_text']))
        print("Opts:", repr(q['option_a']), repr(q['option_b']), repr(q['option_c']), repr(q['option_d']))
        print()
