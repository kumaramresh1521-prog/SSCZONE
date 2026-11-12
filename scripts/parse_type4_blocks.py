import json
import re

with open('scripts/pdf_samples/t4_filtered_tokens.json', 'r', encoding='utf-8') as f:
    tokens = json.load(f)

# Combine lines into question chunks
# We detect lines that start with a question number:
# e.g. "1. ", "2. ", "24. ", "138. ", "254. "
# Or with OCR anomalies: ".17.", "2L.", "3L.", "1O5."
def parse_q_marker(text):
    # Skip dates like 17.03.2013 or 24.12.2020
    if re.search(r'\d{2}\.\d{2}\.\d{4}', text):
        return None, text
    # Skip option markers (1), (2), (3), (4)
    if re.match(r'^[\(\[]\s*[1-4]\s*[\)\]]', text):
        return None, text
        
    # Match leading marker
    m = re.match(r'^[^\w]*([1-9]\d{0,2}|[1-9][LIli]|[1-2]\d[LIli])\s*[\.\,\)\-\:]\s*(.*)', text)
    if m:
        num_str = m.group(1).replace('L', '1').replace('l', '1').replace('I', '1').replace('i', '1')
        rest = m.group(2).strip()
        if num_str.isdigit():
            n = int(num_str)
            if 1 <= n <= 254:
                return n, rest
    return None, text

# Collect question blocks
q_blocks = {}
cur_q = None
cur_lines = []

for idx, (b, text) in enumerate(tokens):
    q_num, rest = parse_q_marker(text)
    if q_num is not None:
        # Check if reasonable progression
        if cur_q is None and q_num == 1:
            cur_q = 1
            cur_lines = [rest] if rest else []
            continue
        elif cur_q is not None and (q_num > cur_q or (q_num not in q_blocks and q_num > cur_q - 5)):
            # Save previous question
            if cur_lines:
                q_blocks[cur_q] = cur_lines
            cur_q = q_num
            cur_lines = [rest] if rest else []
            continue
            
    if cur_q is not None:
        cur_lines.append(text)

if cur_q is not None and cur_lines:
    q_blocks[cur_q] = cur_lines

print(f"Directly captured {len(q_blocks)} question blocks!")
print("Captured numbers:", sorted(q_blocks.keys()))
missing = [i for i in range(1, 255) if i not in q_blocks]
print(f"Missing numbers: {len(missing)} -> {missing}")
