import requests
import json
from supabase_env import get_supabase_credentials

SUPABASE_URL, SERVICE_KEY = get_supabase_credentials()

headers = {
    "apikey": SERVICE_KEY,
    "Authorization": f"Bearer {SERVICE_KEY}"
}

# 1. Fetch 3 questions from questions table
r_qb = requests.get(f"{SUPABASE_URL}/rest/v1/questions?select=id,question_text,question_text_hi,option_a,correct_answer,topics(id,title,subject_id,subjects(title))&limit=3", headers=headers)
print("QB Samples:")
print(json.dumps(r_qb.json(), indent=2))

# 2. Fetch 3 questions from paper_questions table
r_pyq = requests.get(f"{SUPABASE_URL}/rest/v1/paper_questions?select=id,paper_id,question_number,question_text,option_a,correct_answer,explanation&limit=3", headers=headers)
print("\nPYQ Samples:")
print(json.dumps(r_pyq.json(), indent=2))
