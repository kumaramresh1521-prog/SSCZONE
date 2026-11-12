import urllib.request
import re

url = 'https://testbook.com/question-answer/the-mando-song-known-for-its-emotional-depth-and--66c5e2e8593a105027584fe3'
req = urllib.request.Request(url, headers={'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)'})
try:
    with urllib.request.urlopen(req) as resp:
        html = resp.read().decode('utf-8', errors='ignore')
    for m in re.finditer(r'<meta[^>]+content="([^"]+)"', html):
        content = m.group(1)
        if len(content) > 30:
            print('META:', content)
except Exception as e:
    print('Error:', e)
