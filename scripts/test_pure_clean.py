import fitz
import re

doc = fitz.open(r"E:\pyq pdf\SSC CGL, 2025 Official Paper (Held On_ 12 Sept, 2025 Shift 1).pdf")

# Page 3:
p = doc[2]

# Clean outer stream (stream 149): keep only the EmbeddedPdfPage part!
outer_stream = doc.xref_stream(149).decode('latin1')
cleaned_outer = re.sub(r'q\s+1 0 0 1 0 792 cm[\s\S]*?/Image-\d+ Do\s*Q\s*', '', outer_stream)
cleaned_outer = re.sub(r'q\s+1 0 0 1 0 0 cm\s+1 0 0 1 0 0 cm[\s\S]*?/Image-\d+ Do\s*Q\s*', '', cleaned_outer)
doc.update_stream(149, cleaned_outer.encode('latin1'))

# Clean inner stream (stream 148): remove /X4 Do blocks!
inner_stream = doc.xref_stream(148).decode('latin1')
cleaned_inner = re.sub(r'q\s*[\d\.\s-]+cm\s*0 0 0 RG 0 0 0 rg\s*/G3 gs\s*/X\d+ Do\s*Q', '', inner_stream)
doc.update_stream(148, cleaned_inner.encode('latin1'))

# Remove Annots
p_obj = doc.xref_object(p.xref)
p_obj_clean = re.sub(r'/Annots\s*\[[\s\S]*?\]', '', p_obj)
doc.update_object(p.xref, p_obj_clean)

# Render to check
pix = p.get_pixmap(dpi=150)
pix.save("tmp/inspect_imgs/p3_pure_clean.png")
print("Saved tmp/inspect_imgs/p3_pure_clean.png successfully!")
