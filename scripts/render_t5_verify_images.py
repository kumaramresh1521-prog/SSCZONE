import fitz

doc = fitz.open('analogy_chapter2.pdf')
# Check page 38 right (idx 37), page 39 left (idx 38) -> Q13..25 of Type-V!
# Wait: earlier t5_q1_12.png was page 38 right (idx 37), t5_q13_25.png was page 39 left (idx 38)!
# Let's render full left half of page 39 (idx 38) at 200dpi, and full page 69 (idx 68) at 150dpi to see Type-V explanations 15..25!

page39 = doc[38]
pix39l = page39.get_pixmap(dpi=200, clip=fitz.Rect(15, 25, 425, 585))
pix39l.save('scripts/pdf_samples/t5_p39_left_full.png')

# Also check last page (idx 68 = Page 69)
page69 = doc[68]
pix69r = page69.get_pixmap(dpi=200, clip=fitz.Rect(418, 25, 835, 585))
pix69r.save('scripts/pdf_samples/t5_p69_right_expl.png')
pix69l = page69.get_pixmap(dpi=200, clip=fitz.Rect(15, 25, 425, 585))
pix69l.save('scripts/pdf_samples/t5_p69_left_expl.png')

print("Saved Type-V question and explanation verification images!")
