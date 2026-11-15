import requests
from supabase_env import get_supabase_credentials

url, key = get_supabase_credentials()
headers = {"apikey": key, "Authorization": f"Bearer {key}"}

r = requests.get(f"{url}/rest/v1/questions?topic_id=eq.264&select=id&order=id.asc", headers=headers)
ids = [q["id"] for q in r.json()]
print(f"Found {len(ids)} questions in topic 264. ID range: {ids[0]} to {ids[-1]}")
