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

def parse_opts_robust(lines):
    opts = {}
    for l in lines:
        # Match any option marker:
        # (1) Text, (2 Text, 1) Text, 1. Text, (I) Text, ) Text, [3] Text, H) Text (where H=4), AL (T) (where T=1)
        # First find all explicit (1)-(4)
        tokens = re.finditer(r'(?:[\(\[]\s*([1-4IliA-Da-d])\s*[\)\]\.\s]|(?:^|\s)([1-4])\s*[\)\]\.\s])\s*([A-Za-z0-9\:\;\,\#\%\-\_\?\~\s]+)', l)
        for m in tokens:
            raw_digit = m.group(1) or m.group(2)
            d = raw_digit.upper()
            digit_map = {'1': 1, 'I': 1, 'L': 1, 'A': 1,
                         '2': 2, 'B': 2,
                         '3': 3, 'C': 3,
                         '4': 4, 'D': 4}
            if d in digit_map:
                d_int = digit_map[d]
                text = m.group(3).strip()
                # Clean text of trailing markers
                text = re.sub(r'[\(\[].*$', '', text).strip()
                if text and d_int not in opts:
                    opts[d_int] = text
    return opts

# Test on Q1, Q5, Q8, Q12
test_samples = [
    ("(I ROST", "STOR"),
    ("(1). PEN : QFO", "PEN : QFO"),
    ("() PCD", "PCD"),
    ("[2] KOC", "KOC")
]

for s, expected in test_samples:
    res = parse_opts_robust([s])
    print(f"Sample '{s}' -> {res}")
