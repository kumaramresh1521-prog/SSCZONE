import json
import fitz
import re
import sys

sys.stdout.reconfigure(encoding='utf-8')

paper_data = json.load(open('scripts/paper_inputs/paper_43.json', encoding='utf-8'))
doc = fitz.open(r'C:\Users\Admin\.gemini\antigravity\brain\30ba99f1-f180-4ad0-b345-cdf1e087e683\.tempmediaStorage\0ae369acf1d48f64.pdf')
full_text = ''
for page in doc:
    full_text += page.get_text() + '\n'

items = re.findall(r'(\d{4})\.\s+(.*?)(?=Correct Ans:\s*([A-D]))Correct Ans:\s*([A-D])', full_text, re.DOTALL)
pdf_dict = {int(num) - 1800: (ans, q_body.strip()) for num, q_body, _, ans in items}

check_list = [10, 26, 27, 28, 29, 33, 34, 35, 40, 41, 44, 45, 49, 50, 53, 66, 67, 68, 69, 70, 72, 73, 74, 75, 84, 85, 89, 90, 100]

for qnum in check_list:
    q = paper_data[qnum - 1]
    off_ans, off_body = pdf_dict[qnum]
    opts_off = re.findall(r'\(([A-D])\)\s*(.*?)(?=(?:\([A-D]\)|$))', off_body, re.DOTALL)
    opts_off_dict = {k: v.strip().replace('\n', ' ') for k, v in opts_off}
    correct_text_off = opts_off_dict.get(off_ans, '')
    print(f"=== Q{qnum} (ID: {q['id']}) ===")
    print(f"Current stored: {q['correct_answer']}")
    print(f"Options in paper_43:")
    print(f"  (A) {q['option_a']}")
    print(f"  (B) {q['option_b']}")
    print(f"  (C) {q['option_c']}")
    print(f"  (D) {q['option_d']}")
    print(f"Official in PDF: {off_ans} -> {correct_text_off}")
    print()
