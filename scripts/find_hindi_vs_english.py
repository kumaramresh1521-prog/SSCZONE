import os
import glob
import sys
import pdfplumber

sys.stdout.reconfigure(encoding='utf-8')

pdf_dir = r"F:\startup  send mail\2026"
pdf_files = sorted(glob.glob(os.path.join(pdf_dir, "*.pdf")))

hindi_files = []
english_files = []

for pdf_path in pdf_files:
    fname = os.path.basename(pdf_path)
    with pdfplumber.open(pdf_path) as pdf:
        text = ""
        for p in pdf.pages[1:3]:
            text += (p.extract_text() or "")
        hindi_count = sum(1 for c in text if '\u0900' <= c <= '\u097F')
        if hindi_count > 20:
            hindi_files.append((fname, hindi_count))
        else:
            english_files.append(fname)

print(f"TOTAL FILES: {len(pdf_files)}")
print(f"PURE ENGLISH FILES ({len(english_files)}):")
for f in english_files:
    print(f"  - {f}")

print(f"\nHINDI FILES ({len(hindi_files)}):")
for f, c in hindi_files:
    print(f"  - {f} (Hindi chars: {c})")
