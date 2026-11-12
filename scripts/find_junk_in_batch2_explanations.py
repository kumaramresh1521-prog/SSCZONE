import json
import re

with open('kiran_type2_307_verified.json', 'r', encoding='utf-8') as f:
    data = json.load(f)

junk_flagged = []

gk_keywords = ['trophy', 'cup', 'deficiency', 'cricket', 'hockey', 'football', 'disease', 'anaemia', 'calcium', 'synonym', 'antonym', 'state', 'capital', 'currency']
bad_patterns = [r'search on tele', r'k\d+/', r'\[\s*\]', r'\(note\b.*?\)', r'similarly.*similarly']

for q in data:
    qn = q['question_number']
    exp = q.get('explanation', '').lower()
    
    reasons = []
    for kw in gk_keywords:
        if kw in exp:
            reasons.append(f"GK keyword '{kw}'")
    for bp in bad_patterns:
        if re.search(bp, exp, re.IGNORECASE):
            reasons.append(f"Bad pattern '{bp}'")
    
    # Check if explanation contains other question numbers like "87." or "Q."
    if re.search(r'\b(?:8[0-9]|9[0-9]|1[0-9]{2})\.\s*[\(\[]', exp):
        reasons.append("Other Q number tag in exp")
        
    if reasons:
        junk_flagged.append((qn, reasons, q.get('explanation', '')[:180]))

print(f"Total questions with suspected junk in explanation: {len(junk_flagged)}")
for qn, r, snippet in junk_flagged:
    print(f"Q{qn:03d}: {', '.join(r)}")
    print(f"  Snippet: {snippet.replace(chr(10), ' ')}")
    print()
