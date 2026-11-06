import fitz
import sys

sys.stdout.reconfigure(encoding='utf-8')

pdf_path = r"C:\Users\Admin\Downloads\SSC CGL, 2025 Official Paper (Held On_ 14 Sept, 2025 Shift 3).pdf"
doc = fitz.open(pdf_path)

print("--- P19 SPANS ---")
p19 = doc[18]
for b in p19.get_text("words"):
    if 540 <= b[1] <= 600:
        print(f"Word: {repr(b[4])} at bbox ({b[0]:.1f}, {b[1]:.1f}, {b[2]:.1f}, {b[3]:.1f})")

print("\n--- P20 SPANS ---")
p20 = doc[19]
for b in p20.get_text("words"):
    if 230 <= b[1] <= 280:
        print(f"Word: {repr(b[4])} at bbox ({b[0]:.1f}, {b[1]:.1f}, {b[2]:.1f}, {b[3]:.1f})")
