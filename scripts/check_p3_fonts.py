import fitz

doc = fitz.open(r"E:\pyq pdf\SSC CGL, 2025 Official Paper (Held On_ 12 Sept, 2025 Shift 1).pdf")
p3 = doc[2]
print("Fonts on page 3:")
for font in p3.get_fonts():
    print(font)

print("\nDrawings on page 3:")
for d in p3.get_drawings():
    print("rect:", d.get("rect"), "items:", len(d.get("items", [])))
