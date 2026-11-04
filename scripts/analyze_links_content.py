import fitz
import sys
from PIL import Image

sys.stdout.reconfigure(encoding='utf-8')

# Check images
for xref in [32, 33, 34, 101, 112, 146]:
    ext = "jpeg" if xref in [101, 112] else "png"
    p = f"tmp/inspect_imgs/img_{xref}.{ext}"
    im = Image.open(p)
    print(f"Image {xref}: mode={im.mode}, size={im.size}")

doc = fitz.open(r"E:\pyq pdf\SSC CGL, 2025 Official Paper (Held On_ 12 Sept, 2025 Shift 1).pdf")
print("Total pages:", len(doc))

# Let's inspect page 1, 2, 3 links and annotations
for pno in range(min(5, len(doc))):
    page = doc[pno]
    links = list(page.get_links())
    print(f"\n--- PAGE {pno+1} ---")
    print("Links:", len(links))
    for l in links:
        print("  Link uri:", l.get("uri"), "rect:", l.get("from"))
    text = page.get_text()
    lines = [line.strip() for line in text.split("\n") if line.strip()]
    print(f"Lines count: {len(lines)}")
    print("First 5 lines:", lines[:5])
