from PIL import Image
im = Image.open('c:/ssczone/public/images/pyq/2026/ssc-cgl-2026-5-october-2026-shift-3_p4_x567.jpeg')
w, h = im.size
print('size:', w, h)
# Save high-res crops of each of the 4 frames and options
im.save('c:/ssczone/scripts/q18_full.png')
