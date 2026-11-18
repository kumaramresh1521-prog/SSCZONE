import json

with open('scripts/number_system_questions_clean.json', 'r', encoding='utf-8') as f:
    qs = json.load(f)

print('Total qs in clean json:', len(qs))

for i, q in enumerate(qs):
    qtext = q.get('question_text', '')
    expl = q.get('explanation', '')
    t = qtext + ' ' + expl
    
    issues = []
    if 'The number p is' in qtext or 'number p is' in qtext:
        issues.append('pi_as_p')
    if ' 2 is a/an' in qtext or ' 3 is a' in qtext or ' 3 is an' in qtext or '2 is a/an' in qtext:
        issues.append('missing_sqrt')
    if '× ×' in qtext:
        issues.append('mangled_formula_q')
    if '232 + 1' in t:
        issues.append('2^32_flattened')
    if '34n' in t and '43n' in t:
        issues.append('3^4n_flattened')
    if '10n – 1' in t or '10n - 1' in t:
        issues.append('10^n_flattened')
    if '6n – 1' in t or '6n - 1' in t:
        issues.append('6^n_flattened')
    if '1012' in t:
        issues.append('10^12_flattened')
    if '10025' in t:
        issues.append('100^25_flattened')
    if '5n + 6m' in t:
        issues.append('5^n+6^m_flattened')
    if 'a2' in t or 'b2' in t or 'c2' in t or 'x2' in t or 'y2' in t or 'n2' in t:
        issues.append('possible_superscript_2')
    if 'a3' in t or 'b3' in t or 'c3' in t or 'x3' in t or 'y3' in t:
        issues.append('possible_superscript_3')

    if issues:
        print(f"Q{i+1}: {issues} | Q: {qtext[:80]}...")
