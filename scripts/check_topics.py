import urllib.request
import json

with open('.env.local', 'r', encoding='utf-8') as f:
    for line in f:
        if line.startswith('NEXT_PUBLIC_SUPABASE_URL='):
            url = line.split('=', 1)[1].strip()
        elif line.startswith('SUPABASE_SERVICE_ROLE_KEY='):
            key = line.split('=', 1)[1].strip()

headers = {'apikey': key, 'Authorization': f'Bearer {key}'}

req = urllib.request.Request(f'{url}/rest/v1/topics?subject_id=eq.3&select=id,title,slug,sort_order', headers=headers)
with urllib.request.urlopen(req) as resp:
    topics = json.loads(resp.read().decode('utf-8'))
    for t in sorted(topics, key=lambda x: x.get('sort_order') or 0):
        print(f"ID {t['id']}: {t['title']} (slug: {t.get('slug')})")
