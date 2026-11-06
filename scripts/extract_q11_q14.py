import fitz
import sys, os
sys.stdout.reconfigure(encoding='utf-8')

pdf_path = r'F:\startup  send mail\2026\SSC CGL 2026 (Held On_ 12 Oct 2026 Shift 3).pdf'
doc = fitz.open(pdf_path)

out_dir = r'c:\ssczone\public\images\pyq\2026'
base = 'ssc-cgl-2026-12-october-2026-shift-3'

# Extract Q.11 figure: xref=302 (465x137 PNG - likely the squares grid diagram)
img302 = doc.extract_image(302)
q11_path = os.path.join(out_dir, f'{base}_q11_fig.png')
with open(q11_path, 'wb') as f:
    f.write(img302['image'])
print(f"Saved Q.11 figure: {q11_path}")
print(f"  Size: {img302['width']}x{img302['height']}, ext={img302['ext']}")

# Extract Q.14 Figure(X): xref=307 (900x356 JPEG)
img307 = doc.extract_image(307)
q14_path = os.path.join(out_dir, f'{base}_q14_fig.jpeg')
with open(q14_path, 'wb') as f:
    f.write(img307['image'])
print(f"Saved Q.14 figure: {q14_path}")
print(f"  Size: {img307['width']}x{img307['height']}, ext={img307['ext']}")

# Also extract xref=300 (597x129) - might be Q.17 or something else
img300 = doc.extract_image(300)
q_other_path = os.path.join(out_dir, f'{base}_p3_x300.jpeg')
with open(q_other_path, 'wb') as f:
    f.write(img300['image'])
print(f"Saved xref300: {q_other_path}")
print(f"  Size: {img300['width']}x{img300['height']}, ext={img300['ext']}")

print("\nDone!")
