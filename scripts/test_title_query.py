import requests
import json
import urllib.parse

env_path = ".env.local"
supabase_url = None
supabase_key = None

with open(env_path, "r", encoding="utf-8") as f:
    for line in f:
        if "NEXT_PUBLIC_SUPABASE_URL" in line and "=" in line:
            supabase_url = line.split("=", 1)[1].strip().strip('\"\'')
        if "SUPABASE_SERVICE_ROLE_KEY" in line and "=" in line:
            supabase_key = line.split("=", 1)[1].strip().strip('\"\'')

headers = {
    "apikey": supabase_key,
    "Authorization": f"Bearer {supabase_key}",
    "Content-Type": "application/json"
}

title = "SSC CGL 2025 Tier-I (Held On 12 Sept 2025 Shift 1)"
enc = urllib.parse.quote(title)
res = requests.get(f"{supabase_url}/rest/v1/previous_papers?title=eq.{enc}&select=id,title", headers=headers)
print("Status:", res.status_code)
print("Found:", res.json())
