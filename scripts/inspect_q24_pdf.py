import fitz
import sys
import os

sys.stdout.reconfigure(encoding='utf-8')

pdf_path = r"F:\startup  send mail\2026\SSC CGL 2026 (Held On_ 1 Oct 2026 Shift 3).pdf"
doc = fitz.open(pdf_path)

for pno in range(len(doc)):
    page = doc[pno]
    text = page.get_text()
    if "24." in text and ("triangle" in text.lower() or "त्रिभुज" in text):
        print(f"--- Found Q.24 on Page {pno+1} ---")
        lines = [l.strip() for l in text.split("\n") if l.strip()]
        for l in lines[:30]:
            print("  ", l)
        
        # Check drawings / vector paths on this page!
        drawings = page.get_drawings()
        print(f"Number of vector drawing paths on page {pno+1}: {len(drawings)}")
        
        # Check image objects
        images = page.get_images()
        print(f"Number of XObject images on page {pno+1}: {len(images)}")
