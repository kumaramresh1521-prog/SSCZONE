import json
import re

with open('scripts/pdf_samples/t4_structured_lines.json', 'r', encoding='utf-8') as f:
    raw_lines = json.load(f)

cols = []
cur_key = None
cur_list = []
for idx, item in enumerate(raw_lines):
    if idx >= 2599: break
    key = (item['file'], item['col'])
    if key != cur_key:
        if cur_list: cols.append((cur_key, cur_list))
        cur_key = key
        cur_list = []
    cur_list.append(item['text'])
if cur_list: cols.append((cur_key, cur_list))

with open('scripts/pdf_samples/t4_col_starts.json', 'r', encoding='utf-8') as f:
    col_starts_meta = json.load(f)

def is_exam_line(text):
    t_up = text.upper()
    return any(k in t_up for k in ['EXAM', 'EXCM', 'EAM', 'EON', 'EXAN', 'SHIFT', 'SHIT', 'SHUT', 'SHAT', 'SHAF', 'SHT', 'SHN', 'TIER', 'TER', 'CBE', 'CDE', 'C&D', 'TF NO', 'ST SURUNE', 'CAPFS', 'CHSL', 'CGL', 'MTS', 'GD)'])

def clean_opt_text(val):
    val = re.sub(r'^[^\w]+', '', val).strip()
    val = re.sub(r'^[1-4IliHhAaBbCcDd]?[\)\]\.\,\s]+', '', val).strip()
    val = re.sub(r'[\(\[].*$', '', val).strip()
    return val

def parse_chunk_smart(chunk):
    # Separate prompt, candidates, and exam
    lines = chunk[:]
    # find where exam begins
    exam_idx = len(lines)
    for i, l in enumerate(lines):
        if is_exam_line(l) or re.search(r'\d{2}\.\d{2}\.\d{4}', l):
            exam_idx = i
            break
            
    content_lines = lines[:exam_idx]
    if len(content_lines) <= 1:
        return ["", "", "", ""]
        
    prompt_line = content_lines[0]
    opt_raw_lines = content_lines[1:]
    
    # Check if lines have multiple options on one line
    expanded = []
    for l in opt_raw_lines:
        # Check for multi-opt
        parts = re.split(r'(?:[\(\[]\s*[1-4Ili]\s*[\)\]\.]|(?:^|\s)[1-4]\s*[\)\.\-])', l)
        clean_parts = [clean_opt_text(p) for p in parts if clean_opt_text(p)]
        if len(clean_parts) > 1:
            expanded.extend(clean_parts)
        else:
            cl = clean_opt_text(l)
            if cl and len(cl) >= 1:
                expanded.append(cl)
                
    if len(expanded) == 4:
        return expanded
        
    # If not 4, try standard digit extraction
    opts = {1: None, 2: None, 3: None, 4: None}
    for l in opt_raw_lines:
        # Normalize
        l_norm = l
        l_norm = re.sub(r'^\)\s*', '(1) ', l_norm)
        l_norm = re.sub(r'^\(\)\s*', '(1) ', l_norm)
        l_norm = re.sub(r'^\(I\s+', '(1) ', l_norm)
        l_norm = re.sub(r'^\(I\]\s+', '(1) ', l_norm)
        l_norm = re.sub(r'^\(1\]\s+', '(1) ', l_norm)
        l_norm = re.sub(r'^\[([1-4])\]\s*', r'(\1) ', l_norm)
        l_norm = re.sub(r'^\(([1-4])\.\s*', r'(\1) ', l_norm)
        l_norm = re.sub(r'^\(1\)\.\s*', '(1) ', l_norm)
        l_norm = re.sub(r'^\(3\s*([A-Za-z])', r'(3) \1', l_norm)
        l_norm = re.sub(r'^14\)\s*', '(4) ', l_norm)
        
        matches = re.finditer(r'(?:[\(\[]\s*([1-4Ili])\s*[\)\]\.]|(?:^|\s)([1-4])\s*[\)\.\-])\s*([^\(\[\)\]]+)', l_norm)
        for m in matches:
            d = (m.group(1) or m.group(2)).replace('I', '1').replace('l', '1').replace('i', '1')
            if d.isdigit():
                d_int = int(d)
                val = clean_opt_text(m.group(3))
                if val and 1 <= d_int <= 4 and opts[d_int] is None:
                    opts[d_int] = val
                    
    # Fill any empty from expanded if possible
    empty_keys = [k for k in [1, 2, 3, 4] if opts[k] is None]
    if len(empty_keys) == 1 and len(expanded) >= 4:
        cur_vals = set(opts.values())
        rem = [x for x in expanded if x not in cur_vals]
        if len(rem) == 1:
            opts[empty_keys[0]] = rem[0]
            
    return [opts[1] or "", opts[2] or "", opts[3] or "", opts[4] or ""]

still_missing = []
for c_meta in col_starts_meta:
    c_idx = c_meta['c_idx']
    lines = cols[c_idx][1]
    starts = {int(k): v for k, v in c_meta['starts'].items()}
    q_start = c_meta['q_start']
    q_end = c_meta['q_end']
    
    for qn in range(q_start, q_end + 1):
        st = starts.get(qn, 0)
        en = starts.get(qn + 1, len(lines))
        chunk = lines[st:en]
        parsed = parse_chunk_smart(chunk)
        if any(not o for o in parsed):
            still_missing.append((qn, parsed, chunk))

print(f"STILL MISSING: {len(still_missing)} / 254")
for qn, parsed, chunk in still_missing[:15]:
    print(f"Q{qn}: {parsed}")
