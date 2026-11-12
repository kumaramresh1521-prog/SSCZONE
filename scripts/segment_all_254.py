import json
import re

with open('scripts/pdf_samples/t4_structured_lines.json', 'r', encoding='utf-8') as f:
    raw_lines = json.load(f)

# Keep only Type-IV lines (0 to 2598)
lines = [item['text'] for item in raw_lines[:2599]]

# Map of manual / OCR-anomaly overrides where OCR misread question number:
# e.g., 48 was read as '68,COHL', 51 was 'SL KSDO', 53 was '88. KSOE', 69 was '68.AOE', 70 was '7O, NRGLED'
manual_starts = {
    # If a question number is missed or misread by OCR, we can anchor it by text substring or known line
}

q_starts = {}
# Let's inspect line by line
cur_q = 0

for idx, text in enumerate(lines):
    # Exclude option lines like "(1) ...", "(2) ...", "(I) ..."
    if re.match(r'^[\(\[]\s*[1-4Ili]\s*[\)\]]', text):
        continue
    # Exclude exam dates like 17.03.2013 or 02.07.2019
    if re.search(r'\d{2}\.\d{2}\.\d{4}', text):
        continue
    # Exclude footer lines
    if any(k in text.upper() for k in ['TELEGRAM', '@APNA', 'K5279']):
        continue
        
    # Check for question number marker
    # Patterns: "1. ", "2.", "254.", "SL ", "68,COHL", "7O, "
    m = re.match(r'^[^\w]*([1-9]\d{0,2}|[1-9][LIli]|[1-2]\d[LIli]|SL)\s*[\.\,\)\-\:]\s*(.*)', text)
    detected_num = None
    if m:
        s = m.group(1).replace('L', '1').replace('l', '1').replace('I', '1').replace('i', '1')
        if s == 'SL': s = '51'
        if s.isdigit():
            detected_num = int(s)
            
    # Also check OCR anomalies for specific known questions:
    if '68,COHL' in text: detected_num = 48
    elif '88. KSOE' in text: detected_num = 53
    elif '68.AOE' in text: detected_num = 69
    elif '7O, NRGLED' in text or '70, NRGLED' in text: detected_num = 70
    elif '12, Seect theopon' in text: detected_num = 121
    elif '140. Seleet the opuion that ts' in text and cur_q >= 148: detected_num = 149
    elif '187, Select the optilon that i' in text and cur_q < 160: detected_num = 157
    elif '182. Select the option that is' in text and cur_q < 165: detected_num = 162
    elif '19. Select the option that ts' in text and cur_q >= 195: detected_num = 199
    elif '218.nfoloutnquonse' in text and cur_q < 218: detected_num = 217
    elif 'FLLC is related to HNNE' in text: detected_num = 251
    
    if detected_num is not None and 1 <= detected_num <= 254:
        # Verify it makes sense sequentially: detected_num should be > cur_q (or if duplicate, skip)
        if detected_num > cur_q and detected_num <= cur_q + 5:
            q_starts[detected_num] = idx
            cur_q = detected_num

print(f"Captured {len(q_starts)} / 254 question starts.")
missing = [i for i in range(1, 255) if i not in q_starts]
print(f"Missing ({len(missing)}): {missing}")
