# -*- coding: utf-8 -*-
"""
Generates Chapter: English Articles (उपपद: A, An, The) - Master Study Notes
100% Comprehensive Coverage from articles_ssczone.pdf
Includes:
- Two classes: Indefinite (A, An) and Definite (The)
- Choice between A and An: Sound vs Spelling rules (vowel vs consonant sounds)
- Full list of Silent 'h' words (an hour, an heir, an honest man, an honorary post)
- Full list of Initial Consonants with Vowel Sounds (an M.P., an M.L.A., an S.P., an F.I.R., an X-ray)
- Full list of Initial Vowels with Consonant Sounds (a European, a university, a unique book, a one-eyed man)
- Uses of Indefinite Articles (first mention, class, price/speed, exclamations, position with so/too/such/quite)
- Uses of Definite Article 'The' (rivers, mountain ranges, scriptures, unique objects, countries like The USA/The Netherlands, musical instruments, double comparatives, choice between two)
- Exceptions: Mountain peaks take NO article (Everest, Aravali)
- Omission of Articles (Zero Article):
  - Primary purpose of school, college, hospital, temple, church, prison, bed
  - Materials in general vs specific materials
  - Languages vs Nationalities
  - Modes of transport with 'by' (by car, by train)
  - Meals in general vs special dinner
- Repetition of Articles (Same person holding two posts vs two persons, ordinals rules)
- Solved Shift Questions with bilingual explanations
- FAQs
"""

