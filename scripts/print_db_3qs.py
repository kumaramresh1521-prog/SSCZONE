import requests
import json

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

# Shift 2 (Paper 40): Q.6
res = requests.get(f"{supabase_url}/rest/v1/paper_questions?paper_id=eq.40&question_number=eq.6", headers=headers)
print("Paper 40 Q.6:", res.json())

# Paper 46 (10 Oct S2): Q.7
res = requests.get(f"{supabase_url}/rest/v1/paper_questions?paper_id=eq.46&question_number=eq.7", headers=headers)
print("\nPaper 46 Q.7:", res.json())

# Paper 47 (10 Oct S3): Q.13
res = requests.get(f"{supabase_url}/rest/v1/paper_questions?paper_id=eq.47&question_number=eq.13", headers=headers)
print("\nPaper 47 Q.13:", res.json())
