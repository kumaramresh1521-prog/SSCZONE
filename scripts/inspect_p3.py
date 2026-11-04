import fitz

doc = fitz.open(r"E:\pyq pdf\SSC CGL, 2025 Official Paper (Held On_ 12 Sept, 2025 Shift 1).pdf")
p3 = doc[2]
print("Page 3 rect:", p3.rect)
# Render page 3 without image 32 and 33
# Let's see all images on page 3 and where they are placed
for img in p3.get_images():
    xref = img[0]
    rects = p3.get_image_rects(xref)
    print("img xref:", xref, "rects:", rects)
