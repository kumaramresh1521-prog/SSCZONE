import json
import re
from bs4 import BeautifulSoup

def build_notes():
    with open('f:/startup  send mail/2026/biology-cell-notes-english.html', 'r', encoding='utf-8') as f:
        soup_en = BeautifulSoup(f.read(), 'html.parser')

    with open('f:/startup  send mail/2026/biology-cell-notes-hindi.html', 'r', encoding='utf-8') as f:
        soup_hi = BeautifulSoup(f.read(), 'html.parser')

    tags_en = list(soup_en.body.find_all(recursive=False))
    tags_hi = list(soup_hi.body.find_all(recursive=False))

    # Helper to parse 15 MCQs
    def parse_mcqs(ol_en, ol_hi):
        mcqs_en = ol_en.find_all('li', recursive=False)
        mcqs_hi = ol_hi.find_all('li', recursive=False)
        parsed = []
        for i in range(len(mcqs_en)):
            le = mcqs_en[i]
            lh = mcqs_hi[i]
            oe = le.find('ol')
            oh = lh.find('ol')

            # Extract question text
            q_en = "".join([str(c) for c in le.contents if c != oe and c != le.find('details')]).strip()
            q_hi = "".join([str(c) for c in lh.contents if c != oh and c != lh.find('details')]).strip()

            opts_en = [opt.decode_contents().strip() for opt in oe.find_all('li', recursive=False)]
            opts_hi = [opt.decode_contents().strip() for opt in oh.find_all('li', recursive=False)]

            de = le.find('details')
            dh = lh.find('details')
            if de and de.find('summary'): de.find('summary').extract()
            if dh and dh.find('summary'): dh.find('summary').extract()
            ans_en = de.decode_contents().strip() if de else ""
            ans_hi = dh.decode_contents().strip() if dh else ""

            match = re.search(r'\(([a-d])\)', ans_en, re.IGNORECASE)
            corr_letter = match.group(1).upper() if match else "A"

            parsed.append({
                "num": i + 1,
                "q_en": q_en,
                "q_hi": q_hi,
                "opts_en": opts_en,
                "opts_hi": opts_hi,
                "corr": corr_letter
            })
        return parsed

    mcqs_data = parse_mcqs(tags_en[96], tags_hi[96])

    # 1. GENERATE ENGLISH CONTENT
    en_parts = []
    # Elements 3 to 94 (95 was "Tap Answer to check", skip it)
    for tag in tags_en[3:95]:
        en_parts.append(str(tag))

    # Add interactive English MCQs without reveal/explanation details
    for q in mcqs_data:
        card = [f'<div class="quiz-card">']
        card.append(f'  <span class="quiz-badge">Question {q["num"]} / 15</span>')
        card.append(f'  <div class="quiz-question">{q["q_en"]}</div>')
        card.append('  <div class="quiz-options">')
        keys = ["A", "B", "C", "D"]
        for opt_idx, key in enumerate(keys):
            opt_text = q["opts_en"][opt_idx]
            is_corr = "true" if key == q["corr"] else "false"
            card.append(f'    <div class="quiz-option" data-opt="{key}" data-is-correct="{is_corr}">')
            card.append(f'      <span class="quiz-option-key">{key}</span>')
            card.append(f'      <span>{opt_text}</span>')
            card.append('    </div>')
        card.append('  </div>')
        card.append('</div>')
        en_parts.append("\n".join(card))

    english_content = "\n\n".join(en_parts)

    # 2. GENERATE HINDI CONTENT
    hi_parts = []
    for tag in tags_hi[3:95]:
        hi_parts.append(str(tag))

    # Add interactive Hindi MCQs without reveal/explanation details
    for q in mcqs_data:
        card = [f'<div class="quiz-card">']
        card.append(f'  <span class="quiz-badge">प्रश्न {q["num"]} / 15</span>')
        card.append(f'  <div class="quiz-question">{q["q_hi"]}</div>')
        card.append('  <div class="quiz-options">')
        keys = ["A", "B", "C", "D"]
        for opt_idx, key in enumerate(keys):
            opt_text = q["opts_hi"][opt_idx]
            is_corr = "true" if key == q["corr"] else "false"
            card.append(f'    <div class="quiz-option" data-opt="{key}" data-is-correct="{is_corr}">')
            card.append(f'      <span class="quiz-option-key">{key}</span>')
            card.append(f'      <span>{opt_text}</span>')
            card.append('    </div>')
        card.append('  </div>')
        card.append('</div>')
        hi_parts.append("\n".join(card))

    hindi_content = "\n\n".join(hi_parts)

    # 3. GENERATE BILINGUAL CONTENT
    bi_parts = []
    for i in range(3, 95):
        te = tags_en[i]
        th = tags_hi[i]
        tname = te.name
        tclass = te.get('class', [])

        if tname in ['h2', 'h3']:
            en_txt = te.decode_contents().strip()
            hi_txt = th.decode_contents().strip()
            bi_parts.append(f'<{tname}><span class="lang-en">{en_txt}</span><span class="lang-hi">{hi_txt}</span></{tname}>')

        elif tname == 'p':
            en_txt = te.decode_contents().strip()
            hi_txt = th.decode_contents().strip()
            c_str = f' class="{" ".join(tclass)}"' if tclass else ''
            bi_parts.append(f'<p{c_str}><span class="lang-en">{en_txt}</span><span class="lang-hi">{hi_txt}</span></p>')

        elif tname == 'div' and 'note' in tclass:
            en_txt = te.decode_contents().strip()
            hi_txt = th.decode_contents().strip()
            bi_parts.append(f'<div class="note"><div class="lang-en">{en_txt}</div><div class="lang-hi">{hi_txt}</div></div>')

        elif tname in ['ul', 'ol']:
            lis_en = te.find_all('li', recursive=False)
            lis_hi = th.find_all('li', recursive=False)
            li_htmls = []
            for le, lh in zip(lis_en, lis_hi):
                le_txt = le.decode_contents().strip()
                lh_txt = lh.decode_contents().strip()
                li_htmls.append(f'  <li><div class="lang-en">{le_txt}</div><div class="lang-hi">{lh_txt}</div></li>')
            bi_parts.append(f'<{tname}>\n' + "\n".join(li_htmls) + f'\n</{tname}>')

        elif tname == 'figure':
            bi_parts.append(f'<div class="lang-en">{str(te)}</div>\n<div class="lang-hi figure-hi">{str(th)}</div>')

        elif tname == 'div' and 'tbl' in tclass:
            table_en = te.find('table')
            table_hi = th.find('table')

            th_en_list = [t.decode_contents().strip() for t in table_en.find_all('th')]
            th_hi_list = [t.decode_contents().strip() for t in table_hi.find_all('th')]

            tbl_html = ['<div class="tbl"><table><thead><tr>']
            for he, hh in zip(th_en_list, th_hi_list):
                tbl_html.append(f'  <th><span class="lang-en">{he}</span><span class="lang-hi">{hh}</span></th>')
            tbl_html.append('</tr></thead><tbody>')

            rows_en = table_en.find_all('tr')[1:]
            rows_hi = table_hi.find_all('tr')[1:]
            for re_row, rh_row in zip(rows_en, rows_hi):
                tds_en = [td.decode_contents().strip() for td in re_row.find_all('td')]
                tds_hi = [td.decode_contents().strip() for td in rh_row.find_all('td')]
                tbl_html.append('<tr>')
                for de_cell, dh_cell in zip(tds_en, tds_hi):
                    tbl_html.append(f'  <td><div class="lang-en">{de_cell}</div><div class="lang-hi">{dh_cell}</div></td>')
                tbl_html.append('</tr>')
            tbl_html.append('</tbody></table></div>')
            bi_parts.append("\n".join(tbl_html))

        else:
            bi_parts.append(f'<div class="lang-en">{str(te)}</div>\n<div class="lang-hi">{str(th)}</div>')

    # Add 15 bilingual interactive MCQs without reveal/explanation details
    for q in mcqs_data:
        card = [f'<div class="quiz-card">']
        card.append(f'  <span class="quiz-badge"><span class="lang-en">Question {q["num"]} / 15</span><span class="lang-hi">प्रश्न {q["num"]} / 15</span></span>')
        card.append('  <div class="quiz-question">')
        card.append(f'    <div class="lang-en">{q["q_en"]}</div>')
        card.append(f'    <div class="lang-hi">{q["q_hi"]}</div>')
        card.append('  </div>')
        card.append('  <div class="quiz-options">')
        keys = ["A", "B", "C", "D"]
        for opt_idx, key in enumerate(keys):
            opt_en = q["opts_en"][opt_idx]
            opt_hi = q["opts_hi"][opt_idx]
            is_corr = "true" if key == q["corr"] else "false"
            card.append(f'    <div class="quiz-option" data-opt="{key}" data-is-correct="{is_corr}">')
            card.append(f'      <span class="quiz-option-key">{key}</span>')
            card.append('      <div>')
            card.append(f'        <div class="lang-en">{opt_en}</div>')
            card.append(f'        <div class="lang-hi">{opt_hi}</div>')
            card.append('      </div>')
            card.append('    </div>')
        card.append('  </div>')
        card.append('</div>')
        bi_parts.append("\n".join(card))

    bilingual_content = "\n\n".join(bi_parts)

    # Update src/data/chapter_notes.json
    with open('src/data/chapter_notes.json', 'r', encoding='utf-8') as f:
        notes = json.load(f)

    for note in notes:
        # Clear exam_tag everywhere across all notes
        note["exam_tag"] = ""

        if note["id"] == "cn_bio_01":
            note["title"] = "Cell: The Unit of Life"
            note["hindi_title"] = "कोशिका: जीवन की इकाई"
            note["chapter_title"] = "Cell: The Unit of Life"
            note["read_time"] = "10 min read"
            note["content"] = bilingual_content
            note["english_content"] = english_content
            note["hindi_content"] = hindi_content
            note["is_active"] = True
            note["updated_at"] = "2026-11-14T12:15:00+05:30"

    with open('src/data/chapter_notes.json', 'w', encoding='utf-8') as f:
        json.dump(notes, f, ensure_ascii=False, indent=2)

    print("SUCCESS: cn_bio_01 and all notes updated without reveal details and without exam tags!")

if __name__ == '__main__':
    build_notes()
