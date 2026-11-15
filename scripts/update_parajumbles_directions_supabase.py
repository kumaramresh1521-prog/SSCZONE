import json
import requests
from supabase_env import get_supabase_credentials

def main():
    with open("scripts/parajumbles_68_with_directions.json", "r", encoding="utf-8") as f:
        records = json.load(f)
        
    print(f"Loaded {len(records)} questions with directions.")
    
    url, key = get_supabase_credentials()
    headers = {
        "apikey": key,
        "Authorization": f"Bearer {key}",
        "Content-Type": "application/json"
    }
    
    # Fetch current IDs in topic 264 sorted ascending
    r = requests.get(f"{url}/rest/v1/questions?topic_id=eq.264&select=id&order=id.asc", headers=headers)
    db_items = r.json()
    assert len(db_items) == len(records), f"Count mismatch: DB has {len(db_items)}, json has {len(records)}"
    
    updated_count = 0
    for idx, (db_item, new_item) in enumerate(zip(db_items, records)):
        q_id = db_item["id"]
        patch_payload = {
            "question_text": new_item["question_text"]
        }
        res = requests.patch(f"{url}/rest/v1/questions?id=eq.{q_id}", headers=headers, json=patch_payload)
        if res.status_code in [200, 204]:
            updated_count += 1
        else:
            print(f"Error updating Q ID {q_id}: {res.status_code} {res.text}")
            return
            
        if (idx + 1) % 20 == 0 or (idx + 1) == len(records):
            print(f"Updated {idx + 1}/{len(records)} questions in Supabase...")
            
    print(f"\nSUCCESS: All {updated_count} questions updated in Supabase with official PDF directions!")

if __name__ == "__main__":
    main()
