import sys, os
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

import json
import requests
from supabase_env import get_supabase_credentials

def main():
    with open("scripts/parajumbles_68_prepared.json", "r", encoding="utf-8") as f:
        records = json.load(f)
        
    print(f"Loaded {len(records)} prepared Parajumble questions.")
    
    url, key = get_supabase_credentials()
    headers = {
        "apikey": key,
        "Authorization": f"Bearer {key}",
        "Content-Type": "application/json",
        "Prefer": "return=representation"
    }
    
    # Verify topic 264
    topic_r = requests.get(f"{url}/rest/v1/topics?id=eq.264&select=id,title,slug,subject_id", headers=headers)
    print("Target topic:", topic_r.json())
    
    # Insert in batches of 50
    batch_size = 50
    inserted_total = 0
    for i in range(0, len(records), batch_size):
        batch = records[i:i+batch_size]
        resp = requests.post(f"{url}/rest/v1/questions", headers=headers, json=batch)
        if resp.status_code in [200, 201]:
            count = len(resp.json())
            inserted_total += count
            print(f"Batch {i//batch_size + 1}: Inserted {count} questions. Total: {inserted_total}/{len(records)}")
        else:
            print(f"Error in batch {i//batch_size + 1}: {resp.status_code} {resp.text}")
            return
            
    print(f"\nAll {inserted_total} Parajumble questions successfully inserted into Supabase topic 264!")
    
    # Verify count
    verify_r = requests.get(f"{url}/rest/v1/questions?topic_id=eq.264&select=id", headers={**headers, 'Prefer': 'count=exact'})
    print("Questions in topic 264 now:", verify_r.headers.get("content-range"))

if __name__ == "__main__":
    main()
