import json
from test_directions_map import get_direction_for_q

with open("scripts/parajumbles_68_prepared.json", "r", encoding="utf-8") as f:
    records = json.load(f)

updated_records = []
for i, r in enumerate(records):
    q_num = i + 1
    direction = get_direction_for_q(q_num)
    body = r["question_text"].strip()
    
    # Strip any existing leading direction in body if it matches
    for prefix in [
        "Rearrange the parts of the sentence in correct order.\n",
        "Fill in the blank with the most appropriate word.\n",
        "Select the most appropriate ANTONYM of the given word.\n"
    ]:
        if body.startswith(prefix):
            body = body[len(prefix):].strip()
            
    full_text = f"DIRECTIONS: {direction}\n\n{body}"
    new_r = dict(r)
    new_r["question_text"] = full_text
    updated_records.append(new_r)

print(f"Prepared {len(updated_records)} questions with full DIRECTIONS.")
print("\n--- SAMPLE Q1 ---")
print(updated_records[0]["question_text"])
print("\n--- SAMPLE Q30 ---")
print(updated_records[29]["question_text"])
print("\n--- SAMPLE Q38 ---")
print(updated_records[37]["question_text"])
print("\n--- SAMPLE Q45 ---")
print(updated_records[44]["question_text"])
print("\n--- SAMPLE Q55 ---")
print(updated_records[54]["question_text"])
print("\n--- SAMPLE Q63 ---")
print(updated_records[62]["question_text"])

with open("scripts/parajumbles_68_with_directions.json", "w", encoding="utf-8") as f:
    json.dump(updated_records, f, ensure_ascii=False, indent=2)
