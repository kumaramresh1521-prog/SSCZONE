import re

lines = [
    "(I ROST",
    "(2) STOR",
    "(3) QRST",
    "(4) RSTO"
]

def parse_opts(lines):
    opts = {}
    for l in lines:
        # Match pattern: (1) text, (I text, [2) text, 1) text
        matches = re.finditer(r'(?:[\(\[]\s*([1-4Ili])\s*[\)\]\s]|(?:^|\s)([1-4])\s*[\)\]\.\s])\s*([A-Za-z0-9\s\:\;\,\#\%\-\_\?\~]+)', l)
        for m in matches:
            digit = m.group(1) or m.group(2)
            digit = digit.replace('I', '1').replace('l', '1').replace('i', '1')
            text = m.group(3).strip()
            # Clean text of trailing next option marker if any
            text = re.sub(r'[\(\[].*$', '', text).strip()
            if digit.isdigit() and text:
                d_int = int(digit)
                if 1 <= d_int <= 4 and d_int not in opts:
                    opts[d_int] = text
    return opts

print(parse_opts(lines))
