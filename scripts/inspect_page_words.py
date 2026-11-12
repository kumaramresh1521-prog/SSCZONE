import pdfplumber
import sys

sys.stdout.reconfigure(encoding='utf-8')

with pdfplumber.open('F:/startup  send mail/pdf/analogy question 2-70.pdf') as pdf:
    # Let's inspect page 38, 39, 40 words
    for p_num in [38, 39, 40]:
        page = pdf.pages[p_num - 1]
        words = page.extract_words()
        # Find words containing 'ANSWERS' or 'TYPE-I'
        print(f"--- Page {p_num} has {len(words)} words ---")
        for i, w in enumerate(words):
            if any(term in w['text'].upper() for term in ['ANSWERS', 'TYPE-I', 'EXPLANATION', 'HINTS']):
                snippet = " ".join([x['text'] for x in words[max(0, i-5):min(len(words), i+30)]])
                print(f"Match at word {i}: {snippet}")
