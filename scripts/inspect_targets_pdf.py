import fitz
import re
import sys

sys.stdout.reconfigure(encoding='utf-8')

doc = fitz.open(r'F:\startup  send mail\pdf\A New Approach to REASONING Verbal & Non-Verbal.pdf')

target_qs = [13, 23, 26, 30, 38, 40, 41, 42, 44, 45, 54, 58, 62, 63, 64, 69, 71, 75, 76, 77, 79, 82, 83, 85, 86, 104, 109, 111, 112, 113, 114, 115, 119, 120, 122, 127, 130, 131, 132, 141, 147]

all_page_words = []
for pno in range(8):
    words = doc[pno].get_text('words')
    all_page_words.append((pno, words))

for tq in target_qs:
    found = False
    for pno, words in all_page_words:
        for idx, w in enumerate(words):
            if w[4] == f"{tq}." or w[4] == f"{tq}":
                snippet = " ".join([words[k][4] for k in range(max(0, idx-1), min(len(words), idx+45))])
                print(f"Q{tq} (P.{pno+1}): {snippet}")
                found = True
                break
        if found:
            break
