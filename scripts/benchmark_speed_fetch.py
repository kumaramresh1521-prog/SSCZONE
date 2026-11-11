import requests
import random
import time
from supabase_env import get_supabase_credentials

SUPABASE_URL, SERVICE_KEY = get_supabase_credentials()

headers = {
    "apikey": SERVICE_KEY,
    "Authorization": f"Bearer {SERVICE_KEY}"
}

t0 = time.time()
# 1. Pick 3 random paper IDs
paper_ids = random.sample([1, 4, 12, 15, 20, 25, 30, 35, 39, 40, 41, 42, 43, 44, 45, 46], 3)
r_pyq = requests.get(f"{SUPABASE_URL}/rest/v1/paper_questions?paper_id=in.({','.join(map(str, paper_ids))})&limit=50", headers=headers)
pyq_list = r_pyq.json()
print(f"Fetched {len(pyq_list)} PYQ candidates in {time.time()-t0:.2f}s")

# 2. Pick random offset from questions
t1 = time.time()
offset = random.randint(0, 5000)
r_qb = requests.get(f"{SUPABASE_URL}/rest/v1/questions?select=id,question_text,question_text_hi,option_a,option_b,option_c,option_d,correct_answer,explanation,topics(id,title,subject_id,subjects(title))&offset={offset}&limit=25", headers=headers)
qb_list = r_qb.json()
print(f"Fetched {len(qb_list)} QB candidates in {time.time()-t1:.2f}s")
print(f"Total time: {time.time()-t0:.2f}s")
