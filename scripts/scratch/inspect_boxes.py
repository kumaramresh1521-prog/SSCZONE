from rapidocr_onnxruntime import RapidOCR

ocr = RapidOCR()
img_path = r"c:\ssczone\public\images\pyq\2024\ssc-cgl-2024-11-september-2024-shift-2_p9_img1.png"
result, _ = ocr(img_path)

print("Bounding boxes and text:")
for box, text, score in result:
    # box is [[x1, y1], [x2, y2], [x3, y3], [x4, y4]]
    x_center = (box[0][0] + box[1][0]) / 2
    y_center = (box[0][1] + box[2][1]) / 2
    print(f"X={x_center:5.1f}, Y={y_center:5.1f} | {text}")
