import fitz
import sys, os
sys.stdout.reconfigure(encoding='utf-8')

pdf_path = r'F:\startup  send mail\2026\SSC CGL 2026 (Held On_ 12 Oct 2026 Shift 3).pdf'
doc = fitz.open(pdf_path)

print(f"Total pages: {len(doc)}")

# Search for Q.11 and Q.14 - scan all pages for text
for page_num in range(len(doc)):
    page = doc[page_num]
    text = page.get_text()
    if 'Q.11' in text or 'Q.14' in text or 'squares' in text.lower() or 'pattern in fig' in text.lower():
        print(f"\n=== PAGE {page_num+1} (index {page_num}) ===")
        print(text[:500])
        # List all images on this page
        img_list = page.get_images(full=True)
        print(f"  Images on page: {len(img_list)}")
        for img in img_list:
            xref = img[0]
            print(f"    xref={xref}, name={img[7] if len(img)>7 else 'N/A'}")
