import requests
import json

SUPABASE_URL = "https://rmobqopitkjobcnyqzru.supabase.co"
SERVICE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJtb2Jxb3BpdGtqb2JjbnlxenJ1Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc4NTQwMzc3NiwiZXhwIjoyMTAwOTc5Nzc2fQ.tlewx6VDcbni_kJfy0IVfZ7yqwywHfNEoVCRj8-oLaA"

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
