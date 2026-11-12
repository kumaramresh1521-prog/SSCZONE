import json, re

with open('scripts/pdf_samples/t4_parsed_254.json', 'r', encoding='utf-8') as f:
    raw = json.load(f)

# Exact visually verified overrides for every Shift/Date/Name that was damaged,
# ambiguous in OCR, or clipped in spine shadow.
# None as shift means physically clipped in gutter scan (omit Shift rather than guess).
VISUAL_SHIFT = {
    4: 'III', 5: 'III', 6: 'I', 7: 'I', 8: 'I', 9: 'I', 10: 'III',
    11: 'I', 12: 'I', 13: 'I', 14: 'III', 15: 'I', 16: 'III', 17: 'I',
    18: 'III', 19: 'III', 20: 'I', 21: 'III', 22: 'III', 23: 'III',
    24: 'III', 25: 'III', 26: 'II', 27: 'I', 28: 'I', 29: 'I', 30: 'I',
    31: 'I', 32: 'I', 33: 'III', 34: 'II', 35: 'III', 36: 'III', 37: 'I',
    38: 'II', 39: 'I', 40: 'III', 41: 'II', 42: 'III', 43: 'III',
    44: 'I', 45: 'II', 46: 'III', 47: 'II', 48: 'III', 49: 'I', 50: 'I',
    51: 'II', 52: 'III', 53: 'I', 54: 'II', 55: 'III', 56: 'II', 57: 'II',
    58: 'III', 59: 'II', 60: 'II', 61: 'III', 62: 'III', 63: 'I', 64: 'I',
    65: 'I', 66: 'II', 67: 'I', 68: 'I', 69: 'I', 70: 'I', 71: 'I', 72: 'I',
    73: 'I', 74: 'I', 75: 'III', 76: 'I', 77: 'II', 78: 'II', 79: 'I',
    80: 'I', 81: 'I', 82: 'I', 83: 'I', 84: 'I', 85: 'I', 86: 'I', 87: 'I',
    88: 'I', 89: 'I', 90: 'I', 91: 'I', 92: 'I', 93: 'II', 94: 'II', 95: 'II',
    96: 'I', 97: 'II', 98: 'II', 99: 'II', 100: 'III', 101: 'II', 102: 'III',
    103: 'II', 104: 'III', 105: 'III', 106: 'II', 107: 'III', 108: 'I',
    109: 'I', 110: 'III', 111: 'III', 112: 'I', 113: 'I', 114: 'II',
    115: 'II', 116: 'II', 117: 'II', 118: 'I', 119: 'III', 120: 'I',
    121: 'I', 122: 'III', 123: 'II', 124: 'II', 125: 'I', 126: 'I',
    127: 'II', 128: 'I', 129: 'I', 130: 'I', 131: 'II', 132: 'II',
    133: 'II', 134: 'II', 135: 'II', 136: 'II', 137: 'I', 138: 'I',
    139: 'I', 140: 'II', 141: 'II', 142: 'III', 143: 'II', 144: 'II',
    145: 'II', 146: 'II', 147: 'I', 148: 'I', 149: 'II', 150: 'II',
    151: 'I', 152: 'II', 153: 'I', 154: 'II', 155: 'II', 156: 'III',
    157: 'II', 158: 'III', 159: 'I', 160: 'II', 161: 'III', 162: 'I',
    163: 'II', 164: 'II', 165: 'II', 166: 'III', 167: 'II', 168: 'III',
    169: 'II', 170: 'III', 171: 'II', 172: 'I', 173: 'I', 174: 'I',
    175: 'II', 176: 'II', 177: 'III', 178: 'I', 179: 'II', 180: 'III',
    181: 'I',
    182: None, 183: None, 184: None,
    185: 'II', 186: 'III',
    187: None,
    188: 'II', 189: 'III', 190: 'I', 191: 'II',
    192: 'I', 193: 'I', 194: 'II', 195: 'III', 196: 'III', 197: 'I',
    198: 'I', 199: 'I', 200: 'I', 201: 'I', 202: 'I', 203: 'I', 204: 'I',
    205: 'I', 206: 'III', 207: 'III', 208: 'I', 209: 'I', 210: 'I',
    211: 'I', 212: 'II',
    213: None, 214: None, 215: None, 216: None,
    217: 'I', 218: 'IV', 219: 'IV', 220: 'IV', 221: 'IV', 222: 'IV',
    223: 'IV', 224: 'IV', 225: 'IV', 226: 'IV', 227: 'IV', 228: 'I',
    229: 'I', 230: 'II', 231: 'II', 232: 'III', 233: 'I', 234: 'I',
    235: 'II', 236: 'II', 237: 'II', 238: 'I', 239: 'I', 240: 'II',
    241: 'II', 242: 'II', 243: 'III', 244: 'I',
    245: None, 246: None, 247: None, 248: None, 249: None,
    250: 'II', 251: 'I', 252: 'I', 253: 'I', 254: 'I',
}