def build_articles_content():
    html = []

    # 1. Intro Card
    html.append("""<div class="note-intro-card">
  <h3>🎯 Chapter Overview / अध्याय सारांश</h3>
  <p><span class="lang-en"><strong>Articles (A, An, The)</strong> are determiners placed before nouns to define whether the noun is specific or non-specific. In SSC CGL, CHSL, CPO, and MTS exams, questions on Articles focus on <strong>Pronunciation-based A vs An</strong> (silent 'h', acronyms like M.L.A., and 'eu' sounding like 'yu'), <strong>Zero Article before places visited for primary purpose</strong> (school, hospital, prison, temple), <strong>Double Comparatives</strong> (The higher, the colder), and <strong>Repetition of Articles with Joint vs Separate Persons</strong>. Every shift contains 2 to 3 direct questions from this chapter.</span>
  <span class="lang-hi"><strong>आर्टिकल (उपपद: A, An, The)</strong> वह शब्द हैं जो केवल संज्ञा (Noun) से पूर्व आकर यह निश्चित करते हैं कि संज्ञा सामान्य/अनिश्चित (Indefinite) है या विशिष्ट/निश्चित (Definite)। SSC की सभी परीक्षाओं में आर्टिकल से जुड़े प्रश्न <strong>ध्वनि-आधारित A और An के चुनाव</strong> (silent 'h', M.L.A., S.P., European), <strong>Omission of Articles (कहाँ आर्टिकल नहीं लगेगा - स्कूल, कॉलेज, मंदिर, अस्पताल)</strong>, <strong>Double Comparative (The higher, the colder)</strong>, और <strong>आर्टिकल के दोहराव (The Prime Minister and President is/are)</strong> पर पूछे जाते हैं।</span></p>
</div>""")

    # 2. What is an Article? Definition & Kinds
    html.append("""<h2><span class="lang-en">1. What is an Article? (Definition & Kinds)</span><span class="lang-hi">1. आर्टिकल (उपपद) क्या है? (वर्गीकरण एवं भेद)</span></h2>

<div class="lang-en">
  <div class="lang-card-en">
    <p>Articles are demonstrative adjectives and determiners used before nouns to limit, define, or generalize their application in a sentence.</p>
    <p><strong>There are Two Kinds of Articles:</strong></p>
    <ol>
      <li><strong>Indefinite Articles (A, An):</strong> Used in the sense of 'one' or 'any' when talking about a person or thing mentioned for the first time or not specifically known.</li>
      <li><strong>Definite Article (The):</strong> Used in the sense of 'this' or 'that' when pointing out a specific, particular, or previously mentioned entity.</li>
    </ol>
  </div>
</div>

<div class="lang-hi">
  <div class="lang-card-hi">
    <p>अंग्रेजी व्याकरण में आर्टिकल केवल संज्ञा (Noun) के पूर्व प्रयुक्त होकर संज्ञा की निश्चितता या अनिश्चितता तय करते हैं। इनके <strong>दो मुख्य भेद</strong> हैं:</p>
    <ol>
      <li><strong>अनिश्चित उपपद (Indefinite Articles - A, An):</strong> इनका अर्थ 'एक' या 'कोई भी' (any/one) होता है। ये केवल एकवचन गणनीय संज्ञा (Singular Countable Nouns) से पहले आते हैं।</li>
      <li><strong>निश्चित उपपद (Definite Article - The):</strong> इसका अर्थ 'वह खास / यह' (this/that/particular) होता है। यह एकवचन, बहुवचन और अगणनीय किसी भी संज्ञा से पहले आ सकता है जब संदर्भ निश्चित हो।</li>
    </ol>
  </div>
</div>""")

    # 3. Rule I: Choice between A and An (Sound vs Spelling)
    html.append("""<h2><span class="lang-en">2. Choice Between 'A' and 'An' (ध्वनि पर आधारित नियम)</span><span class="lang-hi">2. 'A' और 'An' का सही चुनाव (उच्चारण का नियम)</span></h2>

<div class="callout-box alert">
  <p><strong>⚠️ Golden SSC Principle:</strong><br/>
  'A' और 'An' का चुनाव शब्द की स्पेलिंग (Spelling) से नहीं, बल्कि उसके <strong>प्रथम ध्वनि / उच्चारण (Initial Sound)</strong> से निर्धारित होता है:<br/>
  • <strong>व्यंजन ध्वनि (Consonant Sound - क से ज्ञ तक):</strong> 'A' का प्रयोग होता है।<br/>
  • <strong>स्वर ध्वनि (Vowel Sound - अ, आ, इ, ई, ए, ऐ, ओ, औ):</strong> 'An' का प्रयोग होता है।</p>
</div>

<table class="notes-table">
  <thead>
    <tr>
      <th>Article</th>
      <th>Phonetic Condition (उच्चारण स्थिति)</th>
      <th>SSC High-Frequency Words List</th>
      <th>हिंदी उच्चारण एवं कारण</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td><strong>Use of 'A'</strong></td>
      <td>Words beginning with a Consonant Sound</td>
      <td><code>a boy, a child, a book, a student, a pen</code></td>
      <td>सामान्य व्यंजन ध्वनि।</td>
    </tr>
    <tr>
      <td><strong>Use of 'A' (Tricky!)</strong></td>
      <td>Words beginning with Vowels (E, U, O) but pronounced with a <strong>Consonant Sound ('य' / 'व')</strong></td>
      <td><code>a university, a European, a unique book, a uniform, a universal problem, a one-eyed man, a one-rupee note, a unit, a union</code></td>
      <td>• <em>University, European, Uniform:</em> शुरुआत स्वर (E/U) से है, पर उच्चारण <strong>'यू' (य)</strong> से शुरू होता है → <strong>A</strong>!<br/>• <em>One-eyed, One-rupee:</em> उच्चारण <strong>'वन' (व)</strong> से शुरू होता है → <strong>A</strong>!</td>
    </tr>
    <tr>
      <td><strong>Use of 'An'</strong></td>
      <td>Words beginning with a natural Vowel Sound</td>
      <td><code>an elephant, an apple, an umbrella, an orange, an idiot</code></td>
      <td>स्वाभाविक स्वर ध्वनि (अ, इ, उ, ऐ)।</td>
    </tr>
    <tr>
      <td><strong>Use of 'An' (Silent 'h')</strong></td>
      <td>Words beginning with a <strong>Mute (Silent) 'h'</strong> where the vowel is pronounced</td>
      <td><code>an hour, an heir, an heiress, an honest man, an honorary post, an honourable person, an hourly visit</code></td>
      <td>यहाँ 'H' मौन (silent) रहता है और उच्चारण स्वर <strong>'आ' / 'ऑ'</strong> से होता है: <em>an hour</em> (आवर), <em>an heir</em> (एयर = उत्तराधिकारी)।</td>
    </tr>
    <tr>
      <td><strong>Use of 'An' (Acronyms / Abbreviations)</strong></td>
      <td>Consonants pronounced with an initial <strong>vowel sound (ए, ऐ)</strong>: F, H, L, M, N, R, S, X</td>
      <td><code>an M.P., an M.L.A., an S.P., an S.D.O., an F.I.R., an X-ray, an LL.B. student, an N.C.C. officer, an R.T.C.</code></td>
      <td>• M = 'एम' (स्वर ध्वनि 'ए' से शुरू) → <strong>an M.P.</strong><br/>• S = 'एस' (स्वर ध्वनि 'ए' से शुरू) → <strong>an S.P.</strong><br/>• L = 'एल' → <strong>an LL.B.</strong><br/>• F = 'एफ़' → <strong>an F.I.R.</strong></td>
    </tr>
  </tbody>
</table>

<div class="pyq-box">
  <div class="pyq-title">🔥 Spotting Error Examples (A vs An)</div>
  <div class="pyq-body">
    <p>❌ <em>Incorrect:</em> He is <strong>a M.L.A.</strong> of our constituency.<br/>
    ✓ <em>Correct:</em> He is <strong>an M.L.A.</strong> of our constituency. [M = 'एम' → स्वर ध्वनि!]</p>
    
    <p>❌ <em>Incorrect:</em> It is <strong>an unique</strong> piece of art.<br/>
    ✓ <em>Correct:</em> It is <strong>a unique</strong> piece of art. [Unique = 'यूनिक' → व्यंजन ध्वनि!]</p>
    
    <p>❌ <em>Incorrect:</em> I met <strong>an European</strong> lady in Agra.<br/>
    ✓ <em>Correct:</em> I met <strong>a European</strong> lady in Agra. [European = 'यूरोपियन' → व्यंजन ध्वनि!]</p>
    
    <p>❌ <em>Incorrect:</em> He has been waiting for <strong>a hour</strong>.<br/>
    ✓ <em>Correct:</em> He has been waiting for <strong>an hour</strong>. [Hour = 'आवर' → Silent 'h'!]</p>
  </div>
</div>""")

    # 4. Rule II: Complete Uses of Indefinite Articles (A/An)
    html.append("""<h2><span class="lang-en">3. Complete Uses of Indefinite Articles (A / An)</span><span class="lang-hi">3. 'A' और 'An' के संपूर्ण विशिष्ट प्रयोग</span></h2>

<table class="notes-table">
  <thead>
    <tr>
      <th>Special Use / Condition</th>
      <th>Rule Explanation</th>
      <th>Example Sentences</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td><strong>1. Mentioned for First Time</strong></td>
      <td>जब किसी एकवचन गणनीय संज्ञा का पहली बार सामान्य रूप में उल्लेख हो।</td>
      <td>• A beggar came to my door.<br/>• Twelve inches make <strong>a foot</strong>.</td>
    </tr>
    <tr>
      <td><strong>2. Representative of a Class</strong></td>
      <td>जब कोई एकवचन संज्ञा अपनी पूरी जाति या प्रजाति का प्रतिनिधित्व करे (in the sense of 'any').</td>
      <td>• <strong>A cow</strong> is a useful animal. (गाय उपयोगी पशु है)<br/>• <strong>A son</strong> should be obedient. (बेटे को आज्ञाकारी होना चाहिए)<br/>• <strong>A rose</strong> is a sweet flower.</td>
    </tr>
    <tr>
      <td><strong>3. Proper Noun Made Common</strong></td>
      <td>जब किसी व्यक्तिवाचक संज्ञा का प्रयोग उसके विशिष्ट गुण/अवगुण को दर्शाने के लिए किया जाए।</td>
      <td>• He is <strong>a Shylock</strong>. (वह एक क्रूर कंजूस है)<br/>• He is <strong>a Vikramaditya</strong> known for fairness.</td>
    </tr>
    <tr>
      <td><strong>4. Price, Rate, Speed & Ratio</strong></td>
      <td>प्रति (per) की दर या गति दर्शाने के लिए।</td>
      <td>• Sugar sells at fifty rupees <strong>a kilo</strong>.<br/>• He drives at 80 kilometres <strong>an hour</strong>.<br/>• Brush your teeth twice <strong>a day</strong>.</td>
    </tr>
    <tr>
      <td><strong>5. Exclamations with 'What' / 'How'</strong></td>
      <td>विस्मयादिबोधक वाक्यों में एकवचन संज्ञा से पहले।</td>
      <td>• <strong>What a pretty girl!</strong><br/>• <strong>What a hot day!</strong><br/>• <strong>How fine a day!</strong> (विशेषण के बाद)</td>
    </tr>
    <tr>
      <td><strong>6. Position with Adverbs (so, too, such, quite)</strong></td>
      <td>• <strong>such / quite / rather / what + a/an + Noun</strong><br/>• <strong>so / too / as / how + Adjective + a/an + Noun</strong></td>
      <td>• He is <strong>such a nice</strong> man.<br/>• It is <strong>quite an interesting</strong> story.<br/>• She is <strong>too weak a</strong> student to pass.<br/>• She is <strong>as intelligent a</strong> student as her brother.</td>
    </tr>
    <tr>
      <td><strong>7. Verbs Used as Nouns</strong></td>
      <td>जब कोई क्रिया संज्ञा की तरह इस्तेमाल की जाए।</td>
      <td>• Go <strong>for a walk</strong> / for a swim / for a drive.<br/>• Have <strong>a talk</strong> / have a rest / have a headache.</td>
    </tr>
    <tr>
      <td><strong>8. Fixed Idiomatic Phrases</strong></td>
      <td>निश्चित मुहावरेदार वाक्यांशों में अनिवार्य रूप से 'a/an' लगता है।</td>
      <td><code>in a hurry, make a noise, tell a lie, take a fancy, feel a shame, a pity, at a loss, in a nutshell</code></td>
    </tr>
  </tbody>
</table>""")

    # 5. Rule III: Comprehensive Uses of Definite Article 'The'
    html.append("""<h2><span class="lang-en">4. Complete Uses of Definite Article 'The'</span><span class="lang-hi">4. निश्चित उपपद 'The' के संपूर्ण 26 नियम</span></h2>

<p><span class="lang-en">The Definite Article <strong>'The'</strong> is used to refer to a specific, unique, or previously identified noun. Study these high-frequency examination categories:</span>
<span class="lang-hi">निश्चित उपपद <strong>'The'</strong> का प्रयोग किसी खास, अद्वितीय या पूर्व-परिचित संज्ञा से पहले होता है। SSC में पूछे जाने वाले प्रमुख वर्ग:</span></p>

<table class="notes-table">
  <thead>
    <tr>
      <th>Category</th>
      <th>Where 'The' is Compulsory</th>
      <th>Critical Exceptions (जहाँ 'The' वर्जित है ❌)</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td><strong>1. Mountain Ranges & Island Groups</strong></td>
      <td>पर्वतमालाओं और द्वीपसमूहों के नाम से पहले:<br/><code>The Himalayas, The Alps, The Andes, The Andaman and Nicobar Islands</code></td>
      <td><strong>⚠️ Peaks & Single Islands:</strong> पर्वत चोटियों और अकेले द्वीपों के पहले 'The' नहीं लगता!<br/>❌ <em>The Mount Everest</em> → ✓ <strong>Mount Everest</strong><br/>❌ <em>The Aravali</em> → ✓ <strong>Aravali</strong> (पर्वतमाला नहीं, चोटी/श्रेणी रूप)</td>
    </tr>
    <tr>
      <td><strong>2. Water Bodies (Rivers, Seas, Oceans, Gulfs)</strong></td>
      <td><code>The Ganga, The Yamuna, The Nile, The Red Sea, The Indian Ocean, The Persian Gulf</code></td>
      <td>झील (Lake) के नाम से पहले 'the' नहीं लगता: <em>Lake Superior, Dal Lake</em>.</td>
    </tr>
    <tr>
      <td><strong>3. Unique Celestial Bodies</strong></td>
      <td>सृष्टि की अद्वितीय वस्तुओं से पहले:<br/><code>The Sun, The Moon, The Earth, The Sky, The Equator</code></td>
      <td>ग्रहों के नाम साधारणतः बिना article के आते हैं: <em>Mars, Venus, Jupiter</em>.</td>
    </tr>
    <tr>
      <td><strong>4. Holy Scriptures & Newspapers</strong></td>
      <td><code>The Gita, The Ramayana, The Quran, The Bible, The Times of India, The Hindu</code></td>
      <td>यदि लेखक/कवि का नाम जुड़ा हो, तो 'the' नहीं लगता:<br/>❌ <em>The Valmiki's Ramayana</em> → ✓ <strong>Valmiki's Ramayana</strong>.</td>
    </tr>
    <tr>
      <td><strong>5. Descriptive Geographical Names</strong></td>
      <td>संघ, गणतंत्र या बहुवचन वाले देशों के नाम:<br/><code>The USA, The UK, The USSR, The United Arab Emirates, The Netherlands, The Sudan, The Philippines</code></td>
      <td>साधारण देशों के नाम से पहले नहीं लगता: <em>India, China, America, France</em>.</td>
    </tr>
    <tr>
      <td><strong>6. Historical Monuments & Dynasties</strong></td>
      <td><code>The Taj Mahal, The Red Fort, The Gupta Dynasty, The Middle Ages, The French Revolution</code></td>
      <td>निजी भवनों के नाम से पहले नहीं लगता।</td>
    </tr>
    <tr>
      <td><strong>7. Trains, Ships & Aeroplanes</strong></td>
      <td><code>The Rajdhani Express, The Titanic, The Shatabdi</code></td>
      <td>वाहन निर्माता के नाम से पहले नहीं (Boeing 747).</td>
    </tr>
    <tr>
      <td><strong>8. Adjective as a Plural Noun</strong></td>
      <td>जब Adjective पूरे वर्ग का बोध कराए:<br/><code>The rich</code> (अमीर लोग), <code>The poor</code> (गरीब लोग), <code>The blind</code>, <code>The elderly</code></td>
      <td>इनके साथ कभी '-s' नहीं लगता (<em>The poors</em> ❌) और हमेशा Plural Verb आती है!</td>
    </tr>
    <tr>
      <td><strong>9. Musical Instruments</strong></td>
      <td>वाद्य-यंत्र बजाने के संदर्भ में:<br/>• <em>He plays <strong>the flute</strong>.</em><br/>• <em>She is fond of playing <strong>the harmonium</strong>.</em></td>
      <td>यदि केवल वस्तु के रूप में खरीदा जाए: <em>He bought a flute</em> (यहाँ 'a' आएगा).</td>
    </tr>
    <tr>
      <td><strong>10. Double Comparatives (जितना... उतना)</strong></td>
      <td>समानांतर तुलना में दोनों तरफ 'The' आता है:<br/>• <strong>The higher</strong> you go, <strong>the colder</strong> it is.<br/>• <strong>The sooner</strong>, <strong>the better</strong>.</td>
      <td>एक तरफ भी 'The' छोड़ना एरर है!</td>
    </tr>
    <tr>
      <td><strong>11. Choice Between Two (दो में से चुनाव)</strong></td>
      <td>जब दो में से एक का चुनाव हो (Comparative Degree + of the two):<br/>• She is <strong>the weaker of the two</strong> sisters.<br/>• Who is <strong>the more beautiful of the two</strong> girls?</td>
      <td>सामान्य तुलना में 'than' के साथ 'the' नहीं लगता: <em>She is weaker than her sister</em>.</td>
    </tr>
    <tr>
      <td><strong>12. Metaphorical Comparison of Proper Nouns</strong></td>
      <td>जब किसी व्यक्ति को किसी ऐतिहासिक हस्ती की उपमा दी जाए:<br/>• Kalidas is <strong>the Shakespeare</strong> of India.<br/>• Surdas is <strong>the Milton</strong> of India.</td>
      <td>यहाँ 'the' का अर्थ उपमा या सर्वोच्च प्रतिष्ठा है।</td>
    </tr>
    <tr>
      <td><strong>13. Direction & Physical Positions</strong></td>
      <td>• <strong>the East</strong>, <strong>the West</strong>, <strong>the North</strong><br/>• <strong>the top</strong>, <strong>the bottom</strong>, <strong>the centre</strong>, <strong>the back</strong></td>
      <td>यदि दिशा के साथ राज्य/स्थान का नाम जुड़ा हो तो नहीं लगता: <em>Northern India, West Bengal</em>.</td>
    </tr>
    <tr>
      <td><strong>14. Rates & Units of Measurement</strong></td>
      <td>माप की इकाई बताने के लिए:<br/>• Cloth is sold <strong>by the metre</strong>.<br/>• Eggs are sold <strong>by the dozen</strong>.</td>
      <td>लेकिन दर बताने के लिए: <em>Fifty rupees a dozen</em>.</td>
    </tr>
    <tr>
      <td><strong>15. Inventions & Media</strong></td>
      <td>आविष्कार के रूप में:<br/><code>The telephone, The wheel, The radio</code></td>
      <td><strong>⚠️ Television Trap:</strong> आविष्कार के रूप में 'The television'; लेकिन टीवी सेट देखने के अर्थ में 'the' नहीं लगता: <em>He was watching television</em> ✓.</td>
    </tr>
    <tr>
      <td><strong>16. Organs of Government & Armed Forces</strong></td>
      <td><code>The Judiciary, The Legislature, The Army, The Air Force, The Police</code></td>
      <td>संसद के नाम से पहले 'the' नहीं लगता: <em>Parliament</em> (The Parliament ❌).</td>
    </tr>
  </tbody>
</table>""")

    # 6. Rule IV: Omission of Articles (Where Articles are FORBIDDEN)
    html.append("""<h2><span class="lang-en">5. Omission of Articles (Zero Article - कहाँ आर्टिकल नहीं लगेगा)</span><span class="lang-hi">5. आर्टिकल का निषेध (Zero Article के महत्वपूर्ण नियम)</span></h2>

<p><span class="lang-en">In SSC error-spotting, questions on <strong>superfluous articles</strong> (inserting 'the' where it should not be) are just as frequent as missing articles. Memorize these rules:</span>
<span class="lang-hi">कहाँ आर्टिकल <strong>नहीं</strong> लगेगा, यह जानना सबसे अधिक महत्वपूर्ण है क्योंकि अनावश्यक 'the' लगाना SSC का सबसे पसंदीदा एरर है:</span></p>

<h3>(A) Primary Purpose of School, College, Hospital, Temple, Prison, Bed</h3>
<div class="callout-box alert">
  <p><strong>⚠️ Core SSC Concept (प्राथमिक उद्देश्य बनाम सामान्य दौरा):</strong><br/>
  जब <code>school, college, university, church, temple, mosque, hospital, prison, court, bed, sea</code> का प्रयोग उनके <strong>मूल उद्देश्य (Primary Purpose)</strong> के लिए हो (जैसे पढ़ने के लिए स्कूल, इलाज के लिए अस्पताल, पूजा के लिए मंदिर, सोने के लिए बिस्तर, सज़ा काटने के लिए जेल), तो इनके पहले <strong>कोई आर्टिकल नहीं लगता</strong>!<br/>
  • परंतु यदि कोई व्यक्ति किसी <strong>अन्य कार्य (मुलाकात, मरम्मत, दौरा)</strong> के लिए जाए, तो <strong>'The'</strong> का प्रयोग अनिवार्य है:</p>
  
  <table class="notes-table" style="margin:10px 0 0 0;">
    <thead>
      <tr>
        <th>Primary Purpose (Zero Article - No 'The')</th>
        <th>Secondary Purpose (Building Visit - Use 'The')</th>
      </tr>
    </thead>
    <tbody>
      <tr>
        <td>• I go to <strong>school</strong> daily to study. (पढ़ने हेतु)</td>
        <td>• My father went to <strong>the school</strong> to pay fees. (फीस जमा करने)</td>
      </tr>
      <tr>
        <td>• The patient was admitted to <strong>hospital</strong>. (इलाज हेतु)</td>
        <td>• I went to <strong>the hospital</strong> to see my injured friend. (मिलने हेतु)</td>
      </tr>
      <tr>
        <td>• We go to <strong>temple</strong> on Mondays. (पूजा करने हेतु)</td>
        <td>• The thief was hiding behind <strong>the temple</strong>. (छिपाव स्थल)</td>
      </tr>
      <tr>
        <td>• He was sent to <strong>prison</strong> for murder. (कैदी के रूप में)</td>
        <td>• The lawyer visited <strong>the prison</strong> to meet his client.</td>
      </tr>
      <tr>
        <td>• I go to <strong>bed</strong> at 10 PM. (सोने के लिए)</td>
        <td>• The cat jumped onto <strong>the bed</strong>. (फर्नीचर वस्तु)</td>
      </tr>
    </tbody>
  </table>
</div>

<h3>(B) Other Major Omission Rules</h3>
<table class="notes-table">
  <thead>
    <tr>
      <th>Category</th>
      <th>Zero Article Rule (बिना आर्टिकल)</th>
      <th>Exception / With 'The'</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td><strong>1. Material Nouns in General</strong></td>
      <td>सामान्य अर्थ में धातुओं व पदार्थों से पहले नहीं लगता:<br/>• <strong>Gold</strong> is a precious metal.<br/>• <strong>Tea</strong> grows in India.</td>
      <td>विशिष्ट संदर्भ में 'The' लगता है:<br/>• <strong>The gold of South Africa</strong> is pure.<br/>• <strong>The tea of Assam</strong> is famous.</td>
    </tr>
    <tr>
      <td><strong>2. Abstract Nouns in General</strong></td>
      <td>गुण व भाववाचक संज्ञा से पहले नहीं लगता:<br/>• <strong>Honesty</strong> is the best policy.<br/>• <strong>Love</strong> is a divine emotion.</td>
      <td>विशिष्ट व्यक्ति के गुण हेतु 'The' लगता है:<br/>• <strong>The honesty of my father</strong> is unquestioned.</td>
    </tr>
    <tr>
      <td><strong>3. Languages vs Nationalities</strong></td>
      <td>भाषा के नाम से पहले आर्टिकल नहीं लगता:<br/>• He speaks <strong>English</strong> fluently.<br/>• <strong>Russian</strong> is difficult.</td>
      <td>यदि 'the' लग जाए तो वह <strong>वहाँ के लोगों (नागरिकों)</strong> को दर्शाता है:<br/>• <strong>The English</strong> (अंग्रेज लोग) defeated the French.</td>
    </tr>
    <tr>
      <td><strong>4. Modes of Transport with 'By'</strong></td>
      <td>जब 'by' के साथ वाहन का नाम आए:<br/>• by bus, by train, by car, by air, by sea</td>
      <td>❌ <em>by the bus / by a car</em> (सख्त अशुद्ध!)<br/>(लेकिन 'in a car' या 'on the bus' सही है).</td>
    </tr>
    <tr>
      <td><strong>5. Meals of the Day</strong></td>
      <td>नियमित भोजन के नाम से पहले नहीं लगता:<br/>• I take <strong>breakfast</strong> at 8 AM.<br/>• What did you have for <strong>dinner</strong>?</td>
      <td>यदि विशेषण लगा हो या औपचारिक दावत हो:<br/>• They gave us <strong>a good breakfast</strong>.<br/>• <strong>The dinner</strong> hosted by the President.</td>
    </tr>
    <tr>
      <td><strong>6. Human Race (Man, Woman, Mankind)</strong></td>
      <td>मानव जाति के व्यापक अर्थ में कोई आर्टिकल नहीं:<br/>• <strong>Man is mortal.</strong> (मनुष्य नश्वर है)</td>
      <td>❌ <em>The man is mortal</em> (अशुद्ध!).</td>
    </tr>
  </tbody>
</table>""")

    # 7. Rule V: Repetition of Articles
    html.append("""<h2><span class="lang-en">6. Repetition of Articles (आर्टिकल का दोहराव)</span><span class="lang-hi">6. आर्टिकल दोहराव के नियम (Joint vs Separate Entities)</span></h2>

<div class="note-intro-card">
  <p><span class="lang-en">Whether an article is repeated before connected nouns determines whether we are speaking about <strong>One Single Entity</strong> or <strong>Two Separate Entities</strong>:</span>
  <span class="lang-hi">जब दो पद या विशेषण 'and' से जुड़े हों, तो आर्टिकल एक बार लगेगा या दो बार—यह तय करता है कि व्यक्ति/वस्तु एक है या दो:</span></p>
</div>

<table class="notes-table">
  <thead>
    <tr>
      <th>Construction</th>
      <th>Meaning / Entity Count</th>
      <th>Verb Used</th>
      <th>Example Sentence</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td><strong>Article before FIRST noun only</strong></td>
      <td><strong>One single person</strong> holding two posts</td>
      <td><strong>Singular Verb</strong></td>
      <td><strong>The Prime Minister and President</strong> of the party <strong>is</strong> visiting today.<br/>[एक ही व्यक्ति जो प्रधानमंत्री भी है और पार्टी अध्यक्ष भी!]</td>
    </tr>
    <tr>
      <td><strong>Article before BOTH nouns</strong></td>
      <td><strong>Two separate persons</strong> holding two posts</td>
      <td><strong>Plural Verb</strong></td>
      <td><strong>The Prime Minister and the President</strong> <strong>are</strong> visiting today.<br/>[दो अलग-अलग व्यक्ति: एक पीएम और दूसरे राष्ट्रपति!]</td>
    </tr>
    <tr>
      <td><strong>Two Adjectives: A + Adj1 + and + Adj2</strong></td>
      <td><strong>One single object</strong> having two colors</td>
      <td><strong>Singular</strong></td>
      <td>She bought <strong>a black and white</strong> saree.<br/>[एक ही साड़ी जो काली और सफेद दोनों है।]</td>
    </tr>
    <tr>
      <td><strong>Two Adjectives: A + Adj1 + and + a + Adj2</strong></td>
      <td><strong>Two separate objects</strong></td>
      <td><strong>Plural</strong></td>
      <td>She bought <strong>a black and a white</strong> saree.<br/>[दो अलग साड़ियाँ: एक काली और एक सफेद!]</td>
    </tr>
    <tr>
      <td><strong>Ordinals: The + Ord1 + and + the + Ord2</strong></td>
      <td>Two articles → <strong>Singular Noun</strong></td>
      <td><strong>Plural Verb</strong></td>
      <td><strong>The first and the second chapter are</strong> difficult.</td>
    </tr>
    <tr>
      <td><strong>Ordinals: The + Ord1 + and + Ord2</strong></td>
      <td>One article → <strong>Plural Noun</strong></td>
      <td><strong>Plural Verb</strong></td>
      <td><strong>The first and second chapters are</strong> difficult.</td>
    </tr>
  </tbody>
</table>""")

    # 8. Solved Shift PYQ Practice Set
    html.append("""<h2><span class="lang-en">7. SSC CGL/CHSL Solved Shift Questions (PYQ Spotting Errors)</span><span class="lang-hi">7. विगत वर्षों के हल प्रश्न (विस्तृत व्याख्या सहित)</span></h2>

<div class="pyq-box">
  <div class="pyq-title">Q1. SSC CGL Tier-1 Shift Question</div>
  <div class="pyq-body">
    <p><strong>Spot the error in the sentence:</strong><br/>
    <em>"The higher we climb / up the mountain / colder we feel / No error."</em></p>
    <p><strong>Answer & Detailed Explanation:</strong><br/>
    👉 <strong>Error is in Part 3.</strong> Parallel comparison (समानांतर तुलना) में दोनों तरफ 'The + Comparative Degree' आता है। अतः 'colder' से पहले <strong>the</strong> अनिवार्य है।<br/>
    ✓ <strong>Correct Sentence:</strong> <em>"The higher we climb up the mountain, <strong>the colder</strong> we feel."</em></p>
  </div>
</div>

<div class="pyq-box">
  <div class="pyq-title">Q2. SSC CHSL Tier-1 Shift Question</div>
  <div class="pyq-body">
    <p><strong>Spot the error in the sentence:</strong><br/>
    <em>"My elder sister / went to the hospital / to undergo a surgery / No error."</em></p>
    <p><strong>Answer & Detailed Explanation:</strong><br/>
    👉 <strong>Error is in Part 2.</strong> जब कोई व्यक्ति अस्पताल में इलाज या सर्जरी कराने (Primary Purpose) जाता है, तो 'hospital' के पहले 'the' नहीं लगता।<br/>
    ✓ <strong>Correct Sentence:</strong> <em>"My elder sister went to <strong>hospital</strong> to undergo a surgery."</em></p>
  </div>
</div>

<div class="pyq-box">
  <div class="pyq-title">Q3. SSC CPO Tier-1 Shift Question</div>
  <div class="pyq-body">
    <p><strong>Spot the error in the sentence:</strong><br/>
    <em>"He travels / to office daily / by the bus / No error."</em></p>
    <p><strong>Answer & Detailed Explanation:</strong><br/>
    👉 <strong>Error is in Part 3.</strong> साधन बताने वाले 'by' के बाद सीधे वाहन का नाम आता है, बीच में कोई आर्टिकल नहीं आता (by bus, by train, by car).<br/>
    ✓ <strong>Correct Sentence:</strong> <em>"He travels to office daily <strong>by bus</strong>."</em></p>
  </div>
</div>

<div class="pyq-box">
  <div class="pyq-title">Q4. SSC CGL Tier-2 Mains Question</div>
  <div class="pyq-body">
    <p><strong>Spot the error in the sentence:</strong><br/>
    <em>"The Mount Everest is / the highest peak in the world / situated in the Himalayas / No error."</em></p>
    <p><strong>Answer & Detailed Explanation:</strong><br/>
    👉 <strong>Error is in Part 1.</strong> पर्वत चोटियों (Mountain Peaks) के नाम से पहले 'the' नहीं लगता। 'The' केवल पर्वतमालाओं (Ranges) से पहले लगता है जैसे 'The Himalayas'।<br/>
    ✓ <strong>Correct Sentence:</strong> <em>"<strong>Mount Everest</strong> is the highest peak in the world situated in the Himalayas."</em></p>
  </div>
</div>""")

    # 9. FAQs
    html.append("""<h2><span class="lang-en">8. Frequently Asked Questions (FAQs)</span><span class="lang-hi">8. अक्सर पूछे जाने वाले प्रश्न</span></h2>

<div class="lang-card-en" style="margin-bottom:15px;">
  <p><strong>Q1. Why do we say 'a university' but 'an umbrella'?</strong><br/>
  <strong>Ans:</strong> 'University' begins with a consonant sound ('yu' - य), so it takes 'a'. 'Umbrella' begins with a vowel sound ('uh' - अ), so it takes 'an'.</p>
</div>

<div class="lang-card-en" style="margin-bottom:15px;">
  <p><strong>Q2. When do we use 'The' before names of countries?</strong><br/>
  <strong>Ans:</strong> 'The' is used only before countries that contain words like <em>Kingdom, States, Republic, Union</em> (e.g. The USA, The UK, The UAE) or have plural geographical names (e.g. The Netherlands, The Philippines).</p>
</div>

<div class="lang-card-en" style="margin-bottom:15px;">
  <p><strong>Q3. Why does 'school' not take 'the' in 'I go to school'?</strong><br/>
  <strong>Ans:</strong> When institutions like school, college, hospital, temple, and prison are visited for their fundamental purpose (study, prayer, medical care), no article is used.</p>
</div>""")

    # 10. CTA Card
    html.append("""<div style="background: linear-gradient(135deg, #1e3a8a, #2563eb); color: #ffffff; padding: 24px; border-radius: 14px; margin: 30px 0; text-align: center;">
  <h3 style="margin: 0 0 8px 0; color: #ffffff; font-size: 19px; font-weight: 800;">Master Articles Error Spotting in Live CBT Mode</h3>
  <p style="margin: 0 0 16px 0; color: #dbeafe; font-size: 14px;">Attempt authentic SSC shift questions with instant solutions, detailed analysis, and scorecards.</p>
  <a href="/papers" style="display: inline-block; background: #ffffff; color: #1e3a8a; font-weight: 800; padding: 11px 22px; border-radius: 8px; text-decoration: none; font-size: 14px;">
    Attempt SSC PYQ Shifts Now →
  </a>
</div>""")

    return "\n\n".join(html)

if __name__ == "__main__":
    content = build_articles_content()
    print("Articles content generated successfully!")
    print("Total characters:", len(content))
    print("Total words:", len(content.split()))
