import requests
import re
from supabase_env import get_supabase_credentials

SUPABASE_URL, SERVICE_KEY = get_supabase_credentials()
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
