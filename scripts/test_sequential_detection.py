import json
import re

with open('scripts/pdf_samples/t4_filtered_tokens.json', 'r', encoding='utf-8') as f:
    tokens = json.load(f)

def clean_q_num(raw_str):
    # Remove leading dots/dashes
    s = re.sub(r'^[^\w]+', '', raw_str)
    # Common OCR digit confusions: L/I -> 1, O -> 0
    s = s.replace('L', '1').replace('l', '1').replace('I', '1').replace('i', '1')
    m = re.match(r'^([1-9]\d{0,2})', s)
    if m:
        return int(m.group(1))
    return None

detected_questions = {}
last_q = 0

for idx, (b, text) in enumerate(tokens):
    # Filter out obvious date strings like 17.03.2013 or 24.12.2020
    if re.search(r'\d{2}\.\d{2}\.\d{4}', text):
        continue
    # Filter out standalone option markers like (1), (2), (3), (4)
    if re.match(r'^[\(\[]\s*[1-4]\s*[\)\]]', text):
        continue
        
    # Check if line looks like question start
    # e.g. "1.", ".17.", "2L.", "254."
    m = re.match(r'^[^\w]*([1-9]\d{0,2}|[1-9][LIli]|[1-2]\d[LIli])\s*[\.\,\)\-\:]\s*(.*)', text)
    if m:
        q_candidate = clean_q_num(m.group(1))
        rest = m.group(2).strip()
        if q_candidate and 1 <= q_candidate <= 254:
            # Check if this matches expected sequential question
            if q_candidate == last_q + 1:
                detected_questions[q_candidate] = (idx, rest, text)
                last_q = q_candidate
            elif last_q < q_candidate <= last_q + 3:
                # Slight jump of 1-2 questions, accept it
                detected_questions[q_candidate] = (idx, rest, text)
                last_q = q_candidate

print(f"Sequentially detected {len(detected_questions)} / 254 questions!")
missing = [i for i in range(1, 255) if i not in detected_questions]
print(f"Missing numbers: {len(missing)} -> {missing}")
