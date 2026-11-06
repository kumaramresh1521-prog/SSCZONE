import urllib.request
import urllib.parse
import json
import time
import sys

sys.stdout.reconfigure(encoding='utf-8')

def post_translate(texts):
    joined = "\n__DELIM__\n".join(texts)
    data = urllib.parse.urlencode({
        'client': 'gtx',
        'sl': 'hi',
        'tl': 'en',
        'dt': 't',
        'q': joined
    }).encode('utf-8')
    
    url = "https://translate.googleapis.com/translate_a/single"
    req = urllib.request.Request(url, data=data, headers={'User-Agent': 'Mozilla/5.0'})
    res = urllib.request.urlopen(req, timeout=15)
    parsed = json.loads(res.read().decode('utf-8'))
    full_trans = "".join(part[0] for part in parsed[0] if part[0])
    return [s.strip() for s in full_trans.split("__DELIM__")]

# Test 30 strings at once
sample = ["यह एक परीक्षण वाक्य है संख्या " + str(i) for i in range(30)]
t0 = time.time()
res = post_translate(sample)
print(f"Translated {len(res)} strings in {time.time()-t0:.2f}s:")
print("First 3:", res[:3])
print("Last 3:", res[-3:])
