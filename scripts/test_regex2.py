import re

test_samples = [
    "(I ROST",
    "(1). PEN : QFO",
    "() PCD",
    "[2] KOC",
    ") PCD",
    "1) APX",
    "(1) KTU : LUW (2) CLK : DNL"
]

def parse_line(l):
    # Find all matches
    # Match: (1) Text, (1). Text, (I) Text, 1) Text, [2] Text
    matches = re.finditer(r'(?:[\(\[]\s*([1-4Ili])\s*[\)\]\.]*|(?:^|\s)([1-4])\s*[\)\]\.\s]+)\s*([A-Za-z0-9\:\;\,\#\%\-\_\?\~]+)', l)
    res = {}
    digit_map = {'1': 1, 'I': 1, 'L': 1, '2': 2, '3': 3, '4': 4}
    for m in matches:
        raw_d = (m.group(1) or m.group(2) or '').upper()
        if raw_d in digit_map:
            d_int = digit_map[raw_d]
            text = m.group(3).strip()
            text = re.sub(r'[\(\[].*$', '', text).strip()
            if text and d_int not in res:
                res[d_int] = text
    return res

for s in test_samples:
    print(f"'{s}' -> {parse_line(s)}")
