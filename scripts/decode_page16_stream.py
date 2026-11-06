import fitz
import sys

sys.stdout.reconfigure(encoding='utf-8')

pdf_path = r"C:\Users\Admin\Downloads\SSC CGL, 2025 Official Paper (Held On_ 12 Sept, 2025 Shift 3).pdf"
doc = fitz.open(pdf_path)

page = doc[15] # Page 16
xref = page.xref
stream = doc.xref_stream(xref)
if not stream:
    # check /Contents
    p_obj = doc.xref_object(xref)
    print("Page obj:", p_obj[:500])

# Also check fonts on page 16
fonts = page.get_fonts()
print(f"Fonts on page 16: {len(fonts)}")
for f in fonts:
    print(f)
