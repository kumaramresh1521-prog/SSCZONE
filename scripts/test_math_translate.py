import requests
import json
import urllib.parse
import sys

sys.stdout.reconfigure(encoding='utf-8')

test_qs = [
    "Solve: (x + 2)² - (x - 2)²",
    "If tanA + cotA = 2 and A is an acute angle, find the value of tan4A + cot4A.",
    "In △ABC , a line DE is drawn parallel to BC, intersecting AB at D and AC at E. If AD=3 cm, DB=2 cm, and DE=4 cm, what is the length of BC?",
    "If x = 1.5 and y = 0.5, find the value of x³−y³ + x³+y³ . x²+xy+y² x²−xy+y²",
    "If sin A+ cos A= 5 , then find the value of tan A+ cot A .",
    "If √2 = 1.414 , then find the value of 4+√2 √2 .",
    "If x + 1/x = 3√2, then find the value of x/(x² - 1)."
]

for t in test_qs:
    url = f"https://translate.googleapis.com/translate_a/single?client=gtx&sl=en&tl=hi&dt=t&q={urllib.parse.quote(t)}"
    r = requests.get(url, headers={'User-Agent': 'Mozilla/5.0'})
    try:
        data = r.json()
        trans = ''.join([item[0] for item in data[0] if item[0]])
        print(f"\nORIGINAL: {t}")
        print(f"TRANSLATED: {trans}")
    except Exception as e:
        print(f"\nERROR for {t}: {e}")
