import urllib.request
import urllib.parse
import json
import time
import sys

sys.stdout.reconfigure(encoding='utf-8')

def batch_translate_texts(text_list):
    to_translate = []
    index_map = []
    for idx, t in enumerate(text_list):
        if t and any('\u0900' <= c <= '\u097F' for c in t):
            to_translate.append(t)
            index_map.append(idx)
            
    if not to_translate:
        return text_list
        
    results = list(text_list)
    batch_size = 15
    for b_i in range(0, len(to_translate), batch_size):
        chunk = to_translate[b_i:b_i+batch_size]
        joined = "\n__DELIM__\n".join(chunk)
        try:
            q = urllib.parse.quote(joined)
            url = f"https://translate.googleapis.com/translate_a/single?client=gtx&sl=hi&tl=en&dt=t&q={q}"
            req = urllib.request.Request(url, headers={'User-Agent': 'Mozilla/5.0'})
            res = urllib.request.urlopen(req, timeout=15)
            data = json.loads(res.read().decode('utf-8'))
            full_trans = "".join(part[0] for part in data[0] if part[0])
            split_res = [s.strip() for s in full_trans.split("__DELIM__")]
            for c_idx, trans_text in enumerate(split_res):
                if c_idx < len(chunk):
                    orig_pos = index_map[b_i + c_idx]
                    results[orig_pos] = trans_text.strip()
        except Exception as e:
            print(f"Batch trans error: {e}")
            
    return results

sample = [
    "भारतीय संविधान का कौन सा अनुच्छेद समानता का अधिकार देता है?",
    "Option 14",
    "अनुच्छेद 14",
    "अनुच्छेद 19",
    "अनुच्छेद 21",
    "This is already english."
]

t0 = time.time()
res = batch_translate_texts(sample)
print(f"Done in {time.time()-t0:.2f}s:")
for orig, r in zip(sample, res):
    print(" ", r)
