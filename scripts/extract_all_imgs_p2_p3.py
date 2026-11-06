import fitz
import sys, os
sys.stdout.reconfigure(encoding='utf-8')

pdf_path = r'F:\startup  send mail\2026\SSC CGL 2026 (Held On_ 12 Oct 2026 Shift 3).pdf'
doc = fitz.open(pdf_path)

out_dir = r'c:\ssczone\scripts\scratch_imgs'
os.makedirs(out_dir, exist_ok=True)

# Extract ALL images from pages 2 and 3 to inspect
for page_num in [1, 2]:  # 0-indexed: pages 2 and 3
    page = doc[page_num]
    img_list = page.get_images(full=True)
    print(f"\n=== Page {page_num+1} has {len(img_list)} images ===")
    
    seen_xrefs = set()
    for img in img_list:
        xref = img[0]
        if xref in seen_xrefs:
            continue
        seen_xrefs.add(xref)
        try:
            base_image = doc.extract_image(xref)
            ext = base_image["ext"]
            w = base_image.get("width", "?")
            h = base_image.get("height", "?")
            # Save all non-logo images
            fname = f'page{page_num+1}_xref{xref}_{w}x{h}.{ext}'
            fpath = os.path.join(out_dir, fname)
            with open(fpath, 'wb') as f:
                f.write(base_image['image'])
            print(f"  Saved: {fname}")
        except Exception as e:
            print(f"  xref={xref} ERROR: {e}")

print("\nDone! Check scratch_imgs folder.")
