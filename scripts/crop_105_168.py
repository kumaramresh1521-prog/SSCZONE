from PIL import Image

img = Image.open(r'c:\ssczone\scripts\pdf_samples\page_39_highres.png')

# The left page top right area
# Let's crop x: 1100 to 1600, y: 50 to 700 (or on the left side of the spread)
# Wait, spread width is 2339. The left page is x: 0 to 1170.
# So top right of left page is x: 800 to 1170, y: 50 to 700!
crop_box = (1100, 50, 1600, 700)
cropped = img.crop(crop_box)
cropped.save(r'c:\ssczone\scripts\pdf_samples\type1_answers_105_168.png')
print("Cropped 105-168 area saved, size:", cropped.size)
