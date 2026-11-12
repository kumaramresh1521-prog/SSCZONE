import json
import re

with open('scripts/pdf_samples/t4_structured_lines.json', 'r', encoding='utf-8') as f:
    raw_lines = json.load(f)

# Reconstruct cols
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

def parse_options_from_chunk(chunk):
    # Returns a list of 4 options [opt1, opt2, opt3, opt4]
    opts = {1: None, 2: None, 3: None, 4: None}
    
    # 1. Filter out exam lines and prompt line (chunk[0])
    candidate_lines = []
    for l in chunk[1:]:
        if is_exam_line(l) or re.search(r'\d{2}\.\d{2}\.\d{4}', l):
            continue
        candidate_lines.append(l.strip())
        
    full_text = " ".join(candidate_lines)
    
    # Try finding markers: (1), (2), (3), (4), [1], (I), (1., etc.
    # Pattern to find all tokens with explicit digit
    # We can search for delimiters like (1), (2), (3), (4) or [1], [2] or 1), 2)
    # First, let's normalize known OCR quirks in candidate lines:
    norm_lines = []
    for cl in candidate_lines:
        l_norm = cl
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
        l_norm = re.sub(r'([A-Za-z0-9\s\:\-]+)\(([1-4])\)$', r'(\2) \1', l_norm) # e.g. "NON (2)" -> "(2) NON"
        norm_lines.append(l_norm)
        
    # Now scan norm_lines for options
    for nl in norm_lines:
        # Check if line contains one or more options:
        # e.g. "(1) KTU : LUW (2)CLK : DNL"
        # We can split by option markers:
        parts = re.split(r'[\(\[]\s*([1-4Ili])\s*[\)\]\.]', nl)
        if len(parts) > 1:
            # parts will alternate: prefix, digit, text, digit, text...
            for i in range(1, len(parts), 2):
                d_str = parts[i].replace('I', '1').replace('l', '1').replace('i', '1')
                if d_str.isdigit():
                    d = int(d_str)
                    val = parts[i+1].strip()
                    # Strip any trailing exam or bracket
                    val = re.sub(r'[\(\[].*$', '', val).strip()
                    val = re.sub(r'^[^\w]+', '', val).strip()
                    if val and 1 <= d <= 4 and opts[d] is None:
                        opts[d] = val
        else:
            # Check for leading digit like "1) ..." or "2) ..."
            m = re.match(r'^([1-4])\s*[\)\.\-]\s*(.*)', nl)
            if m:
                d = int(m.group(1))
                val = m.group(2).strip()
                val = re.sub(r'[\(\[].*$', '', val).strip()
                val = re.sub(r'^[^\w]+', '', val).strip()
                if val and opts[d] is None:
                    opts[d] = val

    # If any are missing, check if we have lines without markers that can fill empty slots
    missing_slots = [k for k in [1, 2, 3, 4] if opts[k] is None]
    if missing_slots:
        unused_lines = []
        for nl in norm_lines:
            # check if nl was matched
            has_marker = bool(re.search(r'[\(\[]\s*[1-4Ili]\s*[\)\]\.]|^[1-4]\s*[\)\.\-]', nl))
            if not has_marker:
                clean_l = re.sub(r'^[^\w]+', '', nl).strip()
                clean_l = re.sub(r'[\(\[].*$', '', clean_l).strip()
                if len(clean_l) >= 2 and not is_exam_line(clean_l):
                    unused_lines.append(clean_l)
                    
        if len(unused_lines) == len(missing_slots):
            for slot, line in zip(missing_slots, unused_lines):
                opts[slot] = line
                
    return [opts[1] or "", opts[2] or "", opts[3] or "", opts[4] or ""]

# Test on all 254 questions!
results = []
missing_count = 0
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
        parsed = parse_options_from_chunk(chunk)
        if any(not o for o in parsed):
            missing_count += 1
            results.append((qn, parsed, chunk))

print(f"Total questions with missing options: {missing_count} / 254")
for qn, opts, chunk in results[:20]:
    print(f"Q{qn}: {opts}")
