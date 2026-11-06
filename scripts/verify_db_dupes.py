import requests
import json
import sys

sys.stdout.reconfigure(encoding='utf-8')

env = dict(l.strip().split('=', 1) for l in open('.env.local') if '=' in l and not l.startswith('#'))
headers = {'apikey': env['SUPABASE_SERVICE_ROLE_KEY'], 'Authorization': 'Bearer ' + env['SUPABASE_SERVICE_ROLE_KEY']}

pids = [6, 7, 19, 25, 26, 27, 28, 29, 30, 31, 32, 33, 34, 35, 36, 37, 38, 39, 40, 41, 42, 43, 44, 45, 46, 47, 48, 49, 50, 51, 52, 53]

total_bad = 0
for pid in pids:
    url = f"{env['NEXT_PUBLIC_SUPABASE_URL']}/rest/v1/paper_questions?paper_id=eq.{pid}&select=question_number,option_a,option_b,option_c,option_d"
    r = requests.get(url, headers=headers)
    questions = r.json()
    bad = []
    for q in questions:
        opts = [q['option_a'].strip(), q['option_b'].strip(), q['option_c'].strip(), q['option_d'].strip()]
        if len(set(opts)) < 4:
            bad.append((q['question_number'], opts))
    if bad:
        print(f"Paper {pid}: {len(bad)} duplicate questions: {bad}")
        total_bad += len(bad)

print(f"Supabase DB verification complete! Total questions with duplicate options: {total_bad}")
