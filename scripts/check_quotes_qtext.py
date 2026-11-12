import json
import re
import sys

sys.stdout.reconfigure(encoding='utf-8')

with open('reasoning_analogy_155_verified.json', 'r', encoding='utf-8') as f:
    questions = json.load(f)

for q in questions:
    num = q['question_number']
    txt = q['question_text']
    if txt.count("'") % 2 != 0:
        print(f"Q{num} unbalanced single quote in text: {txt}")
    if txt.count('"') % 2 != 0:
        print(f"Q{num} unbalanced double quote in text: {txt}")
