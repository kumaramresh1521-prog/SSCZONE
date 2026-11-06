import fitz
import sys

sys.stdout.reconfigure(encoding='utf-8')

pdf_path = r"C:\Users\Admin\Downloads\SSC CGL, 2025 Official Paper (Held On_ 14 Sept, 2025 Shift 3).pdf"
doc = fitz.open(pdf_path)

# Page 19 drawings
p19 = doc[18]
d19 = [d for d in p19.get_drawings() if 500 <= d['rect'].y0 <= 650]
print(f"P19 drawings in Q69 rect: {len(d19)}")
for d in d19:
    print(d['rect'], d['type'], d.get('items'))

# Page 20 drawings
p20 = doc[19]
d20 = [d for d in p20.get_drawings() if 200 <= d['rect'].y0 <= 350]
print(f"P20 drawings in Q72 rect: {len(d20)}")
for d in d20:
    print(d['rect'], d['type'], d.get('items'))
