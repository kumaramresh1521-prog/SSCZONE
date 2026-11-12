from rapidocr_onnxruntime import RapidOCR
import re

engine = RapidOCR()
result, _ = engine(r'c:\ssczone\scripts\pdf_samples\page_39_highres.png')

print(f"Total blocks detected: {len(result) if result else 0}")
type1_boxes = []
for box, text, score in result:
    if 'TYPE-I' in text or 'ANSWERS' in text or re.search(r'^\s*1\.\s*\([1-4]\)', text):
        print(f"Found: {text} at {box[0]} with score {score}")
