import requests
import json
import sys

sys.stdout.reconfigure(encoding='utf-8')

SUPABASE_URL = 'https://rmobqopitkjobcnyqzru.supabase.co'
SERVICE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJtb2Jxb3BpdGtqb2JjbnlxenJ1Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc4NTQwMzc3NiwiZXhwIjoyMTAwOTc5Nzc2fQ.tlewx6VDcbni_kJfy0IVfZ7yqwywHfNEoVCRj8-oLaA'
HEADERS = {
    'apikey': SERVICE_KEY,
    'Authorization': f'Bearer {SERVICE_KEY}'
}

res = requests.get(f'{SUPABASE_URL}/rest/v1/papers?select=*&order=id.asc', headers=HEADERS)
papers = res.json()
print(f"Total papers in Supabase: {len(papers)}")
for p in papers:
    print(f"ID {p['id']}: {p.get('title')} | year: {p.get('year')} | slug: {p.get('slug')}")
