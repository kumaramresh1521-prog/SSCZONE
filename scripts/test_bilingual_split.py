import requests
import re

SUPABASE_URL = "https://rmobqopitkjobcnyqzru.supabase.co"
SERVICE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJtb2Jxb3BpdGtqb2JjbnlxenJ1Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc4NTQwMzc3NiwiZXhwIjoyMTAwOTc5Nzc2fQ.tlewx6VDcbni_kJfy0IVfZ7yqwywHfNEoVCRj8-oLaA"
headers = {"apikey": SERVICE_KEY, "Authorization": f"Bearer {SERVICE_KEY}"}

def split_bilingual(text):
    if not text:
        return "", None
    # Check for slash split like "Chile / चिली"
    if "/" in text:
        parts = text.split("/")
        if len(parts) == 2 and re.search(r'[\u0900-\u097F]', parts[1]):
            return parts[0].strip(), parts[1].strip()
    
    # Check where Devanagari starts
    m = re.search(r'[\u0900-\u097F]', text)
    if m:
        idx = m.start()
        if idx > 0:
            return text[:idx].strip(), text[idx:].strip()
        else:
            return text, text
    return text, None

r = requests.get(f"{SUPABASE_URL}/rest/v1/paper_questions?limit=5", headers=headers)
for q in r.json():
    en, hi = split_bilingual(q["question_text"])
    optA_en, optA_hi = split_bilingual(q["option_a"])
    print(f"--- Q{q['question_number']} ---")
    print(f"EN: {en[:70]}...")
    print(f"HI: {hi[:70] if hi else 'None'}...")
    print(f"OptA EN: '{optA_en}' | HI: '{optA_hi}'")
