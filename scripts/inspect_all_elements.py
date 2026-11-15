from bs4 import BeautifulSoup

def inspect_all_elements():
    with open('f:/startup  send mail/2026/biology-cell-notes-english.html', 'r', encoding='utf-8') as f:
        soup_en = BeautifulSoup(f.read(), 'html.parser')

    with open('f:/startup  send mail/2026/biology-cell-notes-hindi.html', 'r', encoding='utf-8') as f:
        soup_hi = BeautifulSoup(f.read(), 'html.parser')

    tags_en = list(soup_en.body.find_all(recursive=False))
    tags_hi = list(soup_hi.body.find_all(recursive=False))

    print(f"Total elements: EN={len(tags_en)}, HI={len(tags_hi)}")

    for idx, (te, th) in enumerate(zip(tags_en, tags_hi)):
        tag_name = te.name
        class_name = te.get('class', '')
        text_en = te.get_text()[:40].replace('\n', ' ')
        text_hi = th.get_text()[:40].replace('\n', ' ')
        print(f"[{idx:02d}] <{tag_name} class='{class_name}'>\n     EN: {text_en}\n     HI: {text_hi}")

if __name__ == '__main__':
    inspect_all_elements()
