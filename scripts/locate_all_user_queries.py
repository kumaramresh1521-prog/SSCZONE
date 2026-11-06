import json
import re
import sys

sys.stdout.reconfigure(encoding='utf-8')

with open("tmp_cleaned_database_payload.json", "r", encoding="utf-8") as f:
    papers_data = json.load(f)

search_terms = [
    ("वायुमंडलीय", "Atmospheric layers / कथनोंं"),
    ("कथनोंं", "Double nasalization कथनोंं"),
    ("बेलनाकार", "Cylindrical vessel / ऊर्ध्वाधर"),
    ("र्ध्वा", "Font crash र्ध्वा"),
    ("Q10_", "Coding Q10_ : P9@ : O8$"),
    ("P9@", "P9@"),
    ("पुत्रो", "पुत्रो in Paper 6 Q23"),
    ("क्ति M", "क्ति M in Paper 7 Q14"),
    ("||", "|| in Paper 8 Q23"),
    ("मेंि", "मेंि in Paper 9 / 10"),
    ("निर्रुतर", "निर्रुतर in Paper 11 Q14"),
    ("central angle of radians", "central angle of radians in Paper 11 Q69"),
    ("Given, , what is ?", "Given, , what is ? in Paper 11 Q72"),
    ("e×pressions", "e×pressions in Paper 12 Q4"),
    ("परन्तु असत्य", "परन्तु असत्य in Paper 12 Q35")
]

print("Searching across all questions in all papers:")
for p_item in papers_data:
    pid = p_item["paper"]["id"]
    title = p_item["paper"]["title"]
    for q in p_item["questions"]:
        qnum = q["question_number"]
        all_text = f"{q.get('question_text', '')} {q.get('option_a', '')} {q.get('option_b', '')} {q.get('option_c', '')} {q.get('option_d', '')} {q.get('explanation', '')}"
        
        for term, desc in search_terms:
            if term in all_text:
                print(f"✓ Found '{term}' ({desc}) -> Paper {pid} ({title}) Q{qnum}")
                # print snippet
                idx = all_text.find(term)
                print(f"   Snippet: ...{all_text[max(0, idx-30):min(len(all_text), idx+len(term)+40)]}...")
