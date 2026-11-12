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

# In each column, let's list every question boundary:
# A boundary occurs at line 0, and thereafter on the line following an exam line!
for c_meta in col_starts_meta[:8]:
    c_idx = c_meta['c_idx']
    lines = cols[c_idx][1]
    q_start = c_meta['q_start']
    q_end = c_meta['q_end']
    expected_count = q_end - q_start + 1
    
    # Find all exam line indices
    exam_indices = [i for i, l in enumerate(lines) if is_exam_line(l) or re.search(r'\d{2}\.\d{2}\.\d{4}', l)]
    
    # Question starts should be at line 0, and after each group of contiguous exam lines
    blocks = [0]
    in_exam = False
    for i, l in enumerate(lines):
        if is_exam_line(l) or re.search(r'\d{2}\.\d{2}\.\d{4}', l):
            in_exam = True
        else:
            if in_exam:
                blocks.append(i)
                in_exam = False
                
    print(f"Col {c_idx:02d} (Q{q_start}-Q{q_end}): expected {expected_count} questions | detected {len(blocks)} blocks: {blocks}")
