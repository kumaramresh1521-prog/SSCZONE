import fitz
import os

pdf_path = r'F:\startup  send mail\pdf\analogy question 2-70.pdf'
print(f"Checking if PDF exists at {pdf_path}: {os.path.exists(pdf_path)}")

if os.path.exists(pdf_path):
    doc = fitz.open(pdf_path)
    print(f"Total pages in PDF: {len(doc)}")
