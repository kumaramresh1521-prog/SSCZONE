import fitz
from PIL import Image
import sys, os
sys.stdout.reconfigure(encoding='utf-8')

pdf_path = r'F:\startup  send mail\2026\SSC CGL 2026 (Held On_ 12 Oct 2026 Shift 3).pdf'
doc = fitz.open(pdf_path)

out_dir = r'c:\ssczone\scripts\scratch_imgs'
page = doc[2]

# PDF page is 595x842, render at 4x = 2380x3368
mat = fitz.Matrix(4.0, 4.0)
scale = 4.0

# Q.11 diagram area: text ends at y=256, options start at y=260 on LEFT column (x=0 to 297.5)
# But there's barely any gap (256-260 = only 4 PDF units = 16px at 4x)
# Let's crop a bigger area around Q.11: y=218 to y=305, x=0 to 300
# and Q.14 Figure(X): y=557 to y=610, x=0 to 300

def crop_region(page, x1, y1, x2, y2, scale, out_path, label):
    """Render a rectangular clip of the page."""
    clip = fitz.Rect(x1, y1, x2, y2)
    mat = fitz.Matrix(scale, scale)
    pix = page.get_pixmap(matrix=mat, clip=clip)
    pix.save(out_path)
    print(f"Saved {label}: {out_path} ({pix.width}x{pix.height})")

# Q.11 area - left column (x: 60 to 285, y: 220 to 310)
crop_region(page, 60, 220, 285, 310, 4.0,
            os.path.join(out_dir, 'q11_area.png'), 'Q.11 area')

# Q.14 Figure(X) area - left column (x: 60 to 285, y: 555 to 665)
crop_region(page, 60, 555, 285, 665, 4.0,
            os.path.join(out_dir, 'q14_figX_area.png'), 'Q.14 Figure(X) area')

# Also do a wide crop of the full left column to see Q.11 context
crop_region(page, 55, 215, 290, 320, 5.0,
            os.path.join(out_dir, 'q11_wide.png'), 'Q.11 wide')

# Q.14 wide
crop_region(page, 55, 500, 290, 680, 5.0,
            os.path.join(out_dir, 'q14_wide.png'), 'Q.14 wide')
