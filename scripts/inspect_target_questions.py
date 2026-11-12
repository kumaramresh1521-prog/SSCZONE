import json
import re

# Load all question tokens
with open('scripts/pdf_samples/t4_filtered_tokens.json', 'r', encoding='utf-8') as f:
    tokens = json.load(f)

targets = [69, 101, 108, 150, 171, 176, 195]

for t in targets:
    print(f"=== TARGET QUESTION Q{t} ===")
    found = False
    for idx, (b, text) in enumerate(tokens):
        if re.match(r'^[^\w]*' + str(t) + r'[\.\,\)\-]', text):
            # Print next 10 tokens
            found = True
            for k in range(idx, min(len(tokens), idx + 12)):
                print(f"  {tokens[k][1]}")
            break
    if not found:
        print("  Not directly matched by regex!")
