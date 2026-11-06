import fitz
import sys
import os

sys.path.append(os.path.abspath("."))
sys.stdout.reconfigure(encoding='utf-8')

from scripts.test_word_grouping import group_words_to_lines

pdf_path = r"F:\startup  send mail\2026\SSC CGL 2026 (Held On_ 30 Sep 2026 Shift 2).pdf"
doc = fitz.open(pdf_path)
page = doc[7] # Page 8
words = page.get_text("words")

q70_words = [w for w in words if (w[0]+w[2])/2 >= 305 and w[1] > 230 and w[3] < 340]
print("--- Q.70 WITH WORD GROUPING ---")
print(group_words_to_lines(q70_words))
