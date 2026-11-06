import urllib.request
import urllib.parse
import json
import time

texts = [
    "निम्नलिखित में से कौन सा कथन सही है?",
    "भारत का राष्ट्रपति कौन है?",
    "पानी का रासायनिक सूत्र क्या है?",
    "सूर्य से पृथ्वी तक प्रकाश पहुँचने में कितना समय लगता है?",
    "क्षेत्रफल की दृष्टि से भारत का सबसे बड़ा राज्य कौन सा है?"
]

joined = "\n__DELIM__\n".join(texts)
t0 = time.time()
q = urllib.parse.quote(joined)
url = f"https://translate.googleapis.com/translate_a/single?client=gtx&sl=hi&tl=en&dt=t&q={q}"
req = urllib.request.Request(url, headers={'User-Agent': 'Mozilla/5.0'})
res = urllib.request.urlopen(req, timeout=10)
data = json.loads(res.read().decode('utf-8'))
full_trans = "".join(part[0] for part in data[0] if part[0])
split_res = [t.strip() for t in full_trans.split("__DELIM__")]

print(f"Batched 5 items in {time.time()-t0:.2f}s:")
for orig, tr in zip(texts, split_res):
    print("  ", orig, "-->", tr)
