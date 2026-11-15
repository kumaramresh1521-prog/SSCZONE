import requests
from supabase_env import get_supabase_credentials

url, key = get_supabase_credentials()
headers = {"apikey": key, "Authorization": f"Bearer {key}"}
r = requests.get(f"{url}/rest/v1/questions?topic_id=eq.264&select=id,question_text,exam_tag&order=id.asc&limit=5", headers=headers)
for q in r.json():
    print(f"ID: {q['id']}, Exam: {q['exam_tag']}")
    print(repr(q["question_text"][:200]))
    print("---")
