import json

with open('scripts/pdf_samples/t4_incomplete_options.json', 'r', encoding='utf-8') as f:
    items = json.load(f)

with open('scripts/pdf_samples/t4_58_to_review.txt', 'w', encoding='utf-8') as f:
    for it in items:
        f.write(f"=== QUESTION {it['q_num']} ===\n")
        f.write(f"Chunk lines ({len(it['chunk'])}):\n")
        for l in it['chunk']:
            f.write(f"  {l}\n")
        f.write(f"Parsed opts: {it['opts']}\n\n")

print(f"Dumped all {len(items)} questions to t4_58_to_review.txt")
