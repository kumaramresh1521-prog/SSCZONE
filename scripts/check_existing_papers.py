import requests
import json
import sys
from supabase_env import get_supabase_credentials

sys.stdout.reconfigure(encoding='utf-8')

SUPABASE_URL, SERVICE_KEY = get_supabase_credentials()
HEADERS = {
    'apikey': SERVICE_KEY,
    'Authorization': f'Bearer {SERVICE_KEY}'
}

res = requests.get(f'{SUPABASE_URL}/rest/v1/papers?select=*&order=id.asc', headers=HEADERS)
papers = res.json()
print(f"Total papers in Supabase: {len(papers)}")
for p in papers:
    print(f"ID {p['id']}: {p.get('title')} | year: {p.get('year')} | slug: {p.get('slug')}")
