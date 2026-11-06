import os
import requests
import json

SUPABASE_URL = "https://rmobqopitkjobcnyqzru.supabase.co"
SERVICE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJtb2Jxb3BpdGtqb2JjbnlxenJ1Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc4NTQwMzc3NiwiZXhwIjoyMTAwOTc5Nzc2fQ.tlewx6VDcbni_kJfy0IVfZ7yqwywHfNEoVCRj8-oLaA"

headers = {
    "apikey": SERVICE_KEY,
    "Authorization": f"Bearer {SERVICE_KEY}"
}

def check_table(table, limit=1):
    r = requests.get(f"{SUPABASE_URL}/rest/v1/{table}?limit={limit}", headers=headers)
    print(f"=== Table: {table} (status: {r.status_code}) ===")
    if r.status_code == 200:
        data = r.json()
        if data:
            print(json.dumps(data[0], indent=2))
        else:
            print("Empty table")
    else:
        print(r.text)

check_table("questions")
check_table("paper_questions")
check_table("subjects")
check_table("topics")
