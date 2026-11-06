import fitz
import sys

sys.stdout.reconfigure(encoding='utf-8')

pdf_path = r"C:\Users\Admin\Downloads\SSC CGL, 2025 Official Paper (Held On_ 12 Sept, 2025 Shift 3).pdf"
doc = fitz.open(pdf_path)

for pno in range(len(doc)):
    page = doc[pno]
    text = page.get_text()
    lines = [l.strip() for l in text.split('\n') if l.strip()]
    q_lines = [l for l in lines if l.startswith('Q') and any(l.startswith(f"Q{i}.") for i in range(1, 101))]
    ca_lines = [l for l in lines if 'Correct Answer:' in l]
    print(f"Page {pno+1}: {len(q_lines)} Q-headers {q_lines[:3]}... | {len(ca_lines)} Correct Answers")
