import json
import re

with open('kiran_type3_257_verified.json', 'r', encoding='utf-8') as f:
    qs = json.load(f)

anomalies = []
for q in qs:
    num = q['question_number']
    opts = [q['option_a'], q['option_b'], q['option_c'], q['option_d']]
    
    # Check if any option is empty or contains '(1)', '(2)', '(3)', '(4)' inside
    bad = False
    for idx, o in enumerate(opts):
        if not o or len(o) < 3:
            bad = True
        if re.search(r'\([1-4]\)', o) or re.search(r'\([a-d]\)', o):
            bad = True
    if bad:
        anomalies.append(num)

print(f"Total questions with option anomalies: {len(anomalies)} / 257")
print(f"Anomaly question numbers: {anomalies}")
