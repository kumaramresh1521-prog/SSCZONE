import requests
from supabase_env import get_supabase_credentials

SUPABASE_URL, SERVICE_KEY = get_supabase_credentials()

headers = {"apikey": SERVICE_KEY, "Authorization": f"Bearer {SERVICE_KEY}"}

r = requests.get(f"{SUPABASE_URL}/rest/v1/subjects?select=id,title,exam_id", headers=headers)
subjects = r.json()
print("All subjects in DB:")
for s in subjects:
    print(s)
