import fitz
import json
import os
import re
import sys

sys.stdout.reconfigure(encoding='utf-8')

backup_dir = r"c:\ssczone\src\data\pyq_backup"
pdf_dir = r"F:\startup  send mail\2026"

with open("scripts/find_placeholders.py") as f:
    pass

# We already found the 18 questions:
from find_placeholders import matches

print(f"Total matching questions: {len(matches)}")

for fname, qn, m, qt in matches:
    # Find the corresponding PDF
    # E.g. ssc-cgl-2026-1-october-2026-shift-3.json -> SSC CGL 2026 (Held On_ 1 Oct 2026 Shift 3).pdf
    date_part = fname.replace("ssc-cgl-2026-", "").replace(".json", "")
    # Search pdf in pdf_dir
    matched_pdf = None
    for pfile in os.listdir(pdf_dir):
        if pfile.endswith(".pdf"):
            # Check date match
            dp_words = date_part.split("-")
            if all(w.lower() in pfile.lower() for w in dp_words if not w.isdigit()):
                matched_pdf = pfile
                break
    
    if not matched_pdf:
        print(f"No PDF found for {fname}")
        continue
        
    doc = fitz.open(os.path.join(pdf_dir, matched_pdf))
    # Find the page for Q.{qn}
    found_page = None
    for pno in range(len(doc)):
        t = doc[pno].get_text()
        if f"{qn}." in t or f"{qn} ." in t:
            found_page = pno
            break
            
    if found_page is not None:
        p = doc[found_page]
        imgs = p.get_images(full=True)
        drawings = p.get_drawings()
        print(f"{fname} | Q.{qn} -> PDF Page {found_page+1} of {len(doc)}")
        print(f"   XObject images on page: {len(imgs)} | Drawings: {len(drawings)}")
        # Check text near qn
        ptxt = p.get_text()
        idx = ptxt.find(f"{qn}.")
        if idx != -1:
            print(f"   Snippet in PDF: {repr(ptxt[idx:idx+120])}")
    else:
        print(f"{fname} | Q.{qn} -> Page not found in {matched_pdf}")
    print("-" * 60)
