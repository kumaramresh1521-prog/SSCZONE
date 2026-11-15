import json
import re
from bs4 import BeautifulSoup

def main():
    with open('f:/startup  send mail/2026/biology-cell-notes-english.html', 'r', encoding='utf-8') as f:
        soup_en = BeautifulSoup(f.read(), 'html.parser')

    with open('f:/startup  send mail/2026/biology-cell-notes-hindi.html', 'r', encoding='utf-8') as f:
        soup_hi = BeautifulSoup(f.read(), 'html.parser')

    body_en = soup_en.body
    body_hi = soup_hi.body

    tags_en = [t for t in body_en.find_all(recursive=False)]
    tags_hi = [t for t in body_hi.find_all(recursive=False)]

    print(f"Top-level elements count EN: {len(tags_en)}, HI: {len(tags_hi)}")

    for i in range(min(len(tags_en), len(tags_hi))):
        te = tags_en[i]
        th = tags_hi[i]
        ce = te.get('class', [])
        ch = th.get('class', [])
        te_desc = f"{te.name}.{'.'.join(ce) if ce else ''}"
        th_desc = f"{th.name}.{'.'.join(ch) if ch else ''}"
        if te_desc != th_desc:
            print(f"Mismatch at index {i}: EN={te_desc} vs HI={th_desc}")

    print("Comparison complete!")

if __name__ == '__main__':
    main()
