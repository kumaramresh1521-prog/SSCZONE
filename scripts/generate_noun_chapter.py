# -*- coding: utf-8 -*-
"""
Generates Chapter: English Noun (संज्ञा) - Master Study Notes
100% Comprehensive Coverage from noun_ssczone.pdf
Includes:
- Kinds of Noun (Proper, Common, Collective, Abstract, Material)
- Number of Noun (Singular & Plural formation)
- Gender of Noun (Masculine, Feminine, Common, Neuter)
- Cases of Noun (Nominative, Objective, Possessive, Vocative, Apposition)
- 13 Golden SSC Rules of Nouns with all exceptions & examples
- High-yield comparison tables
- TCS Exam Traps & Error Spotting Rules
- Solved Shift Questions with bilingual explanations
- FAQs
"""

import json
import re

def build_noun_content():
    html = []

    # 1. Introduction & Overview Card
    html.append("""<div class="note-intro-card">
  <h3>🎯 Chapter Overview / अध्याय सारांश</h3>
  <p><span class="lang-en">A <strong>Noun</strong> is the naming word for any person, place, animal, thing, quality, state, or concept. In SSC examinations (CGL, CHSL, CPO, MTS, Stenographer), Noun rules form the backbone of <strong>Subject-Verb Agreement</strong> and <strong>Spotting Errors</strong> questions. Every shift features 2 to 3 direct questions on Uncountable Nouns, Plural-Only Nouns, Apostrophe rules, and Compound Nouns.</span>
  <span class="lang-hi"><strong>संज्ञा (Noun)</strong> किसी व्यक्ति, वस्तु, स्थान, गुण, दशा या विचार के नाम को कहते हैं। SSC परीक्षाओं में संज्ञा के नियम <em>Subject-Verb Agreement</em> और <em>Error Spotting</em> के लिए अत्यंत महत्वपूर्ण हैं। प्रत्येक शिफ्ट में Uncountable Nouns, Plural-Only Nouns, Apostrophe के नियम एवं Compound Nouns से 2 से 3 प्रश्न अवश्य पूछे जाते हैं।</span></p>
</div>""")

    # 2. What is a Noun? Definition
    html.append("""<h2><span class="lang-en">1. What is a Noun? (Definition & Purpose)</span><span class="lang-hi">1. संज्ञा (Noun) क्या है? (परिभाषा एवं उपयोग)</span></h2>

<div class="lang-en">
  <div class="lang-card-en">
    <p>A <strong>Noun</strong> is used as the name of a person, thing, place, idea, and a quality of a person.</p>
    <ul>
      <li><strong>Person:</strong> Rahul, Teacher, Doctor, Sania</li>
      <li><strong>Place:</strong> Delhi, India, School, Jupiter</li>
      <li><strong>Thing:</strong> Pen, Chair, Coal, Gold</li>
      <li><strong>Idea / Quality / State:</strong> Honesty, Beauty, Youth, Death, Freedom</li>
    </ul>
  </div>
</div>

<div class="lang-hi">
  <div class="lang-card-hi">
    <p>हिंदी व्याकरण में <strong>संज्ञा (Noun)</strong> किसी व्यक्ति, वस्तु, स्थान, विचार या गुण के नाम को कहा जाता है।</p>
    <ul>
      <li><strong>व्यक्ति (Person):</strong> राहुल, शिक्षक, डॉक्टर, सानिया</li>
      <li><strong>स्थान (Place):</strong> दिल्ली, भारत, विद्यालय, बृहस्पति</li>
      <li><strong>वस्तु (Thing):</strong> कलम, कुर्सी, कोयला, सोना</li>
      <li><strong>गुण / भाव / अवस्था:</strong> ईमानदारी, सुंदरता, यौवन, मृत्यु, स्वतंत्रता</li>
    </ul>
  </div>
</div>""")

    # 3. Kinds of Noun (5 Core Kinds)
    html.append("""<h2><span class="lang-en">2. Kinds of Noun (संज्ञा के 5 भेद)</span><span class="lang-hi">2. संज्ञा के 5 प्रमुख भेद (विस्तृत वर्गीकरण)</span></h2>

<p><span class="lang-en">In English Grammar, Nouns are classified into 5 core categories based on their nature and identity:</span><span class="lang-hi">अंग्रेजी व्याकरण में संज्ञा को उनकी प्रकृति और पहचान के आधार पर 5 मुख्य वर्गों में बाँटा गया है:</span></p>

<table class="notes-table">
  <thead>
    <tr>
      <th>Kind (प्रकार)</th>
      <th>English Definition & Meaning</th>
      <th>Examples</th>
      <th>हिंदी में अर्थ एवं पहचान</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td><strong>1. Common Noun</strong></td>
      <td>The name given in common to every person or thing of the same kind. It is not a name of any particular entity.</td>
      <td><code>boy, girl, teacher, city, book, river</code></td>
      <td><strong>जातिवाचक संज्ञा:</strong> पूरी जाति या वर्ग का नाम (लड़का, लड़की, शिक्षक, शहर)।</td>
    </tr>
    <tr>
      <td><strong>2. Proper Noun</strong></td>
      <td>The name given to a particular person, place, or thing. Always starts with a Capital Letter.</td>
      <td><code>Delhi, Sania, India, Jupiter, Ganga, SSCZone</code></td>
      <td><strong>व्यक्तिवाचक संज्ञा:</strong> किसी ख़ास व्यक्ति, स्थान या संस्था का नाम (दिल्ली, सानिया, भारत)।</td>
    </tr>
    <tr>
      <td><strong>3. Collective Noun</strong></td>
      <td>The name of a collection or group of persons and things treated and spoken together as a whole.</td>
      <td><code>fleet, audience, class, committee, crowd, mob, jury, family, team</code></td>
      <td><strong>समूहवाचक संज्ञा:</strong> व्यक्तियों या वस्तुओं के समूह का नाम (बेड़ा, श्रोता, कक्षा, समिति, भीड़, जूरी)।</td>
    </tr>
    <tr>
      <td><strong>4. Abstract Noun</strong></td>
      <td>The name of a quality, idea, concept, action, or state that cannot be touched or seen, only felt or thought of.</td>
      <td><code>beauty, youth, honesty, death, bravery, poverty, laughter</code></td>
      <td><strong>भाववाचक संज्ञा:</strong> गुण, भाव, क्रिया या अवस्था (सुंदरता, यौवन, ईमानदारी, मृत्यु, बहादुरी)।</td>
    </tr>
    <tr>
      <td><strong>5. Material Noun</strong></td>
      <td>The name of a raw material or substance from which other articles and things are made.</td>
      <td><code>gold, coal, wheat, tea, iron, silver, cotton, water</code></td>
      <td><strong>द्रव्यवाचक संज्ञा:</strong> पदार्थ या धातु का नाम जिससे वस्तुएं बनती हैं (सोना, कोयला, गेहूँ, चाय, लोहा)।</td>
    </tr>
  </tbody>
</table>""")

    # 4. Number, Gender, and Case
    html.append("""<h2><span class="lang-en">3. Number, Gender & Cases of a Noun</span><span class="lang-hi">3. संज्ञा के वचन, लिंग एवं कारक (Grammatical Cases)</span></h2>

<div class="formula-card">
  <div class="formula-header">⚡ Summary of Grammatical Properties</div>
  <div class="formula-body">
    <p><strong>• Number (वचन):</strong> <em>Singular (एकवचन)</em> – One person/thing; <em>Plural (बहुवचन)</em> – More than one.</p>
    <p><strong>• Gender (लिंग):</strong> <em>Masculine (पुल्लिंग)</em> – Male; <em>Feminine (स्त्रीलिंग)</em> – Female; <em>Common (उभयलिंग)</em> – Either sex (student, child); <em>Neuter (नपुंसकलिंग)</em> – Inanimate things (book, pen).</p>
    <p><strong>• Case (कारक):</strong> The grammatical role a noun plays in a sentence.</p>
  </div>
</div>

<h3><span class="lang-en">Cases of Noun in Detail (कारकों का विश्लेषण)</span><span class="lang-hi">संज्ञा के कारक एवं प्रयोग</span></h3>

<table class="notes-table">
  <thead>
    <tr>
      <th>Case (कारक)</th>
      <th>Function in Sentence</th>
      <th>Example Sentence</th>
      <th>हिंदी व्याख्या</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td><strong>1. Nominative / Subjective Case</strong></td>
      <td>The noun acts as the <strong>subject</strong> (doer) of the verb.</td>
      <td><strong>Mohan</strong> is my friend. / <strong>Rani</strong> sings well.</td>
      <td><strong>कर्ता कारक:</strong> जो कार्य करे (कौन/किसने का उत्तर)।</td>
    </tr>
    <tr>
      <td><strong>2. Objective / Accusative Case</strong></td>
      <td>The noun acts as the <strong>direct object</strong> of the verb or preposition.</td>
      <td>Who brought this <strong>book</strong>? / He helped <strong>Rohan</strong>.</td>
      <td><strong>कर्म कारक:</strong> जिस पर क्रिया का फल पड़े (क्या/किसे का उत्तर)।</td>
    </tr>
    <tr>
      <td><strong>3. Possessive / Genitive Case</strong></td>
      <td>Shows ownership, origin, or relationship (uses <code>'s</code> or <code>of</code>).</td>
      <td>She is <strong>Mohan’s</strong> wife. / The leg <strong>of the table</strong>.</td>
      <td><strong>संबंध कारक:</strong> अधिकार या संबंध दर्शाने वाला (का/की/के)।</td>
    </tr>
    <tr>
      <td><strong>4. Vocative Case</strong></td>
      <td>Used to call, address, or get the attention of a person.</td>
      <td>Help me, <strong>Mohan</strong>! / Come here, <strong>boys</strong>.</td>
      <td><strong>संबोधन कारक:</strong> जिसे पुकारा या संबोधित किया जाए (हे मोहन!)।</td>
    </tr>
    <tr>
      <td><strong>5. Case in Apposition</strong></td>
      <td>A descriptive noun placed immediately next to another noun to explain or identify it without conjunction.</td>
      <td><strong>Mohan, the captain of our team,</strong> has been rewarded.</td>
      <td><strong>समानाधिकरण (Apposition):</strong> बिना conjunction के किसी संज्ञा के ठीक बाद दूसरी संज्ञा रखकर उसकी पहचान बताना।</td>
    </tr>
  </tbody>
</table>""")

    # 5. Golden Rules of Noun (Rule 1 to 13)
    html.append("""<h2><span class="lang-en">4. The 13 Golden Rules of Nouns for SSC Exams</span><span class="lang-hi">4. SSC परीक्षाओं के लिए संज्ञा के 13 स्वर्णिम नियम</span></h2>

<p><span class="lang-en">These 13 rules are directly extracted from official examination patterns and cover 100% of the questions asked in SSC CGL, CHSL, CPO, and MTS. Study each rule, exception, and example carefully.</span><span class="lang-hi">ये 13 नियम SSC CGL, CHSL, CPO और MTS की परीक्षाओं में बार-बार पूछे जाने वाले एरर-स्पॉटिंग और फिलर्स के 100% प्रश्नों को कवर करते हैं:</span></p>""")

    # Rule I: Uncountable Nouns
    html.append("""<div class="note-intro-card">
  <h3 style="margin-top:0;">Rule I: Uncountable Nouns (अगणनीय संज्ञाएँ)</h3>
  <p><span class="lang-en"><strong>Four Core Principles:</strong><br/>
  1. Uncountable nouns are used in <strong>singular form only</strong> (no <code>-s/-es</code>).<br/>
  2. Indefinite articles (<code>a/an</code>) are <strong>never</strong> used directly before them.<br/>
  3. They always take a <strong>singular verb</strong>.<br/>
  4. Use <strong>‘Much’</strong> or <strong>‘Some’</strong> instead of <strong>‘Many’</strong> to denote quantity.</span>
  <span class="lang-hi"><strong>चार मुख्य नियम:</strong><br/>
  1. Uncountable संज्ञाएँ हमेशा <strong>एकवचन</strong> में प्रयुक्त होती हैं (इनमें <code>-s/-es</code> नहीं लगता)।<br/>
  2. इनके पहले कभी भी <code>a</code> या <code>an</code> नहीं लगाया जाता।<br/>
  3. इनके साथ हमेशा <strong>एकवचन क्रिया (Singular Verb)</strong> आती है।<br/>
  4. बहुवचन या मात्रा दर्शाने के लिए <em>‘Many’</em> की जगह <em>‘Much’</em> या <em>‘Some’</em> आता है।</span></p>
</div>

<div class="callout-box info">
  <p><strong>📋 High-Frequency SSC Uncountable Nouns List (कंठस्थ करें):</strong><br/>
  <code>advice</code> (सलाह), <code>information</code> (जानकारी), <code>hair</code> (बाल), <code>luggage</code> / <code>baggage</code> (सामान), <code>business</code> (व्यापार), <code>work</code> (काम), <code>word</code> (वचन/संदेश), <code>mischief</code> (शरारत), <code>bread</code> (रोटी), <code>scenery</code> (प्राकृतिक दृश्य), <code>abuse</code> (गाली), <code>vacation</code> (छुट्टी), <code>money</code> (पैसा/धन), <code>knowledge</code> (ज्ञान), <code>evidence</code> (सबूत), <code>employment</code> (रोजगार), <code>alphabet</code> (वर्णमाला), <code>poetry</code> (कविता/काव्य), <code>food</code> (भोजन), <code>furniture</code> (फर्नीचर), <code>fuel</code> (ईंधन), <code>paper</code> (कागज़), <code>equipment</code> (उपकरण), <code>machinery</code> (मशीनरी), <code>material</code> (सामग्री)।</p>
</div>

<div class="formula-card">
  <div class="formula-header">⚡ How to Express Singularity & Plurality in Uncountable Nouns</div>
  <div class="formula-body">
    <table class="notes-table" style="margin:0;">
      <thead>
        <tr>
          <th>To Denote Singularity (एकवचन गिनने हेतु)</th>
          <th>To Denote Plurality (बहुवचन गिनने हेतु)</th>
        </tr>
      </thead>
      <tbody>
        <tr>
          <td>• <strong>a piece of advice</strong> / a word of advice (एक सलाह)</td>
          <td>• <strong>many pieces of advice</strong> / much advice (बहुत सलाहें)</td>
        </tr>
        <tr>
          <td>• <strong>a piece of work</strong> (एक काम)</td>
          <td>• <strong>pieces of work</strong> / much work (कई काम)</td>
        </tr>
        <tr>
          <td>• <strong>a loaf of bread</strong> / a piece of bread (एक रोटी/डबलरोटी)</td>
          <td>• <strong>loaves of bread</strong> / pieces of bread (कई रोटियाँ)</td>
        </tr>
        <tr>
          <td>• <strong>an article of luggage</strong> (सामान की एक वस्तु)</td>
          <td>• <strong>articles of luggage</strong> / much luggage (सामान की कई वस्तुएँ)</td>
        </tr>
        <tr>
          <td>• <strong>an act of mischief</strong> (एक शरारत)</td>
          <td>• <strong>acts of mischief</strong> / much mischief (कई शरारतें)</td>
        </tr>
        <tr>
          <td>• <strong>a word of abuse</strong> (एक गाली)</td>
          <td>• <strong>words of abuse</strong> (कई गालियाँ)</td>
        </tr>
      </tbody>
    </table>
  </div>
</div>

<div class="pyq-box">
  <div class="pyq-title">🔥 SSC Exam Error Spotting Spot-Check (Rule I)</div>
  <div class="pyq-body">
    <p>❌ <em>Incorrect:</em> He gave me <strong>an information</strong> yesterday.<br/>
    ✓ <em>Correct:</em> He gave me <strong>information</strong> (or <strong>a piece of information</strong>) yesterday. [हिंदी: उसने मुझे कल जानकारी दी।]</p>
    
    <p>❌ <em>Incorrect:</em> You should be true to your <strong>words</strong>.<br/>
    ✓ <em>Correct:</em> You should be true to your <strong>word</strong>. [हिंदी: तुम्हें अपने वचन का पक्का होना चाहिए — यहाँ 'word' का अर्थ वचन है।]</p>
    
    <p>❌ <em>Incorrect:</em> He was punished for committing <strong>many mischiefs</strong>.<br/>
    ✓ <em>Correct:</em> He was punished for committing <strong>much mischief</strong> (or <strong>many acts of mischief</strong>). [हिंदी: उसे बहुत शरारत करने के लिए दंड मिला।]</p>
    
    <p>❌ <em>Incorrect:</em> The <strong>sceneries</strong> of Kashmir are very charming.<br/>
    ✓ <em>Correct:</em> The <strong>scenery</strong> of Kashmir is very charming. [हिंदी: कश्मीर का प्राकृतिक दृश्य बहुत मनमोहक है।]</p>

    <p>❌ <em>Incorrect:</em> Young persons dislike the <strong>advices</strong> of the elderly people.<br/>
    ✓ <em>Correct:</em> Young persons dislike the <strong>advice</strong> of the elderly people. [हिंदी: युवा बुजुर्गों की सलाह पसंद नहीं करते।]</p>
  </div>
</div>""")

    # Rule II: Collective Nouns
    html.append("""<div class="note-intro-card">
  <h3 style="margin-top:0;">Rule II: Collective Nouns Agreement (समूहवाचक संज्ञाओं के नियम)</h3>
  <p><span class="lang-en">Collective nouns can take either a <strong>Singular Verb</strong> or a <strong>Plural Verb</strong> depending on whether the group acts as a <strong>single united unit</strong> or as <strong>divided individuals</strong>:</span>
  <span class="lang-hi">समूहवाचक संज्ञाओं के साथ क्रिया का चयन इस बात पर निर्भर करता है कि समूह <strong>एक इकाई (United Unit)</strong> के रूप में कार्य कर रहा है या उसके <strong>सदस्यों में मतभेद/विभाजन (Divided Individuals)</strong> है:</span></p>
</div>

<table class="notes-table">
  <thead>
    <tr>
      <th>Group</th>
      <th>Nouns</th>
      <th>Verb Used</th>
      <th>Condition & Concept (शर्त एवं नियम)</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td><strong>Category A</strong></td>
      <td><code>cattle, gentry, peasantry, poultry, clergy, people, majority, folk</code></td>
      <td><strong>Always Plural Verb</strong></td>
      <td>ये हमेशा बहुवचन में ही प्रयुक्त होते हैं। इनके साथ कभी भी '-s' नहीं लगता (e.g. <em>cattle</em> होता है, <em>cattles</em> अशुद्ध है)।</td>
    </tr>
    <tr>
      <td><strong>Category B (United)</strong></td>
      <td><code>committee, jury, house, ministry, family, mob, crowd, audience, team, board, staff, public</code></td>
      <td><strong>Singular Verb</strong></td>
      <td>जब पूरा समूह <strong>एकमत (Unanimous)</strong> होकर एक इकाई की तरह काम करे।</td>
    </tr>
    <tr>
      <td><strong>Category C (Divided)</strong></td>
      <td><code>committee, jury, house, ministry, family, mob, crowd, audience, team, board, staff, public</code></td>
      <td><strong>Plural Verb</strong></td>
      <td>जब समूह के सदस्यों के विचार <strong>बँटे हुए (Divided / Bitter)</strong> हों या प्रत्येक सदस्य पर अलग-अलग विचार किया जाए।</td>
    </tr>
  </tbody>
</table>

<div class="callout-box alert">
  <p><strong>⚠️ TCS Shift Alert on 'Police' & 'Cattle':</strong><br/>
  1. <strong>Cattle:</strong> <em>Cattles are grazing</em> ❌ → <em>Cattle are grazing</em> ✓ ('Cattle' स्वयं बहुवचन है, 'cattles' अशुद्ध है)।<br/>
  2. <strong>Police:</strong> प्रतियोगी परीक्षाओं में <code>The police have caught the thief</code> (Plural Verb) को मानक माना जाता है। यदि 'police' पूरे विभाग/संस्था के रूप में आए तो औपचारिक रूप में एकवचन भी मिलता है, परंतु SSC में अधिकांशतः 'police' के साथ Plural Verb का प्रयोग होता है।</p>
</div>

<div class="pyq-box">
  <div class="pyq-title">📝 Exam Examples with Explanations (Rule II)</div>
  <div class="pyq-body">
    <p>• <strong>The committee is unanimous on this issue.</strong> ✓ [एकमत है → Singular Verb 'is']<br/>
    • <strong>The committee are divided and there is bitterness among the members.</strong> ✓ [सदस्यों में मतभेद है → Plural Verb 'are']<br/>
    • <strong>The audience was spell-bound.</strong> ✓ [श्रोता समूह एक रस में मंत्रमुग्ध था → Singular Verb 'was']<br/>
    • <strong>The audience were forbidden to occupy chairs.</strong> ✓ [प्रत्येक दर्शक के लिए अलग कुर्सी → Plural Verb 'were']<br/>
    • <strong>His family are not agreed on this point.</strong> ✓ [परिवार के सदस्य आपस में सहमत नहीं हैं → Plural Verb 'are']<br/>
    • <strong>The team is at the top in this competition.</strong> ✓ [पूरी टीम एक साथ शीर्ष पर है → 'is']<br/>
    • <strong>The team are full of high spirits.</strong> ✓ [टीम के सभी खिलाड़ी उत्साह से भरे हैं → 'are']</p>
  </div>
</div>""")

    # Rule III: Same Singular and Plural Form
    html.append("""<div class="note-intro-card">
  <h3 style="margin-top:0;">Rule III: Nouns with Same Singular & Plural Forms (समान एकवचन व बहुवचन)</h3>
  <p><span class="lang-en">Nouns like <strong>deer, sheep, fish, offspring, crew, family, team, jury, aircraft, counsel</strong> have the exact same form in both singular and plural. Their number is determined solely by the verb and context.</span>
  <span class="lang-hi"><strong>sheep, deer, fish, offspring, aircraft, counsel</strong> आदि संज्ञाओं का एकवचन और बहुवचन रूप बिल्कुल एक समान रहता है। इनमें कभी भी 's/es' नहीं लगाया जाता।</span></p>
</div>

<div class="pyq-box">
  <div class="pyq-title">🔥 Spotting Error Examples (Rule III)</div>
  <div class="pyq-body">
    <p>❌ <em>Incorrect:</em> <strong>Sheeps</strong> are economically useful for wool.<br/>
    ✓ <em>Correct:</em> <strong>Sheep</strong> are economically useful for wool. [हिंदी: भेड़ें ऊन के लिए आर्थिक रूप से उपयोगी हैं।]</p>
    
    <p>✓ <em>Correct:</em> <strong>A sheep is</strong> grazing in the field. (एकवचन)<br/>
    ✓ <em>Correct:</em> <strong>Ten sheep are</strong> grazing in the field. (बहुवचन — 'sheeps' कभी नहीं होगा)</p>
    
    <p>💡 <em>Special Note on 'Fish' vs 'Fishes':</em> <strong>Fish</strong> का बहुवचन सामान्यतः <strong>Fish</strong> ही होता है (There are many fish in the pond)। परंतु यदि भिन्न-भिन्न प्रजातियों/प्रकारों की मछलियों की बात हो, तब <strong>fishes</strong> का प्रयोग व्याकरणसम्मत है (Fishes of different species).</p>
  </div>
</div>""")

    # Rule IV: Nouns Ending in 's' with Singular Verb
    html.append("""<div class="note-intro-card">
  <h3 style="margin-top:0;">Rule IV: Nouns Ending in '-s' but Taking Singular Verb (दिखने में बहुवचन, अर्थ में एकवचन)</h3>
  <p><span class="lang-en">Certain nouns end in <code>-s</code> or <code>-es</code> and appear to be plural, but they represent a single concept, discipline, disease, or game, and therefore take a <strong>Singular Verb</strong>:</span>
  <span class="lang-hi">कुछ संज्ञाओं के अंत में <code>-s</code> या <code>-es</code> लगा होता है और वे बहुवचन जैसी प्रतीत होती हैं, परंतु अर्थ में वे <strong>एकवचन</strong> होती हैं तथा उनके साथ हमेशा <strong>एकवचन क्रिया (Singular Verb)</strong> आती है:</span></p>
</div>

<table class="notes-table">
  <thead>
    <tr>
      <th>Category</th>
      <th>Nouns List</th>
      <th>Meaning / हिंदी अर्थ</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td><strong>1. Branches of Learning (विषय)</strong></td>
      <td><code>Mathematics, Physics, Economics, Politics, Statistics, Mechanics, Ethics, Statics</code></td>
      <td>गणित, भौतिकी, अर्थशास्त्र, राजनीति, सांख्यिकी, यांत्रिकी, नीतिशास्त्र।</td>
    </tr>
    <tr>
      <td><strong>2. Diseases (बीमारियाँ)</strong></td>
      <td><code>Measles, Mumps, Rickets, Shingles</code></td>
      <td>खसरा, कंठमाला, रिकेट्स (सूखा रोग)।</td>
    </tr>
    <tr>
      <td><strong>3. Games & Sports (खेल)</strong></td>
      <td><code>Billiards, Darts, Aquatics, Gymnastics, Athletics</code></td>
      <td>बिलियर्ड्स, डार्ट्स, तैराकी, जिम्नास्टिक, एथलेटिक्स।</td>
    </tr>
    <tr>
      <td><strong>4. Titles of Books (पुस्तकों के नाम)</strong></td>
      <td><code>The Three Musketeers, Gulliver’s Travels, Arabian Nights, War and Peace</code></td>
      <td>प्रसिद्ध पुस्तकों के शीर्षक।</td>
    </tr>
    <tr>
      <td><strong>5. Descriptive Country Names</strong></td>
      <td><code>The United States, The United Arab Emirates, The United Kingdom, The West Indies</code></td>
      <td>संयुक्त राज्य, संयुक्त अरब अमीरात आदि।</td>
    </tr>
    <tr>
      <td><strong>6. Other Nouns</strong></td>
      <td><code>News, Innings, Series, Summons</code></td>
      <td>समाचार, पारी (इनिंग्स), शृंखला, अदालती बुलावा (सम्मन)।</td>
    </tr>
  </tbody>
</table>

<div class="callout-box alert">
  <p><strong>⚠️ Tricky Exception on 'Mathematics' & 'Statistics':</strong><br/>
  • जब <strong>Mathematics/Physics/Statistics</strong> किसी विषय (Subject of study) के रूप में आए, तो क्रिया <strong>एकवचन</strong> होगी: <em>Mathematics <strong>is</strong> an interesting subject.</em><br/>
  • लेकिन जब इनके पहले कोई <strong>Possessive Adjective</strong> (My, His, Her) या 'The' लग जाए और इनका अर्थ <strong>गणना (Calculations) या आँकड़े (Data)</strong> हो, तो क्रिया <strong>बहुवचन</strong> होगी: <em>My mathematics <strong>are</strong> weak. / The statistics of the census <strong>reveal</strong> interesting facts.</em></p>
</div>

<div class="pyq-box">
  <div class="pyq-title">🔥 SSC Shift Questions (Rule IV)</div>
  <div class="pyq-body">
    <p>❌ <em>Incorrect:</em> The measles <strong>have</strong> broken out in the town.<br/>
    ✓ <em>Correct:</em> The measles <strong>has</strong> broken out in the town. [हिंदी: शहर में खसरा फैल गया है।]</p>
    
    <p>❌ <em>Incorrect:</em> Politics <strong>are</strong> a dirty game.<br/>
    ✓ <em>Correct:</em> Politics <strong>is</strong> a dirty game. [हिंदी: राजनीति एक गंदा खेल है।]</p>
    
    <p>❌ <em>Incorrect:</em> These <strong>news are</strong> disappointing.<br/>
    ✓ <em>Correct:</em> This <strong>news is</strong> disappointing. [हिंदी: यह खबर निराशाजनक है।]</p>
    
    <p>❌ <em>Incorrect:</em> The court has issued a <strong>summon</strong> against him.<br/>
    ✓ <em>Correct:</em> The court has issued a <strong>summons</strong> against him. [एकवचन 'summons' होता है; इसका बहुवचन 'summonses' होता है!]</p>

    <p>❌ <em>Incorrect:</em> A series of matches <strong>are</strong> being played.<br/>
    ✓ <em>Correct:</em> A series of matches <strong>is</strong> being played. (लेकिन: <em>Two series of matches <strong>were</strong> played.</em>)</p>
  </div>
</div>""")

    # Rule V: Meaning Changing in Plural Form
    html.append("""<div class="note-intro-card">
  <h3 style="margin-top:0;">Rule V: Nouns that Change Their Meaning in Plural Form (बहुवचन बनते ही अर्थ बदलने वाले शब्द)</h3>
  <p><span class="lang-en">SSC tests these confusing pairs frequently. Adding an <code>-s</code> to these nouns does not merely make them plural; it completely transforms their meaning:</span>
  <span class="lang-hi">कुछ संज्ञाओं में <code>-s</code> लगाने से वे केवल बहुवचन नहीं बनतीं, बल्कि उनका अर्थ पूरी तरह बदल जाता है। SSC इनपर आधारित एरर बार-बार पूछता है:</span></p>
</div>

<table class="notes-table">
  <thead>
    <tr>
      <th>Singular Form</th>
      <th>Meaning (एकवचन में अर्थ)</th>
      <th>Plural Form (-s)</th>
      <th>Transformed Meaning (बहुवचन में नया अर्थ)</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td><strong>Wood</strong></td>
      <td>Material (लकड़ी)</td>
      <td><strong>Woods</strong></td>
      <td>Forest (जंगल)</td>
    </tr>
    <tr>
      <td><strong>Water</strong></td>
      <td>Liquid / Substance (पानी)</td>
      <td><strong>Waters</strong></td>
      <td>Sea / Ocean / Waterbody (समुद्र/जलाशय)</td>
    </tr>
    <tr>
      <td><strong>Good</strong></td>
      <td>Advantage / Benefit / Moral (लाभ/भलाई)</td>
      <td><strong>Goods</strong></td>
      <td>Articles / Merchandise (सामान / माल)</td>
    </tr>
    <tr>
      <td><strong>Iron</strong></td>
      <td>Metal (लोहा)</td>
      <td><strong>Irons</strong></td>
      <td>Chains / Fetters (हथकड़ी / ज़ंजीरें)</td>
    </tr>
    <tr>
      <td><strong>Arm</strong></td>
      <td>Upper limb of body (बाँह/भुजा)</td>
      <td><strong>Arms</strong></td>
      <td>Weapons (हथियार)</td>
    </tr>
    <tr>
      <td><strong>Sand</strong></td>
      <td>Material (रेत/बालू)</td>
      <td><strong>Sands</strong></td>
      <td>Desert / Sandy Beach (रेतीला इलाका / रेगिस्तान)</td>
    </tr>
    <tr>
      <td><strong>Asset</strong></td>
      <td>Quality / Virtue (गुण/विशेषता)</td>
      <td><strong>Assets</strong></td>
      <td>Property / Financial Wealth (संपत्ति)</td>
    </tr>
    <tr>
      <td><strong>Cloth</strong></td>
      <td>Unstitched Fabric (बिना सिला कपड़ा)</td>
      <td><strong>Clothes</strong></td>
      <td>Stitched Garments / Dress (सिले हुए वस्त्र)</td>
    </tr>
    <tr>
      <td><strong>Abuse</strong></td>
      <td>Indecent Words / Insult (गाली/अपशब्द)</td>
      <td><strong>Abuses</strong></td>
      <td>Misuses / Social Evils (कुरीतियाँ/दुरुपयोग)</td>
    </tr>
    <tr>
      <td><strong>Work</strong></td>
      <td>Labour / Task (शारीरिक/मानसिक काम)</td>
      <td><strong>Works</strong></td>
      <td>Literary/Artistic Writings or Factory (साहित्यिक रचनाएँ / कारख़ाना)</td>
    </tr>
    <tr>
      <td><strong>Air</strong></td>
      <td>Atmospheric element (हवा/वायु)</td>
      <td><strong>Airs</strong></td>
      <td>Affected behaviour / Arrogance (बनावटी घमंडपूर्ण व्यवहार)</td>
    </tr>
    <tr>
      <td><strong>Advice</strong></td>
      <td>Counsel / Suggestion (सलाह/परामर्श)</td>
      <td><strong>Advices</strong></td>
      <td>Commercial Information / Bills (व्यापारिक सूचनाएँ)</td>
    </tr>
    <tr>
      <td><strong>Custom</strong></td>
      <td>Habit / Tradition (रिवाज़/परंपरा)</td>
      <td><strong>Customs</strong></td>
      <td>Tax on goods / Duty (सीमा शुल्क/टैक्स)</td>
    </tr>
    <tr>
      <td><strong>Effect</strong></td>
      <td>Result / Consequence (परिणाम/प्रभाव)</td>
      <td><strong>Effects</strong></td>
      <td>Personal belongings / Goods (निजी सामान)</td>
    </tr>
    <tr>
      <td><strong>Colour</strong></td>
      <td>Hue / Tint (रंग)</td>
      <td><strong>Colours</strong></td>
      <td>Flag of regiment/nation (रेजिमेंट या देश का झंडा)</td>
    </tr>
    <tr>
      <td><strong>Fruit</strong></td>
      <td>Edible produce of tree (खाने का फल)</td>
      <td><strong>Fruits</strong></td>
      <td>Results of hard work (कर्म का फल / परिणाम)</td>
    </tr>
    <tr>
      <td><strong>Wit</strong></td>
      <td>Humorous conversational ability (हाजिरजवाबी)</td>
      <td><strong>Wits</strong></td>
      <td>Intelligence / Mental faculties (बुद्धि/समझ)</td>
    </tr>
  </tbody>
</table>""")

    # Rule VI: Plural-Only Nouns
    html.append("""<div class="note-intro-card">
  <h3 style="margin-top:0;">Rule VI: Plural-Only Nouns with Plural Verbs (सदैव बहुवचन रहने वाली संज्ञाएँ)</h3>
  <p><span class="lang-en">Certain nouns consisting of two symmetrical parts, or collective items, are used <strong>only in plural form</strong> and always take a <strong>Plural Verb</strong>:</span>
  <span class="lang-hi">दो समान भागों से बनी वस्तुएँ (जैसे कैंची, पतलून, चश्मा) और कुछ विशिष्ट संज्ञाएँ हमेशा <strong>बहुवचन</strong> में प्रयुक्त होती हैं और इनके साथ हमेशा <strong>बहुवचन क्रिया</strong> आती है:</span></p>
</div>

<table class="notes-table">
  <thead>
    <tr>
      <th>Group</th>
      <th>Nouns List</th>
      <th>हिंदी में अर्थ</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td><strong>(a) Articles of Dress (वस्त्र - दो टांगों वाले)</strong></td>
      <td><code>trousers, pants, pyjamas, jeans, shorts, breeches</code></td>
      <td>पतलून, पैंट, पजामा, जींस, शॉर्ट्स।</td>
    </tr>
    <tr>
      <td><strong>(b) Two-part Instruments (दो अंगों वाले औजार)</strong></td>
      <td><code>scissors, spectacles, glasses, sunglasses, shears, tongs, pliers, binoculars, scales</code></td>
      <td>कैंची, चश्मा, संडासी (चिमटा), प्लास, दूरबीन, तराजू।</td>
    </tr>
    <tr>
      <td><strong>(c) Other Important SSC Nouns</strong></td>
      <td><code>alms, thanks, proceeds, riches, contents, credentials, orders, refreshments, requirements, customs, rations, archives, annals, ashes, arrears, assets, stairs, spirits, quarters, earnings, manners, outskirts, savings, auspices, surroundings</code></td>
      <td>भिक्षा, धन्यवाद, आय/बिक्री धन, संपत्ति, विषय-वस्तु, प्रमाण-पत्र, आदेश, जलपान, राशन, अभिलेख, इतिहास, राख, बकाया वेतन, सीढ़ियाँ, मनोदशा, आवास, कमाई, तौर-तरीके, बाहरी इलाका, बचत, संरक्षण, परिवेश।</td>
    </tr>
  </tbody>
</table>

<div class="callout-box alert">
  <p><strong>⚠️ How to Count Two-Part Nouns:</strong><br/>
  • <em>My scissors <strong>are</strong> sharp.</em> (बहुवचन क्रिया)<br/>
  • जब इनकी गिनती करनी हो, तो <strong>'a pair of'</strong> का प्रयोग किया जाता है। तब क्रिया एकवचन हो जाती है:<br/>
  👉 <strong>A pair of scissors has</strong> been bought by me. ✓ (एकवचन क्रिया क्योंकि कर्ता 'pair' है!)<br/>
  👉 <strong>Two pairs of trousers were</strong> ordered. ✓</p>
</div>

<div class="pyq-box">
  <div class="pyq-title">🔥 Spotting Error Examples (Rule VI)</div>
  <div class="pyq-body">
    <p>❌ <em>Incorrect:</em> My spectacles <strong>is</strong> very costly.<br/>
    ✓ <em>Correct:</em> My spectacles <strong>are</strong> very costly. [हिंदी: मेरा चश्मा बहुत महँगा है।]</p>
    
    <p>❌ <em>Incorrect:</em> <strong>Order</strong> for his transfer has been issued.<br/>
    ✓ <em>Correct:</em> <strong>Orders</strong> for his transfer <strong>have</strong> been issued. [हिंदी: उसके तबादले के आदेश जारी हो चुके हैं — 'Order' नहीं, 'Orders' होता है!]</p>
    
    <p>❌ <em>Incorrect:</em> The alms <strong>was</strong> given to the beggar.<br/>
    ✓ <em>Correct:</em> The alms <strong>were</strong> given to the beggar. [हिंदी: भिखारी को भिक्षा दी गई — 'Alms' हमेशा Plural Verb लेता है।]</p>
  </div>
</div>""")

    # Rule VII: Compound Noun (Number + Noun)
    html.append("""<div class="note-intro-card">
  <h3 style="margin-top:0;">Rule VII: Compound Nouns as Adjectives (संख्या + संज्ञा विशेषण रूप में)</h3>
  <p><span class="lang-en">A compound noun formed by <strong>Numerical + Noun</strong> is <strong>never pluralized</strong> if the noun functions as an adjective before another noun:</span>
  <span class="lang-hi">जब <strong>संख्या + संज्ञा (Number + Noun)</strong> मिलकर किसी अन्य संज्ञा की विशेषता बताते हैं (यानी विशेषण का काम करते हैं), तो वह संज्ञा हमेशा <strong>एकवचन (Singular)</strong> में रहती है, उसमें कभी '-s' नहीं लगता:</span></p>
</div>

<table class="notes-table">
  <thead>
    <tr>
      <th>Incorrect Form (अशुद्ध)</th>
      <th>Correct Form (शुद्ध)</th>
      <th>Meaning / हिंदी अर्थ</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td>A ten-days tour ❌</td>
      <td><strong>A ten-day tour</strong> ✓</td>
      <td>दस दिन का दौरा</td>
    </tr>
    <tr>
      <td>A five-rupees note ❌</td>
      <td><strong>A five-rupee note</strong> ✓</td>
      <td>पाँच रुपये का नोट</td>
    </tr>
    <tr>
      <td>A ten-years-old boy ❌</td>
      <td><strong>A ten-year-old boy</strong> ✓</td>
      <td>दस साल का लड़का</td>
    </tr>
    <tr>
      <td>A three-miles walk ❌</td>
      <td><strong>A three-mile walk</strong> ✓</td>
      <td>तीन मील की सैर</td>
    </tr>
    <tr>
      <td>A five-feet-long room ❌</td>
      <td><strong>A five-foot-long room</strong> ✓</td>
      <td>पाँच फुट लंबा कमरा ('feet' बहुवचन है, 'foot' एकवचन)</td>
    </tr>
    <tr>
      <td>A six-members committee ❌</td>
      <td><strong>A six-member committee</strong> ✓</td>
      <td>छह सदस्यों की समिति</td>
    </tr>
  </tbody>
</table>

<div class="callout-box info">
  <p><strong>💡 Comparison / फर्क समझें:</strong><br/>
  • <em>He has five <strong>rupees</strong>.</em> ✓ (यहाँ 'rupees' मुख्य संज्ञा है, इसलिए बहुवचन सही है।)<br/>
  • <em>He gave me a five-<strong>rupee</strong> note.</em> ✓ (यहाँ 'rupee' शब्द 'note' की विशेषता बता रहा है, इसलिए एकवचन होगा।)</p>
</div>""")

    # Rule VIII: Nouns Expressing Number
    html.append("""<div class="note-intro-card">
  <h3 style="margin-top:0;">Rule VIII: Nouns Expressing Number (संख्या सूचक संज्ञाएँ)</h3>
  <p><span class="lang-en">Nouns expressing number such as <strong>hundred, thousand, million, billion, dozen, score, gross, lakh</strong>:</span><br/>
  1. <strong>Definite Number (निश्चित संख्या):</strong> When preceded by a specific numeral (<em>two, five, several</em>), they remain <strong>Singular</strong> without <code>-s</code> and without <code>of</code>.<br/>
  2. <strong>Indefinite Number (अनिश्चित संख्या):</strong> When expressing vague quantities without a preceding number, they take <strong>Plural (-s)</strong> and are followed by <strong>of</strong>.</p>
  
  <p><span class="lang-hi"><strong>नियम:</strong> जब इनके पहले निश्चित संख्या (2, 3, 5) आए तो इनमें <code>-s</code> नहीं लगता और न ही <code>of</code> लगता है। लेकिन जब अनिश्चित मात्रा (सैकड़ों, हजारों, दर्जनों) बतानी हो, तो <code>-s</code> और <code>of</code> दोनों लगते हैं।</span></p>
</div>

<table class="notes-table">
  <thead>
    <tr>
      <th>Definite Quantity (निश्चित - No '-s', No 'of')</th>
      <th>Indefinite Quantity (अनिश्चित - With '-s' + 'of')</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td>• <strong>Two hundred</strong> boys (दो सौ लड़के)</td>
      <td>• <strong>Hundreds of</strong> boys (सैकड़ों लड़के)</td>
    </tr>
    <tr>
      <td>• <strong>Five thousand</strong> rupees (पाँच हज़ार रुपये)</td>
      <td>• <strong>Thousands of</strong> rupees (हज़ारों रुपये)</td>
    </tr>
    <tr>
      <td>• <strong>Three dozen</strong> bananas (तीन दर्जन केले)</td>
      <td>• <strong>Dozens of</strong> bananas (दर्जनों केले)</td>
    </tr>
    <tr>
      <td>• <strong>Two million</strong> people (बीस लाख लोग)</td>
      <td>• <strong>Millions of</strong> people (लाखों लोग)</td>
    </tr>
  </tbody>
</table>

<div class="pyq-box">
  <div class="pyq-title">🔥 Spotting Errors in SSC (Rule VIII)</div>
  <div class="pyq-body">
    <p>❌ <em>Incorrect:</em> I gave him two <strong>hundreds</strong> rupees.<br/>
    ✓ <em>Correct:</em> I gave him two <strong>hundred</strong> rupees. [हिंदी: मैंने उसे दो सौ रुपये दिए।]</p>
    
    <p>❌ <em>Incorrect:</em> She bought five <strong>dozens</strong> pencils.<br/>
    ✓ <em>Correct:</em> She bought five <strong>dozen</strong> pencils. [हिंदी: उसने पाँच दर्जन पेंसिलें खरीदीं।]</p>
    
    <p>✓ <em>Correct:</em> There are <strong>hundreds of</strong> partially built houses. [यहाँ संख्या अनिश्चित है, अतः 'hundreds of' सही है।]</p>
  </div>
</div>""")

    # Rule IX: Apostrophe with 's'
    html.append("""<div class="note-intro-card">
  <h3 style="margin-top:0;">Rule IX: Rules of Apostrophe with ‘s’ (Apostrophe ’s के नियम)</h3>
  <p><span class="lang-en">The use of apostrophe with <code>'s</code> denotes possession. Study these 6 essential sub-rules tested in SSC exams:</span>
  <span class="lang-hi">संबंध या अधिकार दर्शाने वाले Apostrophe (<code>'s</code>) के 6 मुख्य उप-नियम:</span></p>
</div>

<h3>(A) Living vs Non-Living Things (सजीव बनाम निर्जीव)</h3>
<div class="callout-box alert">
  <p><strong>⚠️ Core Rule:</strong> निर्जीव वस्तुओं (Non-living things) के साथ <code>'s</code> का प्रयोग <strong>अशुद्ध</strong> होता है। उनके लिए <code>of</code> का प्रयोग किया जाता है:<br/>
  ❌ <em>Table's leg</em> → ✓ <strong>The leg of the table</strong><br/>
  ❌ <em>Fan's blade</em> → ✓ <strong>The blade of the fan</strong><br/>
  ❌ <em>House's roof</em> → ✓ <strong>The roof of the house</strong></p>
</div>

<p><strong>अपवाद (Exceptions जहां निर्जीव में भी 's मान्य है):</strong><br/>
1. <strong>Time (समय):</strong> <em>a day's leave, a night's journey, in an hour's time</em><br/>
2. <strong>Weight / Measure (वजन व माप):</strong> <em>a ton's weight, a gram's weight</em><br/>
3. <strong>Distance (दूरी):</strong> <em>a kilometre's distance, a stone's throw</em><br/>
4. <strong>Money / Value (मूल्य):</strong> <em>a rupee's worth</em><br/>
5. <strong>Personified Nouns (मानवीकृत संज्ञाएँ):</strong> <em>Nature's laws, Fortune's favourite, at Death's door</em><br/>
6. <strong>Dignified / Heavenly Bodies:</strong> <em>The Sun's rays, The Earth's atmosphere, The Moon's beauty</em></p>

<h3>(B) Joint Possession vs Separate Possession (संयुक्त बनाम अलग-अलग अधिकार)</h3>
<table class="notes-table">
  <thead>
    <tr>
      <th>Type</th>
      <th>Construction</th>
      <th>Example Sentence & Meaning</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td><strong>Joint Possession (साझा अधिकार)</strong></td>
      <td>Apostrophe केवल <strong>अंतिम संज्ञा</strong> पर लगता है। (Singular or Joint entity)</td>
      <td><strong>Mohan and Sohan’s father</strong> is a doctor.<br/>[मोहन और सोहन दोनों के एक ही पिता हैं।]</td>
    </tr>
    <tr>
      <td><strong>Separate Possession (अलग-अलग अधिकार)</strong></td>
      <td>Apostrophe <strong>दोनों संज्ञाओं</strong> पर अलग-अलग लगता है। (Plural Verb)</td>
      <td><strong>Mohan’s and Sohan’s fathers</strong> are doctors.<br/>[मोहन के पिता अलग हैं और सोहन के पिता अलग हैं → Plural Verb 'are'!]</td>
    </tr>
  </tbody>
</table>

<h3>(C) Plural Nouns Ending in '-s' (हिसिंग साउंड नियम)</h3>
<p>जिन बहुवचन शब्दों के अंत में पहले से <code>-s</code> लगा हो, उनके साथ केवल <strong>Apostrophe (')</strong> लगता है, दोबारा 's' नहीं लगाया जाता:</p>
<ul>
  <li><strong>Boys' School</strong> (लड़कों का स्कूल) — <em>Boy's School</em> नहीं!</li>
  <li><strong>Girls' Hostel</strong> (लड़कियों का छात्रावास)</li>
  <li><strong>Workers' Union</strong> (मजदूरों का संघ)</li>
  <li><em>Note on Irregular Plurals:</em> यदि बहुवचन के अंत में 's' न हो, तो <code>'s</code> पूरा लगेगा: <strong>Men's club</strong>, <strong>Children's books</strong>, <strong>Women's college</strong>.</li>
</ul>

<h3>(D) Compound Nouns (मिश्रित संज्ञाएँ)</h3>
<p>Compound Noun में Apostrophe हमेशा <strong>अंतिम शब्द</strong> पर लगाया जाता है:</p>
<ul>
  <li><strong>Sister-in-law's house</strong> (ननद/भाभी का घर) — <em>Sisters'-in-law house</em> ❌</li>
  <li><strong>Commander-in-chief's orders</strong> (सेनापति का आदेश)</li>
</ul>

<h3>(E) 'Else' with Indefinite Pronouns (Somebody else's)</h3>
<div class="callout-box info">
  <p>जब Indefinite Pronouns (<em>somebody, anybody, nobody, someone, anyone</em>) के साथ <strong>else</strong> आता है, तो Apostrophe <strong>else के अंत में</strong> लगता है:<br/>
  ❌ <em>This is somebody's else book.</em><br/>
  ✓ <strong>This is somebody else's book.</strong> [हिंदी: यह किसी और की किताब है।]<br/>
  • <strong>Whose else</strong> book is this? (या बोलचाल में <em>Who else's book is this?</em>)</p>
</div>""")

    # Rule X: Two Adjectives for Different Things
    html.append("""<div class="note-intro-card">
  <h3 style="margin-top:0;">Rule X: Two Adjectives Qualifying the Same Noun (दो भिन्न अर्थ वाले विशेषण)</h3>
  <p><span class="lang-en">Two adjectives denoting different meanings and qualifying the same noun are considered plural and take a <strong>Plural Verb</strong>:</span>
  <span class="lang-hi">जब दो अलग-अलग अर्थ देने वाले विशेषण 'and' से जुड़कर एक ही संज्ञा की विशेषता बताते हैं, तो वे बहुवचन माने जाते हैं और उनके साथ <strong>बहुवचन क्रिया</strong> आती है:</span></p>
</div>

<div class="pyq-box">
  <div class="pyq-title">📝 Exam Examples (Rule X)</div>
  <div class="pyq-body">
    <p>• <strong>Cultural and social life in India are changing.</strong> ✓<br/>
    [हिंदी: भारत में सांस्कृतिक और सामाजिक जीवन (दो अलग पहलू) बदल रहे हैं → Plural Verb 'are']</p>
    
    <p>• <strong>Summer and winter vacation are compulsory in our schools.</strong> ✓<br/>
    [हिंदी: हमारे स्कूलों में गर्मी और सर्दी की छुट्टियाँ अनिवार्य हैं → Plural Verb 'are']</p>
  </div>
</div>""")

    # Rule XI: Noun Repeated after Preposition
    html.append("""<div class="note-intro-card">
  <h3 style="margin-top:0;">Rule XI: Noun Repeated After a Preposition (Preposition के बाद वही संज्ञा)</h3>
  <p><span class="lang-en">When the exact same noun is repeated on both sides of a preposition, the noun must <strong>always be in Singular Form</strong> on both sides and takes a <strong>Singular Verb</strong>:</span>
  <span class="lang-hi">जब किसी Preposition के पहले और बाद में एक ही संज्ञा दोहराई जाए, तो दोनों तरफ संज्ञा <strong>सदैव एकवचन (Singular)</strong> में होगी और उसके साथ <strong>एकवचन क्रिया</strong> आएगी:</span></p>
</div>

<table class="notes-table">
  <thead>
    <tr>
      <th>Incorrect Form (अशुद्ध)</th>
      <th>Correct Form (शुद्ध)</th>
      <th>Hindi Meaning (अर्थ)</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td>Doors to doors ❌ / Door to doors ❌</td>
      <td><strong>Door to door</strong> ✓</td>
      <td>घर-घर (दरवाजे-दरवाजे)</td>
    </tr>
    <tr>
      <td>Cities after cities ❌ / City after cities ❌</td>
      <td><strong>City after city</strong> ✓</td>
      <td>शहर-दर-शहर</td>
    </tr>
    <tr>
      <td>Words for words ❌</td>
      <td><strong>Word for word</strong> ✓</td>
      <td>शब्दशः (अक्षरशः)</td>
    </tr>
    <tr>
      <td>Rows upon rows ❌</td>
      <td><strong>Row upon row</strong> ✓</td>
      <td>कतार-दर-कतार</td>
    </tr>
    <tr>
      <td>Hours after hours ❌</td>
      <td><strong>Hour after hour</strong> ✓</td>
      <td>घंटे-दर-घंटे</td>
    </tr>
    <tr>
      <td>Days by days ❌</td>
      <td><strong>Day by day</strong> ✓</td>
      <td>दिन-प्रतिदिन</td>
    </tr>
  </tbody>
</table>

<div class="pyq-box">
  <div class="pyq-title">🔥 Direct SSC Question (Rule XI)</div>
  <div class="pyq-body">
    <p>❌ <em>Incorrect:</em> <strong>Cities after cities were</strong> destroyed by the invaders.<br/>
    ✓ <em>Correct:</em> <strong>City after city was</strong> destroyed by the invaders. [हिंदी: आक्रमणकारियों द्वारा शहर-दर-शहर तबाह कर दिया गया — दोनों तरफ 'city' एकवचन और क्रिया 'was'!]</p>
  </div>
</div>""")

    # Rule XII: Use of Fractions & Percentages
    html.append("""<div class="note-intro-card">
  <h3 style="margin-top:0;">Rule XII: Fractions and Mixed Numbers (भिन्न एवं डेढ़/ढाई का नियम)</h3>
  <p><span class="lang-en">Notice the structure and verb agreement when dealing with fractions:</span>
  <span class="lang-hi">भिन्नों और 'डेढ़' (One and a half) के साथ क्रिया का सही प्रयोग:</span></p>
</div>

<div class="formula-card">
  <div class="formula-header">⚡ Fraction Formulations</div>
  <div class="formula-body">
    <p>1. <strong>One and a half + Plural Noun → Plural Verb:</strong><br/>
    • <em>One and a half <strong>years are</strong> wasted.</em> (डेढ़ साल बर्बाद हो गए।)<br/>
    • <em>One and a half <strong>hours are</strong> wasted.</em> (डेढ़ घंटे बर्बाद हो गए।)</p>
    
    <p>2. <strong>A/An + Singular Noun + and a half → Singular Verb:</strong><br/>
    • <em><strong>A year</strong> and a half <strong>is</strong> wasted.</em> (डेढ़ साल बर्बाद हो गया।)<br/>
    • <em><strong>An hour</strong> and a half <strong>is</strong> wasted.</em> (डेढ़ घंटा बर्बाद हो गया।)</p>
  </div>
</div>""")

    # Rule XIII: Foreign & Irregular Plurals
    html.append("""<div class="note-intro-card">
  <h3 style="margin-top:0;">Rule XIII: Compound & Foreign Irregular Plural Forms (मिश्रित व विदेशी शब्दों के बहुवचन)</h3>
  <p><span class="lang-en">Compound nouns form their plural by adding <code>-s</code> to the <strong>Principal / Root Word</strong>. Greek and Latin loan words follow their own classical plural patterns:</span>
  <span class="lang-hi">मिश्रित संज्ञाओं (Compound Nouns) में बहुवचन केवल <strong>मुख्य शब्द (Root Word)</strong> में '-s' लगाकर बनता है। लैटिन व ग्रीक मूल के शब्द अपने मूल नियमों से बहुवचन बनाते हैं:</span></p>
</div>

<table class="notes-table">
  <thead>
    <tr>
      <th>Singular Form (एकवचन)</th>
      <th>Plural Form (बहुवचन)</th>
      <th>Key Principal Word / हिंदी अर्थ</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td><strong>Commander-in-chief</strong></td>
      <td><strong>Commanders-in-chief</strong> (Commander में 's')</td>
      <td>सर्वोच्च सेनापति</td>
    </tr>
    <tr>
      <td><strong>Major General</strong></td>
      <td><strong>Major Generals</strong> (General में 's')</td>
      <td>मेजर जनरल</td>
    </tr>
    <tr>
      <td><strong>Attorney General</strong></td>
      <td><strong>Attorneys General</strong> (Attorney में 's')</td>
      <td>महान्यायवादी</td>
    </tr>
    <tr>
      <td><strong>Mother-in-law</strong></td>
      <td><strong>Mothers-in-law</strong> (Mother में 's')</td>
      <td>सास</td>
    </tr>
    <tr>
      <td><strong>Brother-in-law</strong></td>
      <td><strong>Brothers-in-law</strong> (Brother में 's')</td>
      <td>साला / जीजा / देवर</td>
    </tr>
    <tr>
      <td><strong>Maid servant</strong></td>
      <td><strong>Maid servants</strong> (Servant में 's')</td>
      <td>नौकरानी</td>
    </tr>
    <tr>
      <td><strong>Looker-on</strong></td>
      <td><strong>Lookers-on</strong> (Looker में 's')</td>
      <td>दर्शक</td>
    </tr>
    <tr>
      <td><strong>Passer-by</strong></td>
      <td><strong>Passers-by</strong> (Passer में 's')</td>
      <td>राहगीर</td>
    </tr>
    <tr>
      <td><strong>Man servant</strong></td>
      <td><strong>Men servants</strong> (दोनों शब्दों का बहुवचन!)</td>
      <td>नौकर</td>
    </tr>
    <tr>
      <td><strong>Woman servant</strong></td>
      <td><strong>Women servants</strong> (दोनों शब्दों का बहुवचन!)</td>
      <td>महिला सेविका</td>
    </tr>
    <tr>
      <td><strong>Datum</strong> (Latin)</td>
      <td><strong>Data</strong></td>
      <td>तथ्य / आँकड़ा (Data बहुवचन है!)</td>
    </tr>
    <tr>
      <td><strong>Criterion</strong> (Greek)</td>
      <td><strong>Criteria</strong></td>
      <td>कसौटी / मापदंड (Criteria बहुवचन है!)</td>
    </tr>
    <tr>
      <td><strong>Phenomenon</strong> (Greek)</td>
      <td><strong>Phenomena</strong></td>
      <td>प्राकृतिक घटना / परिघटना</td>
    </tr>
    <tr>
      <td><strong>Alumnus</strong> (Male)</td>
      <td><strong>Alumni</strong></td>
      <td>पूर्व छात्र</td>
    </tr>
    <tr>
      <td><strong>Syllabus</strong></td>
      <td><strong>Syllabi</strong> (or Syllabuses)</td>
      <td>पाठ्यक्रम</td>
    </tr>
    <tr>
      <td><strong>Basis</strong></td>
      <td><strong>Bases</strong></td>
      <td>आधार</td>
    </tr>
    <tr>
      <td><strong>Crisis</strong></td>
      <td><strong>Crises</strong></td>
      <td>संकट</td>
    </tr>
    <tr>
      <td><strong>Oasis</strong></td>
      <td><strong>Oases</strong></td>
      <td>मरूद्यान (रेगिस्तान में जल-क्षेत्र)</td>
    </tr>
    <tr>
      <td><strong>Radius</strong></td>
      <td><strong>Radii</strong></td>
      <td>त्रिज्या</td>
    </tr>
    <tr>
      <td><strong>Formula</strong></td>
      <td><strong>Formulae</strong> (or Formulas)</td>
      <td>सूत्र</td>
    </tr>
    <tr>
      <td><strong>Memorandum</strong></td>
      <td><strong>Memoranda</strong></td>
      <td>ज्ञापन</td>
    </tr>
    <tr>
      <td><strong>Erratum</strong></td>
      <td><strong>Errata</strong></td>
      <td>मुद्रण त्रुटि (छपाई की गलती)</td>
    </tr>
    <tr>
      <td><strong>Addendum</strong></td>
      <td><strong>Addenda</strong></td>
      <td>परिशिष्ट</td>
    </tr>
    <tr>
      <td><strong>Lacuna</strong></td>
      <td><strong>Lacunae</strong></td>
      <td>कमी / रिक्ति</td>
    </tr>
    <tr>
      <td><strong>Medium</strong></td>
      <td><strong>Media</strong></td>
      <td>माध्यम</td>
    </tr>
    <tr>
      <td><strong>Mouse / Ox</strong></td>
      <td><strong>Mice / Oxen</strong></td>
      <td>चूहा / बैल</td>
    </tr>
  </tbody>
</table>""")

    # 6. Solved Shift PYQ Master Practice Set
    html.append("""<h2><span class="lang-en">5. SSC CGL/CHSL Solved Shift Questions (PYQ Spotting Errors)</span><span class="lang-hi">5. विगत वर्षों के हल प्रश्न (विस्तृत व्याख्या सहित)</span></h2>

<div class="pyq-box">
  <div class="pyq-title">Q1. SSC CGL Tier-1 Shift Question</div>
  <div class="pyq-body">
    <p><strong>Spot the error in the sentence:</strong><br/>
    <em>"All the furnitures have been / sent to the new house / located in the city / No error."</em></p>
    <p><strong>Answer & Detailed Explanation:</strong><br/>
    👉 <strong>Error is in Part 1.</strong> <code>Furniture</code> एक Uncountable Noun है। इसका बहुवचन 'furnitures' नहीं बनता और इसके साथ Singular Verb आती है।<br/>
    ✓ <strong>Correct Sentence:</strong> <em>"All the <strong>furniture has</strong> been sent to the new house located in the city."</em></p>
  </div>
</div>

<div class="pyq-box">
  <div class="pyq-title">Q2. SSC CHSL Tier-1 Shift Question</div>
  <div class="pyq-body">
    <p><strong>Spot the error in the sentence:</strong><br/>
    <em>"My sister-in-laws / who live in Mumbai / have come to stay with us / No error."</em></p>
    <p><strong>Answer & Detailed Explanation:</strong><br/>
    👉 <strong>Error is in Part 1.</strong> Compound Noun में बहुवचन Root Word (मुख्य शब्द) पर '-s' लगाकर बनता है। अतः <code>sister-in-laws</code> अशुद्ध है, सही रूप <strong>sisters-in-law</strong> होगा।<br/>
    ✓ <strong>Correct Sentence:</strong> <em>"My <strong>sisters-in-law</strong> who live in Mumbai have come to stay with us."</em></p>
  </div>
</div>

<div class="pyq-box">
  <div class="pyq-title">Q3. SSC CPO Tier-1 Shift Question</div>
  <div class="pyq-body">
    <p><strong>Spot the error in the sentence:</strong><br/>
    <em>"I saw only / five police who were / running after the bank robbers / No error."</em></p>
    <p><strong>Answer & Detailed Explanation:</strong><br/>
    👉 <strong>Error is in Part 2.</strong> 'Police' संपूर्ण विभाग या वर्ग का सामूहिक नाम है। जब विशिष्ट संख्या (2, 5, 10) की बात करनी हो, तो <code>five police</code> अशुद्ध है। इसके स्थान पर <strong>five policemen</strong> या <strong>five police officers</strong> का प्रयोग किया जाता है।<br/>
    ✓ <strong>Correct Sentence:</strong> <em>"I saw only <strong>five policemen</strong> who were running after the bank robbers."</em></p>
  </div>
</div>

<div class="pyq-box">
  <div class="pyq-title">Q4. SSC CGL Tier-2 Mains Question</div>
  <div class="pyq-body">
    <p><strong>Spot the error in the sentence:</strong><br/>
    <em>"There are many criterions / for selection in the civil services examination / No error."</em></p>
    <p><strong>Answer & Detailed Explanation:</strong><br/>
    👉 <strong>Error is in Part 1.</strong> Greek शब्द 'Criterion' (एकवचन) का बहुवचन <strong>Criteria</strong> होता है। अंग्रेजी व्याकरण में 'criterions' कोई शब्द नहीं है।<br/>
    ✓ <strong>Correct Sentence:</strong> <em>"There are many <strong>criteria</strong> for selection in the civil services examination."</em></p>
  </div>
</div>""")

    # 7. FAQs
    html.append("""<h2><span class="lang-en">6. Frequently Asked Questions (FAQs)</span><span class="lang-hi">6. अक्सर पूछे जाने वाले प्रश्न</span></h2>

<div class="lang-card-en" style="margin-bottom:15px;">
  <p><strong>Q1. Is 'Hair' countable or uncountable in SSC grammar?</strong><br/>
  <strong>Ans:</strong> 'Hair' is normally an uncountable noun taking a singular verb (<em>Her hair is curly</em>). However, when individual hair strands are counted, it becomes countable (<em>I found two grey hairs in the soup</em>).</p>
</div>

<div class="lang-card-en" style="margin-bottom:15px;">
  <p><strong>Q2. What is the difference between 'Cattle' and 'Cattles'?</strong><br/>
  <strong>Ans:</strong> 'Cattles' is grammatically incorrect. 'Cattle' is inherently a plural noun referring to bovine animals and always takes a plural verb (<em>The cattle are in the shed</em>).</p>
</div>

<div class="lang-card-en" style="margin-bottom:15px;">
  <p><strong>Q3. Can we say 'a soap' or 'a bread'?</strong><br/>
  <strong>Ans:</strong> No. Soap and bread are uncountable mass nouns. You must say <strong>a cake/bar of soap</strong> and <strong>a loaf/slice of bread</strong>.</p>
</div>

<div class="lang-card-en" style="margin-bottom:15px;">
  <p><strong>Q4. How to decide whether 'Jury' takes a singular or plural verb?</strong><br/>
  <strong>Ans:</strong> If the jury is united in decision, use a singular verb (<em>The jury was unanimous</em>). If the jurors disagree among themselves, use a plural verb (<em>The jury were divided in their verdict</em>).</p>
</div>""")

    # 8. CTA Card
    html.append("""<div style="background: linear-gradient(135deg, #1e3a8a, #2563eb); color: #ffffff; padding: 24px; border-radius: 14px; margin: 30px 0; text-align: center;">
  <h3 style="margin: 0 0 8px 0; color: #ffffff; font-size: 19px; font-weight: 800;">Master Noun Errors in Live CBT Test Mode</h3>
  <p style="margin: 0 0 16px 0; color: #dbeafe; font-size: 14px;">Attempt real SSC CGL & CHSL shift error-spotting questions with instant percentiles and bilingual solutions.</p>
  <a href="/papers" style="display: inline-block; background: #ffffff; color: #1e3a8a; font-weight: 800; padding: 11px 22px; border-radius: 8px; text-decoration: none; font-size: 14px;">
    Attempt SSC PYQ Shifts Now →
  </a>
</div>""")

    return "\n\n".join(html)

if __name__ == "__main__":
    content = build_noun_content()
    print("Noun content generated successfully!")
    print("Total characters:", len(content))
    print("Total words:", len(content.split()))
