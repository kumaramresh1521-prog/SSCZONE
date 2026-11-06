import fitz
import re
import sys
import os

sys.path.append('.')
sys.stdout.reconfigure(encoding='utf-8')

from scripts.extract_all_2026_papers import extract_ordered_text, parse_questions_from_text

pdf_path = r"F:\startup  send mail\2026\SSC CGL 2026 (Held On_ 30 Sep 2026 Shift 3).pdf"
doc = fitz.open(pdf_path)
text = extract_ordered_text(doc)
qs = parse_questions_from_text(text)

print(f"Total qs: {len(qs)}")
for q in qs:
    if not (q["question_text"] and q["option_a"] and q["option_b"] and q["option_c"] and q["option_d"] and q["correct_answer"]):
        print(f"\n--- Q.{q['question_number']} (Ans: {q['correct_answer']}) ---")
        print(f"Text: {repr(q['question_text'][:120])}")
        print(f"A: {repr(q['option_a'][:50])}")
        print(f"B: {repr(q['option_b'][:50])}")
        print(f"C: {repr(q['option_c'][:50])}")
        print(f"D: {repr(q['option_d'][:50])}")
