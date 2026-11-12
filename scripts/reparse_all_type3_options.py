import json
import re

with open('kiran_type3_257_verified.json', 'r', encoding='utf-8') as f:
    qs = json.load(f)

with open('type3_raw_lines_cache.json', 'r', encoding='utf-8') as f:
    raw_q_lines = json.load(f)

q_lines = raw_q_lines[157:4859]

opt_regex = re.compile(r'\([1-4]\)|(?:\([m|n|i|l|\s*]\)|\(\s*\))\s*\(?\d+')
opt_indices = [idx for idx, l in enumerate(q_lines) if opt_regex.search(l)]

opt_groups = []
curr = []
for idx in opt_indices:
    if not curr or (idx <= curr[-1] + 2 and not any('Exam' in q_lines[k] or 'Shift' in q_lines[k] for k in range(curr[-1]+1, idx))):
        curr.append(idx)
    else:
        opt_groups.append(curr)
        curr = [idx]
if curr:
    opt_groups.append(curr)

def clean_noise(text):
    text = re.sub(r'K5279/\d+', '', text)
    text = re.sub(r'Search onTele.*', '', text)
    text = re.sub(r'@apna.*', '', text)
    text = re.sub(r'^\s*TYPE\s*[-–—]?\s*[I|V|X\d]+\s*', '', text, flags=re.I)
    return text.strip()

def clean_triad(t):
    t = t.strip()
    if not t: return t
    nums = re.findall(r'\d+', t)
    if len(nums) == 3:
        return f"({nums[0]}, {nums[1]}, {nums[2]})"
    elif len(nums) == 2:
        return f"{nums[0]} : {nums[1]}"
    if t.startswith('(') and not t.endswith(')'):
        t = t + ')'
    elif not t.startswith('(') and t.endswith(')'):
        t = '(' + t
    return t

def parse_opts(s):
    s = clean_noise(s)
    # Fix common OCR option patterns
    s = re.sub(r'\[1\]|\(I\)', '(1)', s)
    s = re.sub(r'\[2\]', '(2)', s)
    s = re.sub(r'\[3\]', '(3)', s)
    s = re.sub(r'\[4\]', '(4)', s)
    
    # Ensure space before option markers
    s = re.sub(r'(?<=[^\s])\s*\(1\)', ' (1)', s)
    s = re.sub(r'(?<=[^\s])\s*\(2\)', ' (2)', s)
    s = re.sub(r'(?<=[^\s])\s*\(3\)', ' (3)', s)
    s = re.sub(r'(?<=[^\s])\s*\(4\)', ' (4)', s)
    
    p1 = re.search(r'\(1\)\s*(.*?)(?=\s*\(2\)|\s*\(b\)|$)', s)
    p2 = re.search(r'\(2\)\s*(.*?)(?=\s*\(3\)|\s*\(c\)|$)', s)
    p3 = re.search(r'\(3\)\s*(.*?)(?=\s*\(4\)|\s*\(d\)|$)', s)
    p4 = re.search(r'\(4\)\s*(.*)', s)
    
    o1 = clean_triad(p1.group(1).strip() if p1 else '')
    o2 = clean_triad(p2.group(1).strip() if p2 else '')
    o3 = clean_triad(p3.group(1).strip() if p3 else '')
    o4 = clean_triad(p4.group(1).strip() if p4 else '')
    return o1, o2, o3, o4

for i in range(len(opt_groups)):
    raw_opt_text = ' '.join(q_lines[k] for k in opt_groups[i])
    o1, o2, o3, o4 = parse_opts(raw_opt_text)
    qs[i]['option_a'] = o1
    qs[i]['option_b'] = o2
    qs[i]['option_c'] = o3
    qs[i]['option_d'] = o4

# Check anomalies
bad_count = 0
for q in qs:
    opts = [q['option_a'], q['option_b'], q['option_c'], q['option_d']]
    if any(not o for o in opts) or any('(' in o and ')' not in o for o in opts):
        bad_count += 1

print(f"Remaining anomaly count: {bad_count} / 257")

with open('kiran_type3_257_verified.json', 'w', encoding='utf-8') as f:
    json.dump(qs, f, ensure_ascii=False, indent=2)

print("Saved cleanly parsed kiran_type3_257_verified.json!")
