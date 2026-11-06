import fitz
import re
import sys

sys.stdout.reconfigure(encoding='utf-8')

pdf_path = r"C:\Users\Admin\Downloads\SSC CGL, 2025 Official Paper (Held On_ 12 Sept, 2025 Shift 3).pdf"
doc = fitz.open(pdf_path)

stream = doc.xref_stream(504).decode('latin1', errors='ignore')
print(f"Stream 504 length: {len(stream)}")

# Find where 'Simplify' occurs
idx = stream.find('Simplify')
if idx != -1:
    print("Stream around 'Simplify':")
    print(stream[max(0, idx - 200):idx + 1200])
else:
    print("'Simplify' not found directly in raw text. Searching Tj/TJ blocks...")
