import fitz
from test_superscript_extraction import extract_page_with_superscripts

pdf_path = r'C:/Users/Admin/.gemini/antigravity/brain/a4f88990-1ffd-4462-a906-52e3447e1c0c/.user_uploaded/media_1795011857816_63e5913b.pdf'
doc = fitz.open(pdf_path)

# Solutions are from page 20 to 38 (0-indexed: 19 to 37)
# Let's inspect page 20 (Q13 to Q45)
txt = extract_page_with_superscripts(doc[19])
lines = [l for l in txt.split('\n') if any(f"{qn}." in l for qn in [13, 14, 15, 19, 40])]
print("=== SOLUTIONS PAGE 20 SAMPLES ===")
print('\n'.join(lines))
