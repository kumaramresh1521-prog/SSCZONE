import requests
import json
from supabase_env import get_supabase_credentials

supabase_url, service_key = get_supabase_credentials()

headers = {
    "apikey": service_key,
    "Authorization": f"Bearer {service_key}",
    "Content-Type": "application/json"
}

# Fetch 1 row from previous_papers to see columns
res = requests.get(f"{supabase_url}/rest/v1/previous_papers?limit=5", headers=headers)
print("Status:", res.status_code)
if res.ok:
    data = res.json()
    print("Found papers count:", len(data))
    if data:
        print("Sample paper columns:", list(data[0].keys()))
        print("Sample paper:", data[0])
    else:
        print("previous_papers is currently empty.")
