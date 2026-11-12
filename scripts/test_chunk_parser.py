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

def parse_options(lines):
    opts = {}
    for l in lines:
        # Match (1) opt1 (2) opt2 etc.
        # Find all occurrences of option markers: (1), (2), (3), (4), 1), 2), [1), etc.
        parts = re.split(r'[\(\[]\s*([1-4Ili])\s*[\)\]]', l)
        if len(parts) > 1:
            # parts will alternate: [pre, marker1, text1, marker2, text2, ...]
            for i in range(1, len(parts), 2):
                m_num = parts[i].replace('I', '1').replace('l', '1').replace('i', '1')
                if m_num.isdigit():
                    m_int = int(m_num)
                    opt_val = parts[i+1].strip()
                    # Clean opt_val of trailing option markers or exam tags
                    opt_val = re.sub(r'[\(\[].*$', '', opt_val).strip()
                    if m_int not in opts and opt_val:
                        opts[m_int] = opt_val
    return opts

# Test on first column (Q1-Q7)
meta0 = col_starts_meta[0]
lines0 = cols[0][1]
starts0 = meta0['starts']
# Convert string keys to int
starts0 = {int(k): v for k, v in starts0.items()}

for qn in range(1, 8):
    st = starts0[qn]
    en = starts0[qn+1] if qn < 7 else len(lines0)
    chunk = lines0[st:en]
    opts = parse_options(chunk)
    print(f"Q{qn}: chunk lines={len(chunk)}, opts={opts}")
    print(f"   Prompt: {chunk[0]}")
