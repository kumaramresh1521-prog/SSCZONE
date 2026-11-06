import fitz
import os

doc = fitz.open(r"F:\startup  send mail\2026\SSC CGL 2026 (Held On_ 10 Oct 2026 Shift 3).pdf")
slug = "ssc-cgl-2026-10-october-2026-shift-3"
img_dir = r"c:\ssczone\public\images\pyq\2026"

p3 = doc[2] # Page 3
p4 = doc[3] # Page 4

# Question figure
fig = p3.get_pixmap(clip=fitz.Rect(304, 660, 535, 724), dpi=150)
fig.save(os.path.join(img_dir, f"{slug}_q13_fig.png"))

# Option A & B
opt_a = p3.get_pixmap(clip=fitz.Rect(340, 720, 430, 765), dpi=150)
opt_a.save(os.path.join(img_dir, f"{slug}_q13_opt_A.png"))

opt_b = p3.get_pixmap(clip=fitz.Rect(440, 720, 535, 765), dpi=150)
opt_b.save(os.path.join(img_dir, f"{slug}_q13_opt_B.png"))

# Option C & D
opt_c = p4.get_pixmap(clip=fitz.Rect(102, 100, 190, 137), dpi=150)
opt_c.save(os.path.join(img_dir, f"{slug}_q13_opt_C.png"))

opt_d = p4.get_pixmap(clip=fitz.Rect(206, 100, 295, 137), dpi=150)
opt_d.save(os.path.join(img_dir, f"{slug}_q13_opt_D.png"))

print("Cropped Q.13 fig, A, B, C, D successfully!")
