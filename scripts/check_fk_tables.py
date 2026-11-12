import os, json, urllib.request

env_path = '.env.local'
url = None
key = None
with open(env_path, 'r', encoding='utf-8') as f:
    for line in f:
        if line.startswith('NEXT_PUBLIC_SUPABASE_URL='):
            url = line.split('=', 1)[1].strip()
        elif line.startswith('SUPABASE_SERVICE_ROLE_KEY='):
            key = line.split('=', 1)[1].strip()

# Check some common attempt tables to see if they exist and reference paper_id
tables_to_check = ['test_attempts', 'user_test_attempts', 'paper_attempts', 'bookmarks', 'question_reports', 'user_answers']
for t in tables_to_check:
    req = urllib.request.Request(
        f'{url}/rest/v1/{t}?limit=1',
        headers={'apikey': key, 'Authorization': f'Bearer {key}'}
    )
    try:
        with urllib.request.urlopen(req) as resp:
            data = json.loads(resp.read().decode())
            print(f"Table '{t}' exists, sample: {data[:1]}")
    except Exception as e:
        # Table might not exist
        pass

# Check questions count for 2025 and 2026
req = urllib.request.Request(
    f'{url}/rest/v1/paper_questions?select=paper_id&limit=1',
    headers={'apikey': key, 'Authorization': f'Bearer {key}'}
)
try:
    with urllib.request.urlopen(req) as resp:
        print("paper_questions table accessible.")
except Exception as e:
    print(f"Error accessing paper_questions: {e}")
