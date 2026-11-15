import urllib.request
import json

env = {}
with open('.env.local') as f:
    for line in f:
        if '=' in line and not line.strip().startswith('#'):
            k, v = line.strip().split('=', 1)
            env[k.strip()] = v.strip().strip('"').strip("'")

url = env.get('NEXT_PUBLIC_SUPABASE_URL')
key = env.get('SUPABASE_SERVICE_ROLE_KEY')
headers = {'apikey': key, 'Authorization': f'Bearer {key}'}

tables = ['blogs', 'previous_papers', 'paper_questions', 'questions', 'exams', 'topics', 'subjects']

for tbl in tables:
    try:
        # Get count
        req = urllib.request.Request(f"{url}/rest/v1/{tbl}?select=*&limit=1", headers={**headers, 'Range': '0-0', 'Prefer': 'count=exact'})
        with urllib.request.urlopen(req) as res:
            content_range = res.headers.get('Content-Range')
            total = content_range.split('/')[-1] if content_range else 'unknown'
            data = json.loads(res.read().decode('utf-8'))
            sample_size = len(json.dumps(data[0])) if data else 0
            print(f"Table '{tbl}': total_rows={total}, avg_sample_size={sample_size} bytes")
    except Exception as e:
        print(f"Table '{tbl}' error: {e}")
