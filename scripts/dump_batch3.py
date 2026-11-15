# -*- coding: utf-8 -*-
"""
Dump raw text from Batch 3 (Vocabulary) PDFs:
1. phrasal_ssczone.pdf
2. one word subst_ssczone.pdf
3. idioms_phrases_ssczone.pdf
4. syno_and_anto_ssczone.pdf
5. paronyms and homonyms_ssczone.pdf
"""

import os
from pypdf import PdfReader

def dump_pdf(pdf_path, out_txt):
    print(f"Reading {pdf_path}...")
    reader = PdfReader(pdf_path)
    print(f"Total pages: {len(reader.pages)}")
    text_parts = []
    for i, page in enumerate(reader.pages):
        page_text = page.extract_text() or ""
        text_parts.append(f"\n--- Page {i+1} ---\n" + page_text)
    full_text = "\n".join(text_parts)
    with open(out_txt, "w", encoding="utf-8") as f:
        f.write(full_text)
    print(f"Wrote {len(full_text)} chars to {out_txt}")

def main():
    os.makedirs("scripts/scratch", exist_ok=True)
    
    dump_pdf("F:/ssc/eng notes/phrasal_ssczone.pdf", "scripts/scratch/phrasal_raw.txt")
    dump_pdf("F:/ssc/eng notes/one word subst_ssczone.pdf", "scripts/scratch/ows_raw.txt")
    dump_pdf("F:/ssc/eng notes/idioms_phrases_ssczone.pdf", "scripts/scratch/idioms_raw.txt")
    dump_pdf("F:/ssc/eng notes/syno_and_anto_ssczone.pdf", "scripts/scratch/syno_anto_raw.txt")
    dump_pdf("F:/ssc/eng notes/paronyms and homonyms_ssczone.pdf", "scripts/scratch/paronyms_raw.txt")

if __name__ == "__main__":
    main()
