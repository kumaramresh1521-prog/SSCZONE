import fitz
import sys
import os
import re

sys.stdout.reconfigure(encoding='utf-8')

devanagari_pattern = re.compile(r'[\u0900-\u097F]')

search_dirs = [
    r"F:\startup  send mail\2026",
    r"F:\startup  send mail",
    r"c:\ssczone\src\data\pyq_backup"
]

for sdir in search_dirs:
    if not os.path.exists(sdir):
        continue
    print(f"\nChecking directory: {sdir}")
    for fname in os.listdir(sdir):
        if fname.endswith(".pdf"):
            full_path = os.path.join(sdir, fname)
            try:
                doc = fitz.open(full_path)
                has_hi = False
                hi_count = 0
                total_chars = 0
                for p in doc:
                    txt = p.get_text()
                    total_chars += len(txt)
                    matches = devanagari_pattern.findall(txt)
                    hi_count += len(matches)
                print(f"  {fname}: Total Chars: {total_chars}, Hindi Chars: {hi_count}")
            except Exception as e:
                print(f"  {fname}: Error {e}")