EXACT_TAGS = {
    1: "SSC Multi-Tasking Staff Exam, 17.03.2013 (Kolkata Region)",
    2: "SSC CAPFs SI, CISF ASI & Delhi Police SI Exam, 21.06.2015 (1st Sitting, TF No. 8037731)",
    3: "SSC (10+2) Stenographer Grade 'C' & 'D' Exam, 31.01.2016 (TF No. 3513283)",
    65: "SSC Multi-Tasking Staff Exam, 07.08.2019 (Shift-I)",
    121: "SSC CHSL 10+2 Tier-I (CBE) Exam, 09.06.2022 (Shift-I)",
}

DATE_OVERRIDES = {
    # Fix any corrupted date OCR if raw exam_tag didn't have exact date
    141: '15.11.2021',
    153: '11.04.2022',
    154: '11.04.2022',
    155: '12.04.2022',
    169: '02.12.2022',
    182: '20.10.2021',
    183: '05.07.2022',
    184: '05.07.2022',
    185: '05.07.2022',
    186: '05.07.2022',
    187: '06.07.2022',
    217: '03.10.2023',
    249: '28.10.2024',
}

def norm_exam_name(qn, raw_ex):
    ex = raw_ex
    # Check specific ranges / clean up OCR noise
    if qn in EXACT_TAGS:
        return EXACT_TAGS[qn]
    # Date
    m_d = re.search(r'(\d{2}\.\s*\d{2}\.\d{4})', ex)
    date = DATE_OVERRIDES.get(qn, m_d.group(1).replace(' ', '') if m_d else '')
    assert date, f"Missing date Q{qn}: {raw_ex}"
    # Exam name classification from clean normalized prefixes
    s = re.sub(r'[^A-Za-z0-9+&,\'()\s-]', ' ', ex)
    s = re.sub(r'\s+', ' ', s)
    low = s.lower()
    if qn == 27 or 'assam rifles' in low:
        name = 'SSC CAPFs, NIA, SSF Constable (GD) & Assam Rifles Rifleman (GD) Exam'
    elif ('constab' in low and ('rifle' in low or 'rileman' in low)) or qn in range(172, 178) or qn in range(218, 228):
        name = 'SSC Constable (GD) & Rifleman (GD) Exam'
    elif 'constab' in low:
        name = 'SSC Constable (GD) Exam'
    elif 'stenog' in low:
        name = "SSC Stenographer Grade 'C' and 'D' Exam"
    elif 'forces' in low or 'central armed' in low or 'centrala' in low.replace(' ',''):
        name = 'SSC SI in Delhi Police and Central Armed Police Forces Exam'
    elif 'cisf' in low or 'capf' in low or 'cpo' in low or 'delhi' in low or qn == 217:
        if qn in range(28, 31):
            name = 'SSC SI in Delhi Police, CAPFs & ASI (CISF) Exam'
        elif qn in range(68, 73):
            name = 'SSC CAPFs SI, Delhi Police SI & CISF ASI Exam'
        elif qn in range(78, 81):
            name = 'SSC Delhi Police SI, CAPFs SI & CISF ASI Exam'
        elif qn in range(143, 149) or qn in (217, 228, 229):
            name = 'SSC Delhi Police SI, CAPFs SI & CISF ASI (CPO) Exam'
        else:
            name = 'SSC Delhi Police SI, CAPFs SI & CISF ASI Exam'
    elif qn in (82, 83):
        name = 'SSC CHSL Exam'
    elif 'tier-ii' in low or 'tier-2' in low or qn == 253:
        name = 'SSC CHSL 10+2 Tier-II (CBE) Exam'
    elif 'chsl' in low:
        if qn <= 25:
            name = 'SSC CHSL (10+2) Tier-I CBE Exam'
        elif qn <= 88:
            name = 'SSC CHSL (10+2) Tier-I Exam' if ('10+2' in low or qn <= 77) else 'SSC CHSL Tier-I Exam'
        else:
            name = 'SSC CHSL 10+2 Tier-I (CBE) Exam'
    elif 'cgl' in low or qn in (154, 155):
        name = 'SSC CGL Tier-I (CBE) Exam'
    elif 'non-technical' in low or 'non technical' in low:
        name = 'SSC Multi-Tasking (Non-Technical) Staff Exam'
    elif qn in (198, 199) or ('mts' in low or 'mis' in low):
        name = 'SSC MTS Exam'
    elif 'tasking' in low or 'mult' in low or 'task' in low or qn in (182, 183, 184, 185, 186, 187, 215, 216, 248, 249):
        name = 'SSC Multi-Tasking Staff Exam'
    else:
        raise ValueError(f"Unknown exam name Q{qn}: {raw_ex}")
    sh = VISUAL_SHIFT[qn]
    if sh:
        return f"{name}, {date} (Shift-{sh})"
    return f"{name}, {date}"

if __name__ == '__main__':
    lines_out = []
    for item in raw:
        qn = item['q_num']
        tag = norm_exam_name(qn, item.get('exam_tag', ''))
        lines_out.append(f"Q{qn:03d}: {tag}   | raw: {item.get('exam_tag','')}")
    with open('scripts/pdf_samples/t4_exams_254_check.txt', 'w', encoding='utf-8') as f:
        f.write('\n'.join(lines_out))
    print(f"Wrote {len(lines_out)} lines to t4_exams_254_check.txt")
