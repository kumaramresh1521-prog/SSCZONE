from bs4 import BeautifulSoup
import re

def inspect_all_mcqs():
    with open('f:/startup  send mail/2026/biology-cell-notes-english.html', 'r', encoding='utf-8') as f:
        soup_en = BeautifulSoup(f.read(), 'html.parser')

    with open('f:/startup  send mail/2026/biology-cell-notes-hindi.html', 'r', encoding='utf-8') as f:
        soup_hi = BeautifulSoup(f.read(), 'html.parser')

    mcqs_en = soup_en.find('ol', class_='mcq').find_all('li', recursive=False)
    mcqs_hi = soup_hi.find('ol', class_='mcq').find_all('li', recursive=False)

    for i in range(len(mcqs_en)):
        li_en = mcqs_en[i]
        li_hi = mcqs_hi[i]

        # Extract question text (text before <ol>)
        q_en_ol = li_en.find('ol')
        q_hi_ol = li_hi.find('ol')

        # Get question text
        q_en = ""
        for c in li_en.contents:
            if c == q_en_ol:
                break
            q_en += str(c)
        q_en = q_en.strip()

        q_hi = ""
        for c in li_hi.contents:
            if c == q_hi_ol:
                break
            q_hi += str(c)
        q_hi = q_hi.strip()

        # Options
        opts_en = [opt.decode_contents().strip() for opt in q_en_ol.find_all('li', recursive=False)]
        opts_hi = [opt.decode_contents().strip() for opt in q_hi_ol.find_all('li', recursive=False)]

        # Details
        det_en = li_en.find('details')
        det_hi = li_hi.find('details')

        # Answer text
        # Remove summary
        if det_en.find('summary'):
            det_en.find('summary').extract()
        ans_en = det_en.decode_contents().strip()

        if det_hi.find('summary'):
            det_hi.find('summary').extract()
        ans_hi = det_hi.decode_contents().strip()

        # Extract letter from ans_en
        match = re.search(r'\(([a-d])\)', ans_en, re.IGNORECASE)
        correct_letter = match.group(1).upper() if match else ""

        print(f"[{i+1}] Correct: {correct_letter}")
        print(f"  EN Q: {q_en}")
        print(f"  HI Q: {q_hi}")
        print(f"  Opts EN: {opts_en}")
        print(f"  Opts HI: {opts_hi}")
        print(f"  Ans EN: {ans_en}")
        print(f"  Ans HI: {ans_hi}\n")

if __name__ == '__main__':
    inspect_all_mcqs()
