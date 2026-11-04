import fitz

doc = fitz.open(r"E:\pyq pdf\SSC CGL, 2025 Official Paper (Held On_ 12 Sept, 2025 Shift 1).pdf")
print("Total pages:", len(doc))

# Test on page 3 (index 2)
p = doc[2]
print("Images before:", len(p.get_images()))
for img in p.get_images():
    xref = img[0]
    print("img xref:", xref)

# In PyMuPDF, page.delete_image(xref) or redacting:
# Let's test page.delete_image
try:
    p.delete_image(32)
    p.delete_image(33)
    p.delete_image(146)
    print("delete_image succeeded!")
    print("Images after:", len(p.get_images()))
except Exception as e:
    print("delete_image error:", e)
