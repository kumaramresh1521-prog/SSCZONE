import fitz
import sys
import re

sys.stdout.reconfigure(encoding='utf-8')

pdf_path = r"F:\startup  send mail\2026\SSC CGL 2026 (Held On_ 1 Oct 2026 Shift 1).pdf"
doc = fitz.open(pdf_path)

text = ""
for page in doc:
    text += page.get_text() + "\n"

# Pattern to extract question number, question text, options A, B, C, D, and Ans
pattern = re.compile(
    r'(\d{2})\.\s+(.*?)\n\s*\(A\)\s+(.*?)\n\s*\(B\)\s+(.*?)\n\s*\(C\)\s+(.*?)\n\s*\(D\)\s+(.*?)\n\s*Ans:\s*([A-D])',
    re.DOTALL
)

matches = pattern.findall(text)
print(f"Full question+options matches: {len(matches)} / 100")

for m in matches[:5]:
    num, qtext, a, b, c, d, ans = m
    clean_q = ' '.join(qtext.strip().split())
    print(f"\n--- Q.{int(num)} ---")
    print(f"Q: {clean_q}")
    print(f"A: {a.strip()} | B: {b.strip()} | C: {c.strip()} | D: {d.strip()} | Ans: {ans}")
