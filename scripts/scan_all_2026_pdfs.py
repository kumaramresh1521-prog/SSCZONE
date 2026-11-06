import os
import glob
import sys
import pdfplumber

sys.stdout.reconfigure(encoding='utf-8')

pdf_dir = r"F:\startup  send mail\2026"
pdf_files = sorted(glob.glob(os.path.join(pdf_dir, "*.pdf")))

print(f"Total PDF files found: {len(pdf_files)}")

results = []

for pdf_path in pdf_files:
    fname = os.path.basename(pdf_path)
    try:
        with pdfplumber.open(pdf_path) as pdf:
            total_pages = len(pdf.pages)
            # Sample text from page 2
            text_p2 = pdf.pages[1].extract_text() if total_pages > 1 else ""
            
            # Check Hindi character presence
            has_hindi = any('\u0900' <= char <= '\u097F' for char in text_p2)
            # Count Devanagari chars
            hindi_chars = sum(1 for char in text_p2 if '\u0900' <= char <= '\u097F')
            
            # Check for standard question numbers
            q_found = sum(1 for i in range(1, 101) if f"{i:02d}." in text_p2 or f"{i}." in text_p2)
            
            results.append({
                "file": fname,
                "pages": total_pages,
                "has_hindi": has_hindi,
                "hindi_char_count": hindi_chars,
                "sample": text_p2[:120].replace('\n', ' ') if text_p2 else "EMPTY"
            })
    except Exception as e:
        results.append({
            "file": fname,
            "error": str(e)
        })

for r in results:
    if "error" in r:
        print(f"ERROR: {r['file']} => {r['error']}")
    else:
        lang = "HINDI" if r["hindi_char_count"] > 50 else "ENGLISH"
        print(f"[{lang}] {r['file']} (Pages: {r['pages']}, Hindi chars: {r['hindi_char_count']})")
        print(f"    Sample: {r['sample']}")
