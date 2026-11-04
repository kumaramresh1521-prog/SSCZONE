import requests
import json

supabase_url = "https://rmobqopitkjobcnyqzru.supabase.co"
service_key = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJtb2Jxb3BpdGtqb2JjbnlxenJ1Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc4NTQwMzc3NiwiZXhwIjoyMTAwOTc5Nzc2fQ.tlewx6VDcbni_kJfy0IVfZ7yqwywHfNEoVCRj8-oLaA"

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
