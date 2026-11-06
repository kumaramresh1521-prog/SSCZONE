import requests
import json

with open('.env.local') as f:
    env = dict(line.strip().split('=', 1) for line in f if '=' in line and not line.startswith('#'))
url = env['NEXT_PUBLIC_SUPABASE_URL'].strip('\"\'')
key = env['SUPABASE_SERVICE_ROLE_KEY'].strip('\"\'')
headers = {'apikey': key, 'Authorization': f'Bearer {key}'}

res = requests.get(f'{url}/rest/v1/paper_questions?paper_id=eq.25&limit=1', headers=headers).json()
qid = res[0]['id']
print('Sample q id:', qid)

# Test PATCH directly by id!
r_patch = requests.patch(f'{url}/rest/v1/paper_questions?id=eq.{qid}', headers=headers, json={'question_text': res[0]['question_text']})
print('PATCH status:', r_patch.status_code)

# Test upsert with on_conflict=id
payload = [{'id': qid, 'paper_id': 25, 'question_number': res[0]['question_number'], 'question_text': res[0]['question_text']}]
r = requests.post(f'{url}/rest/v1/paper_questions?on_conflict=id', headers={**headers, 'Prefer': 'resolution=merge-duplicates'}, json=payload)
print('Upsert status:', r.status_code)
if not r.ok:
    print(r.text)
