import fitz
import re

doc = fitz.open(r"E:\pyq pdf\SSC CGL, 2025 Official Paper (Held On_ 12 Sept, 2025 Shift 1).pdf")

print("Checking pages 3 to 28:")
for pno in range(2, len(doc)):
    page = doc[pno]
    p_obj = doc.xref_object(page.xref)
    
    # Outer contents xref
    contents_match = re.search(r'/Contents\s*(?:\[\s*(\d+)\s+0\s+R\s*\]|(\d+)\s+0\s+R)', p_obj)
    outer_xref = int(contents_match.group(1) or contents_match.group(2)) if contents_match else None
    
    # Embedded Form XObject xref
    embedded_match = re.search(r'/EmbeddedPdfPage[^\s]+\s+(\d+)\s+0\s+R', p_obj)
    embedded_xref = int(embedded_match.group(1)) if embedded_match else None
    
    print(f"Page {pno+1}: outer_xref={outer_xref}, embedded_xref={embedded_xref}")
