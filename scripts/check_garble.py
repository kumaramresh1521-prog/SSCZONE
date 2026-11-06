import json
import sys

sys.stdout.reconfigure(encoding='utf-8')

with open('tmp_cleaned_database_payload.json', 'r', encoding='utf-8') as f:
    papers = json.load(f)

terms = ['वेंि', 'रोंऔ', 'ेमेंी', 'र्ध्वाेर्तेैे', 'मेंि', 'निर्रुतर', 'पुत्रो', 'क्ति M', '||', 'e×pressions', 'परन्तु असत्य', 'कथनोंं']

for term in terms:
    found = []
    for p in papers:
        pid = p['paper']['id']
        for q in p['questions']:
            all_text = f"{q.get('question_text', '')} {q.get('option_a', '')} {q.get('option_b', '')} {q.get('option_c', '')} {q.get('option_d', '')}"
            if term in all_text:
                found.append(f"P{pid} Q{q['question_number']}")
    print(f"'{term}': {len(found)} occurrences -> {found}")
