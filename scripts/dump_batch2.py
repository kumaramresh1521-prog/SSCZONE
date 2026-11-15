# -*- coding: utf-8 -*-
"""
Dump raw text from Batch 2 PDFs:
1. modals_notes_ssczone_clean.pdf
2. question_tags_ssczone.pdf
3. preposition_ssczone.pdf
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
    
    dump_pdf("F:/ssc/eng notes/modals_notes_ssczone_clean.pdf", "scripts/scratch/modals_raw.txt")
    dump_pdf("F:/ssc/eng notes/question_tags_ssczone.pdf", "scripts/scratch/question_tags_raw.txt")
    dump_pdf("F:/ssc/eng notes/preposition_ssczone.pdf", "scripts/scratch/preposition_raw.txt")

if __name__ == "__main__":
    main()
