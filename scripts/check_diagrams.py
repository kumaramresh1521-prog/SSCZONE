import fitz

doc = fitz.open(r"E:\pyq pdf\SSC CGL, 2025 Official Paper (Held On_ 12 Sept, 2025 Shift 1).pdf")
for pno in range(len(doc)):
    page = doc[pno]
    drawings = page.get_drawings()
    # Check if any drawings are complex (more than simple lines)
    complex_drawings = [d for d in drawings if len(d.get("items", [])) > 1 or d["rect"].height > 10]
    if complex_drawings:
        print(f"Page {pno+1}: {len(complex_drawings)} complex drawings")
        for cd in complex_drawings[:3]:
            print("  ", cd["rect"], "items:", len(cd.get("items", [])))
