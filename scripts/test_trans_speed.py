import urllib.request
import urllib.parse
import json
import time

text = "निम्नलिखित में से कौन सा कथन सही है?"
t0 = time.time()
try:
    q = urllib.parse.quote(text.strip())
    url = f"https://translate.googleapis.com/translate_a/single?client=gtx&sl=hi&tl=en&dt=t&q={q}"
    req = urllib.request.Request(url, headers={'User-Agent': 'Mozilla/5.0'})
    res = urllib.request.urlopen(req, timeout=5)
    data = json.loads(res.read().decode('utf-8'))
    translated = "".join(part[0] for part in data[0] if part[0])
    print(f"Success in {time.time()-t0:.2f}s: {translated}")
except Exception as e:
    print(f"Failed in {time.time()-t0:.2f}s: {e}")
