import json
import re
import sys

sys.stdout.reconfigure(encoding='utf-8')

with open('type1_raw_lines_cache.json', 'r', encoding='utf-8') as f:
    raw_lines = json.load(f)

with open('type1_answers_final.json', 'r', encoding='utf-8') as f:
    answers_map = json.load(f)

with open('type1_explanations.json', 'r', encoding='utf-8') as f:
    explanations_map = json.load(f)

print(f"Loaded {len(raw_lines)} raw lines, {len(answers_map)} answers, {len(explanations_map)} explanations.")

# Filter header & watermark & promo lines
filtered_lines = []
skip_promo = False
for l in raw_lines:
    if 'Directions' in l and 'follow' in l:
        continue
    if 'given alternatives' in l:
        continue
    if '2025 Latest' in l or 'LatestQuestion' in l:
        skip_promo = True
        continue
    if skip_promo:
        if 'See Inside' in l or re.match(r'^\s*11[\.\)]', l):
            skip_promo = False
            if re.match(r'^\s*11[\.\)]', l):
                filtered_lines.append(l)
        continue
    if 'Search onTele' in l or '@apna' in l:
        continue
    filtered_lines.append(l)

# Step 1: Detect all question starting line indices
# A line starts a question if:
# 1. Matches ^\s*\d{1,3}[\.\,]\s*(.*) AND is not a date
# 2. Known unnumbered question starts (like line 378 'Geology is related to'Rocks'', line 1744 'Centre : Central', line 2108 'Arena : Wrestling')

known_special_starts = [
    'Geology is related to',
    'Centre : Central',
    'Arena : Wrestling'
]

q_starts = []
for idx, l in enumerate(filtered_lines):
    # Check special unnumbered
    if any(k in l for k in known_special_starts):
        q_starts.append(idx)
        continue
        
    m = re.match(r'^\s*(\d{1,3})[\.\,]\s*(.*)', l)
    if m:
        num = int(m.group(1))
        rest = m.group(2).strip()
        is_date = bool(re.match(r'^\d{2,4}\b', rest) or re.search(r'\b(?:Shift|Sitting|Exam|CBE)\b', rest, re.I))
        if not is_date and not re.match(r'^\s*\([1-4]\)', l) and num <= 350:
            q_starts.append(idx)

# Deduplicate any duplicate line indices
q_starts = sorted(list(set(q_starts)))
print(f"Detected {len(q_starts)} question start boundaries.")

# Build questions
questions_list = []

for bi in range(len(q_starts)):
    start_idx = q_starts[bi]
    end_idx = q_starts[bi+1] if bi + 1 < len(q_starts) else len(filtered_lines)
    
    block = filtered_lines[start_idx:end_idx]
    if not block:
        continue
        
    first_line = block[0]
    # Remove number prefix if present
    q_first = re.sub(r'^\s*\d{1,3}[\.\,]\s*', '', first_line).strip()
    
    q_lines = [q_first]
    opt_lines = []
    exam_lines = []
    
    in_options = False
    in_exam = False
    
    for l in block[1:]:
        # Option line detection
        if re.search(r'\((?:1|I|i|l|n|2|3|4|S)\)', l) or re.match(r'^\([1-4]\)', l):
            in_options = True
            
        # Exam line detection
        if in_options and (
            re.search(r'\(?(?:SSC|Exam|Shift|CBE|Tier|Sitting|Graduate|CHSL|CGL|MTS|CAPF|Delhi|Stenographer|FCI)', l, re.I) or
            re.search(r'\d{2}\.\d{2}\.\d{4}', l)
        ):
            in_exam = True
            in_options = False
            
        if in_exam:
            exam_lines.append(l)
        elif in_options:
            opt_lines.append(l)
        else:
            q_lines.append(l)
            
    q_text = " ".join(q_lines).strip()
    opt_raw = " ".join(opt_lines).strip()
    exam_raw = " ".join(exam_lines).strip()
    
    # Clean exam tag
    exam_tag = re.sub(r'^[\[\(]\s*|\s*[\]\)]$', '', exam_raw).strip()
    exam_tag = re.sub(r'\s+', ' ', exam_tag)
    
    # Clean question text
    q_text = re.sub(r'\s+', ' ', q_text).strip()
    q_text = re.sub(r'K5279/\d+', '', q_text).strip()
    
    # Normalize options
    norm_opt = re.sub(r'\((?:1|I|i|l|n)\)', '(1)', opt_raw)
    norm_opt = re.sub(r'\((?:3|S)\)', '(3)', norm_opt)
    
    m1 = re.search(r'\(1\)(.*?)(?=\(2\)|\(3\)|\(4\)|\Z)', norm_opt)
    m2 = re.search(r'\(2\)(.*?)(?=\(3\)|\(4\)|\Z)', norm_opt)
    m3 = re.search(r'\(3\)(.*?)(?=\(4\)|\Z)', norm_opt)
    m4 = re.search(r'\(4\)(.*)', norm_opt)
    
    opt_a = m1.group(1).strip() if m1 else ''
    opt_b = m2.group(1).strip() if m2 else ''
    opt_c = m3.group(1).strip() if m3 else ''
    opt_d = m4.group(1).strip() if m4 else ''
    
    # clean options
    opt_a = re.sub(r'\s+', ' ', opt_a).strip()
    opt_b = re.sub(r'\s+', ' ', opt_b).strip()
    opt_c = re.sub(r'\s+', ' ', opt_c).strip()
    opt_d = re.sub(r'\s+', ' ', opt_d).strip()
    
    questions_list.append({
        'raw_idx': bi + 1,
        'q_text': q_text,
        'option_a': opt_a,
        'option_b': opt_b,
        'option_c': opt_c,
        'option_d': opt_d,
        'exam_tag': exam_tag
    })

print(f"Total parsed question items: {len(questions_list)}")

# Save raw parsed list for inspection
with open('type1_assembled_raw.json', 'w', encoding='utf-8') as f:
    json.dump(questions_list, f, ensure_ascii=False, indent=2)
