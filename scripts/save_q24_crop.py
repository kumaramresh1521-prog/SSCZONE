from PIL import Image

im39 = Image.open('scripts/pdf_samples/spread_39_150.png')
w39, h39 = im39.size

# Crop bottom area of column 2: x from 350 to 660, y from 980 to 1241
crop_q24 = im39.crop((350, 980, 660, 1241))
crop_q24.save('scripts/pdf_samples/q24_crop.png')
print("Saved q24_crop.png, size:", crop_q24.size)
