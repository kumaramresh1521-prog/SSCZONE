import fitz

doc = fitz.open(r"E:\pyq pdf\SSC CGL, 2025 Official Paper (Held On_ 12 Sept, 2025 Shift 1).pdf")
print("Total pages:", len(doc))

all_images = {}
for pno in range(len(doc)):
    page = doc[pno]
    img_list = page.get_images()
    for img in img_list:
        xref = img[0]
        if xref not in all_images:
            base_img = doc.extract_image(xref)
            all_images[xref] = {
                "width": base_img["width"],
                "height": base_img["height"],
                "ext": base_img["ext"],
                "pages": [pno + 1],
                "rects": page.get_image_rects(xref)
            }
        else:
            all_images[xref]["pages"].append(pno + 1)

print(f"Total unique images: {len(all_images)}")
for xref, data in all_images.items():
    print(f"Xref: {xref} | size: {data['width']}x{data['height']} | ext: {data['ext']} | pages count: {len(data['pages'])} | pages: {data['pages'][:5]}... | sample rect: {data['rects']}")
