import fitz
import sys
import os

sys.path.append('.')
sys.stdout.reconfigure(encoding='utf-8')

from scripts.test_smart_parse import parse_100_questions

pdf_path = r"F:\startup  send mail\2026\SSC CGL 2026 (Held On_ 1 Oct 2026 Shift 1).pdf"
doc = fitz.open(pdf_path)
qs = parse_100_questions(doc)
valid = sum(1 for q in qs if q["question_text"] and q["option_a"] and q["option_b"] and q["option_c"] and q["option_d"] and q["correct_answer"])
print(f"Shift 1: {valid} / {len(qs)} questions extracted")
print("Q.1 sample:", qs[0])
print("Q.76 (English) sample:", qs[75])
