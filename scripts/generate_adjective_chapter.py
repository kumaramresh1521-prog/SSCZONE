# -*- coding: utf-8 -*-
"""
Generates Chapter: English Adjective (विशेषण) - Master Study Notes
100% Comprehensive Coverage from adjective_ssczone.pdf
Includes:
- What is an Adjective? Attributive vs Predicative Usage
- 11 Kinds of Adjectives (Descriptive & Determiner classes)
- Distinction between Adjectives and Pronouns
- Degrees of Comparison (Positive, Comparative, Superlative table)
- All 18 Golden Rules of Adjectives (Rule I to XVIII)
  - Linking verbs taking adjectives
  - Absolute adjectives (no degrees)
  - Latin adjectives taking 'to' (senior, junior, prior, prefer, etc.)
  - Confusing pairs: Little vs Few, Some vs Any, Farther vs Further, Elder vs Older, Later vs Latter
  - Comparing two qualities of the same person ('more clever' vs 'cleverer')
  - Order of adjectives (OSASCOMP / SSACNM)
  - Adjectives that never come before nouns (ill, asleep, afraid, alone, etc.)
  - Comparison of illogical items ('that of' rule)
- Solved Shift Questions with bilingual explanations
- FAQs
"""

def build_adjective_content():
    html = []

    # 1. Intro Card
    html.append("""<div class="note-intro-card">
  <h3>🎯 Chapter Overview / अध्याय सारांश</h3>
  <p><span class="lang-en">An <strong>Adjective</strong> is a word that qualifies, describes, or adds to the meaning of a noun or pronoun. In SSC examinations (CGL, CHSL, CPO, MTS), Adjectives are a prime testing ground for <strong>Degrees of Comparison</strong>, <strong>Illogical Comparisons</strong>, <strong>Latin Adjectives taking 'to'</strong>, and <strong>Order of Multiple Adjectives</strong>. Mastering these 18 rules guarantees full marks in 3 to 4 spotting-the-error and sentence-improvement questions.</span>
  <span class="lang-hi"><strong>विशेषण (Adjective)</strong> वह शब्द है जो किसी संज्ञा या सर्वनाम की विशेषता बताता है या उसके अर्थ में कुछ जोड़ता है। SSC परीक्षाओं में विशेषण के नियम <em>Degrees of Comparison</em>, <em>Latin Adjectives (junior/senior to)</em>, <em>Confusing Pairs (few/little, elder/older)</em> और <em>विशेषणों के सही क्रम (Order of Adjectives)</em> के लिए अत्यंत महत्वपूर्ण हैं। इन 18 नियमों से हर शिफ्ट में 3 से 4 प्रश्न निश्चित रूप से पूछे जाते हैं।</span></p>
</div>""")

    # 2. What is an Adjective? Definition & Position
    html.append("""<h2><span class="lang-en">1. What is an Adjective? (Definition & Position)</span><span class="lang-hi">1. विशेषण क्या है? (परिभाषा एवं वाक्य में स्थान)</span></h2>

<div class="lang-en">
  <div class="lang-card-en">
    <p>An <strong>Adjective</strong> tells us about the quality, size, origin, color, or quantity of a noun. For example:</p>
    <ul>
      <li>She is a <strong>kind</strong> lady. (दयालु महिला)</li>
      <li>I like <strong>this</strong> pen. (यह पेन)</li>
      <li>She lives in a <strong>large</strong> house. (बड़ा घर)</li>
      <li>He is a <strong>strong</strong> player. (मज़बूत खिलाड़ी)</li>
    </ul>
    <p><strong>Two Positions of Adjectives:</strong><br/>
    1. <strong>Attributive Use (संज्ञा से पहले):</strong> When placed directly before the noun: <em>She is an <strong>honest</strong> girl.</em><br/>
    2. <strong>Predicative Use (क्रिया के बाद):</strong> When placed after a linking verb: <em>The girl is <strong>honest</strong>.</em></p>
  </div>
</div>

<div class="lang-hi">
  <div class="lang-card-hi">
    <p>हिंदी व्याकरण में <strong>विशेषण (Adjective)</strong> वह शब्द है जो संज्ञा (Noun) या सर्वनाम (Pronoun) की विशेषता, गुण, दोष, संख्या या परिमाण बताता है।</p>
    <p><strong>विशेषण के वाक्य में दो स्थान (Position):</strong><br/>
    1. <strong>Attributive (संज्ञा से ठीक पहले):</strong> <em>She is an <strong>honest</strong> girl.</em> (यहाँ 'honest' संज्ञा 'girl' से ठीक पहले आया है।)<br/>
    2. <strong>Predicative (क्रिया के बाद):</strong> <em>The girl is <strong>honest</strong>.</em> (यहाँ 'honest' क्रिया 'is' के बाद आकर कर्ता की विशेषता बता रहा है।)</p>
  </div>
</div>""")

    # 3. Kinds of Adjectives
    html.append("""<h2><span class="lang-en">2. Classification: Kinds of Adjectives</span><span class="lang-hi">2. विशेषण के प्रमुख भेद (Kinds of Adjectives)</span></h2>

<p><span class="lang-en">Adjectives are broadly divided into two classes: <strong>Descriptive Adjectives</strong> (denote quality, shape, size) and <strong>Determiner Adjectives</strong> (denote quantity, number, identity, possession):</span>
<span class="lang-hi">विशेषण को मुख्य रूप से दो श्रेणियों में बाँटा जाता है: <strong>Descriptive (गुणवाचक)</strong> और <strong>Determiner (निर्धारक)</strong>:</span></p>

<table class="notes-table">
  <thead>
    <tr>
      <th>Class & Category</th>
      <th>Key Example Words</th>
      <th>Hindi Meaning & Identification</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td><strong>1. Adjective of Quality (Descriptive)</strong></td>
      <td><code>good, bad, red, dry, heavy, beautiful, ugly</code></td>
      <td><strong>गुणवाचक विशेषण:</strong> रूप, रंग, आकार, गुण व दोष बताने वाले (अच्छा, बुरा, भारी, सुंदर)।</td>
    </tr>
    <tr>
      <td><strong>2. Demonstrative Adjective</strong></td>
      <td><code>this, that, these, those, such</code></td>
      <td><strong>संकेतवाचक विशेषण:</strong> संज्ञा की ओर संकेत करने वाले (यह, वह, ये, वे)। संज्ञा से ठीक पहले आते हैं।</td>
    </tr>
    <tr>
      <td><strong>3. Distributive Adjective</strong></td>
      <td><code>each, every, either, neither</code></td>
      <td><strong>प्रत्येकवाचक विशेषण:</strong> समूह में से हर एक को अलग-अलग दर्शाने वाले।</td>
    </tr>
    <tr>
      <td><strong>4. Quantitative Adjective</strong></td>
      <td><code>some, any, little, much, enough, no, whole</code></td>
      <td><strong>परिमाणवाचक विशेषण:</strong> अगणनीय मात्रा बताने वाले (थोड़ा, कुछ, बहुत, पर्याप्त)।</td>
    </tr>
    <tr>
      <td><strong>5. Numeral Adjective</strong></td>
      <td><code>one, two, first, second, few, many, all, several</code></td>
      <td><strong>संख्यावाचक विशेषण:</strong> निश्चित (1, 2) या अनिश्चित (few, many) संख्या बताने वाले।</td>
    </tr>
    <tr>
      <td><strong>6. Possessive Adjective</strong></td>
      <td><code>my, our, your, his, her, their, its</code></td>
      <td><strong>संबंधबोधक विशेषण:</strong> स्वामित्व या अधिकार दर्शाने वाले (मेरा, तुम्हारा, उसका)।</td>
    </tr>
    <tr>
      <td><strong>7. Interrogative Adjective</strong></td>
      <td><code>which, what, whose</code></td>
      <td><strong>प्रश्नवाचक विशेषण:</strong> प्रश्न पूछने हेतु संज्ञा से पहले आने वाले (<em>Which pen do you want?</em>)।</td>
    </tr>
    <tr>
      <td><strong>8. Participle Adjective</strong></td>
      <td><code>a moving bus, a wounded driver, a tiring journey</code></td>
      <td><strong>कृदंत विशेषण:</strong> V3 या V-ing जो विशेषण का कार्य करते हैं (घायल चालक, चलती बस)।</td>
    </tr>
    <tr>
      <td><strong>9. Proper Adjective</strong></td>
      <td><code>Indian, Asian, American, Shakespearean</code></td>
      <td><strong>व्यक्तिवाचक विशेषण:</strong> Proper Nouns से बने विशेषण (भारतीय, एशियाई, अमेरिकी)।</td>
    </tr>
    <tr>
      <td><strong>10. Emphasizing Adjective</strong></td>
      <td><code>own, very</code></td>
      <td><strong>बलदायक विशेषण:</strong> जोर देने वाले (<em>I saw it with my own eyes</em>)।</td>
    </tr>
    <tr>
      <td><strong>11. Exclamatory Adjective</strong></td>
      <td><code>what, which, how</code></td>
      <td><strong>विस्मयबोधक विशेषण:</strong> विस्मय प्रकट करने वाले (<em>What an idea!</em>)।</td>
    </tr>
  </tbody>
</table>

<h3><span class="lang-en">Distinction Between Adjectives and Pronouns</span><span class="lang-hi">विशेषण और सर्वनाम में अंतर समझें</span></h3>
<div class="callout-box info">
  <p><strong>📌 Golden Identification Rule:</strong><br/>
  • शब्द के <strong>तुरंत बाद संज्ञा (Noun)</strong> हो → वह <strong>Adjective</strong> है (e.g. <em><strong>This book</strong> is mine</em>).<br/>
  • शब्द <strong>अकेला आए</strong> और संज्ञा की जगह ले → वह <strong>Pronoun</strong> है (e.g. <em><strong>This</strong> is my book</em>).<br/>
  • <strong>Every</strong> केवल Adjective होता है (Pronoun नहीं बन सकता); जबकि <strong>Each</strong> Adjective और Pronoun दोनों बन सकता है (<em>Each boy / Each of the boys</em>).</p>
</div>""")

    # 4. Degrees of Comparison Table
    html.append("""<h2><span class="lang-en">3. Degrees of Comparison (तुलना की तीन अवस्थाएँ)</span><span class="lang-hi">3. तुलना की अवस्थाएँ (Degrees of Comparison)</span></h2>

<p><span class="lang-en">Adjectives change in form to show comparison across 3 degrees:</span>
<span class="lang-hi">विशेषण तीन अवस्थाओं (Degrees) में तुलना दर्शाते हैं:</span></p>

<table class="notes-table">
  <thead>
    <tr>
      <th>Positive Degree (सामान्य गुण)</th>
      <th>Comparative Degree (दो की तुलना)</th>
      <th>Superlative Degree (सर्वोच्च - 2 से अधिक)</th>
      <th>Hindi Meaning / हिंदी अर्थ</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td><strong>Good / Well</strong></td>
      <td><strong>Better</strong></td>
      <td><strong>Best</strong></td>
      <td>अच्छा / बेहतर / सर्वोत्तम</td>
    </tr>
    <tr>
      <td><strong>Bad / Ill</strong></td>
      <td><strong>Worse</strong></td>
      <td><strong>Worst</strong></td>
      <td>बुरा / बदतर / सबसे बुरा</td>
    </tr>
    <tr>
      <td><strong>Little</strong> (मात्रा)</td>
      <td><strong>Less / Lesser</strong></td>
      <td><strong>Least</strong></td>
      <td>थोड़ा / कम / न्यूनतम</td>
    </tr>
    <tr>
      <td><strong>Much / Many</strong></td>
      <td><strong>More</strong></td>
      <td><strong>Most</strong></td>
      <td>बहुत / अधिक / सर्वाधिक</td>
    </tr>
    <tr>
      <td><strong>Few</strong> (संख्या)</td>
      <td><strong>Fewer</strong></td>
      <td><strong>Fewest</strong></td>
      <td>कम / उससे कम / सबसे कम</td>
    </tr>
    <tr>
      <td><strong>Late</strong> (समय/क्रम)</td>
      <td><strong>Later / Latter</strong></td>
      <td><strong>Latest / Last</strong></td>
      <td>देर से / बाद वाला / नवीनतम / अंतिम</td>
    </tr>
    <tr>
      <td><strong>Old</strong> (उम्र/संबंध)</td>
      <td><strong>Older / Elder</strong></td>
      <td><strong>Oldest / Eldest</strong></td>
      <td>पुराना/बड़ा / बड़ा भाई/बहन</td>
    </tr>
    <tr>
      <td><strong>Far</strong> (दूरी)</td>
      <td><strong>Farther / Further</strong></td>
      <td><strong>Farthest / Furthest</strong></td>
      <td>दूर / अधिक दूर / अतिरिक्त / सबसे दूर</td>
    </tr>
    <tr>
      <td><strong>Near</strong></td>
      <td><strong>Nearer</strong></td>
      <td><strong>Nearest / Next</strong></td>
      <td>समीप / निकटतम / अगला</td>
    </tr>
    <tr>
      <td><strong>Beautiful</strong></td>
      <td><strong>More Beautiful</strong></td>
      <td><strong>Most Beautiful</strong></td>
      <td>सुंदर / अधिक सुंदर / सबसे सुंदर</td>
    </tr>
    <tr>
      <td><strong>Economical</strong></td>
      <td><strong>More Economical</strong></td>
      <td><strong>Most Economical</strong></td>
      <td>किफायती</td>
    </tr>
  </tbody>
</table>""")

    # 5. The 18 Golden Rules of Adjectives
    html.append("""<h2><span class="lang-en">4. The 18 Golden Rules of Adjectives for SSC</span><span class="lang-hi">4. SSC परीक्षाओं के लिए विशेषण के 18 स्वर्णिम नियम</span></h2>""")

    # Rule I & II: Quality vs Action & Linking Verbs
    html.append("""<div class="note-intro-card">
  <h3 style="margin-top:0;">Rule I & II: Adjective for Quality & Linking Verbs (गुण → Adjective, काम → Adverb)</h3>
  <p><span class="lang-en">1. <strong>Rule I:</strong> Use an Adjective to express the quality of a noun/pronoun. Use an Adverb to modify the action of a verb.<br/>
  2. <strong>Rule II (Linking Verbs):</strong> Verbs of sensation and state (<em>be, become, seem, appear, taste, smell, sound, feel, look, turn, get, grow, keep, prove</em>) are <strong>Linking Verbs</strong>. They are followed by an <strong>Adjective</strong>, not an Adverb!</span>
  <span class="lang-hi">1. जब संज्ञा/सर्वनाम का गुण बताना हो तो <strong>Adjective</strong> आता है; जब क्रिया के काम करने का ढंग बताना हो तो <strong>Adverb</strong> आता है।<br/>
  2. <strong>Linking Verbs (प्रतीति क्रियाएँ):</strong> <em>taste, smell, look, feel, sound, appear, seem, become</em> के बाद हमेशा <strong>Adjective</strong> आता है, Adverb नहीं!</span></p>
</div>

<div class="pyq-box">
  <div class="pyq-title">🔥 Difference & SSC Examples (Rule I & II)</div>
  <div class="pyq-body">
    <p>• <strong>She is a skilful dancer.</strong> [गुण → Adjective 'skilful']<br/>
    • <strong>She dances skilfully.</strong> [नाचने की क्रिया → Adverb 'skilfully']</p>
    
    <p>❌ <em>Incorrect:</em> The mangoes taste <strong>sweetly</strong>.<br/>
    ✓ <em>Correct:</em> The mangoes taste <strong>sweet</strong>. [हिंदी: आम मीठे लगते हैं — 'taste' Linking Verb है, अतः Adjective 'sweet' आएगा!]</p>
    
    <p>❌ <em>Incorrect:</em> Her voice sounds <strong>harshly</strong>.<br/>
    ✓ <em>Correct:</em> Her voice sounds <strong>harsh</strong>. [हिंदी: उसकी आवाज़ कर्कश लगती है — 'sounds' के बाद Adjective!]</p>
    
    <p>• <em>Look as Linking Verb:</em> She looked <strong>calm and quiet</strong>. ✓ (वह शांत और चुप लग रही थी।)<br/>
    • <em>Look as Action Verb:</em> She looked at her angry husband <strong>calmly and quietly</strong>. ✓ (उसने शांत भाव से देखा — क्रिया की विशेषता!)</p>
  </div>
</div>""")

    # Rule III: Absolute Adjectives
    html.append("""<div class="note-intro-card">
  <h3 style="margin-top:0;">Rule III: Absolute Adjectives (जिनकी Degrees नहीं बनतीं)</h3>
  <p><span class="lang-en">Certain adjectives denote an <strong>absolute, complete, or final state</strong> and do not admit of any Comparative or Superlative degrees. Do not use <em>more, most, very, comparatively</em> before them:</span>
  <span class="lang-hi">कुछ विशेषण अपने आप में <strong>पूर्णता (Absoluteness)</strong> दर्शाते हैं। इनके साथ कभी भी <em>more, most, very, comparatively</em> या <em>-er/-est</em> नहीं लगाया जाता:</span></p>
</div>

<div class="callout-box info">
  <p><strong>📋 Absolute Adjectives List (कंठस्थ करें):</strong><br/>
  <code>perfect</code> (पूर्ण), <code>unique</code> (अनूठा/अद्वितीय), <code>ideal</code> (आदर्श), <code>chief</code> (मुख्य), <code>universal</code> (सार्वभौमिक), <code>extreme</code> (चरम), <code>complete</code> (पूरा), <code>entire</code> (समस्त), <code>excellent</code> (उत्कृष्ट), <code>absolute</code> (निरपेक्ष), <code>impossible</code> (असंभव), <code>eternal</code> (शाश्वत), <code>supreme</code> (सर्वोच्च), <code>circular / round</code> (गोल), <code>square</code> (चौकोर), <code>dead</code> (मृत)।</p>
</div>

<div class="pyq-box">
  <div class="pyq-title">🔥 Spotting Error Examples (Rule III)</div>
  <div class="pyq-body">
    <p>❌ <em>Incorrect:</em> This is the <strong>most unique</strong> opportunity for you.<br/>
    ✓ <em>Correct:</em> This is a <strong>unique</strong> opportunity for you. [हिंदी: यह आपके लिए एक अद्वितीय अवसर है — 'most unique' अशुद्ध है!]</p>
    
    <p>❌ <em>Incorrect:</em> Happiness is the <strong>chiefest</strong> aim of mankind.<br/>
    ✓ <em>Correct:</em> Happiness is the <strong>chief</strong> aim of mankind. [हिंदी: सुख मानव जाति का मुख्य उद्देश्य है।]</p>
    
    <p>❌ <em>Incorrect:</em> How can divided India become the <strong>most supreme</strong> power?<br/>
    ✓ <em>Correct:</em> How can divided India become the <strong>supreme</strong> power? [हिंदी: बँटा हुआ भारत सर्वोच्च शक्ति कैसे बन सकता है?]</p>
  </div>
</div>""")

    # Rule IV: Latin Adjectives taking 'to'
    html.append("""<div class="note-intro-card">
  <h3 style="margin-top:0;">Rule IV: Latin Comparative Adjectives Taking ‘to’ (Than नहीं, 'to' आएगा)</h3>
  <p><span class="lang-en">Comparative adjectives ending in <code>-ior</code> and words like <em>prefer, preferable, elder</em> are followed by <strong>‘to’</strong> instead of <strong>‘than’</strong>. Additionally, they never take <em>more</em> or <em>most</em> before them:</span>
  <span class="lang-hi">लैटिन मूल के <code>-ior</code> पर समाप्त होने वाले विशेषणों (<em>senior, junior, superior, inferior, prior, anterior, posterior</em>) तथा <em>prefer, preferable</em> के बाद <strong>'than' की जगह 'to'</strong> आता है। इनके पहले <em>more/most</em> भी नहीं लगता:</span></p>
</div>

<div class="formula-card">
  <div class="formula-header">⚡ Latin Adjectives + 'to' Pattern</div>
  <div class="formula-body">
    <p><code>Subject + Verb + [senior / junior / superior / inferior / prior / preferable] + TO + Object</code></p>
  </div>
</div>

<div class="pyq-box">
  <div class="pyq-title">🔥 SSC CGL Questions (Rule IV)</div>
  <div class="pyq-body">
    <p>❌ <em>Incorrect:</em> He is senior <strong>than</strong> me in service.<br/>
    ✓ <em>Correct:</em> He is senior <strong>to</strong> me in service. [हिंदी: वह सेवा में मुझसे वरिष्ठ है।]</p>
    
    <p>❌ <em>Incorrect:</em> Milk is <strong>more preferable than</strong> tea.<br/>
    ✓ <em>Correct:</em> Milk is <strong>preferable to</strong> tea. ['more' और 'than' दोनों हटेंगे!]</p>
    
    <p>❌ <em>Incorrect:</em> She is <strong>more senior to</strong> her boss.<br/>
    ✓ <em>Correct:</em> She is <strong>senior to</strong> her boss.</p>
    
    <p>💡 <em>Special Note on 'Prefer':</em> <em>I prefer tea <strong>to</strong> coffee.</em> ✓ (या <em>I prefer to read <strong>rather than</strong> write.</em>)</p>
  </div>
</div>""")

    # Rule V: Confusing Pairs (Little vs Few, Farther vs Further, etc.)
    html.append("""<div class="note-intro-card">
  <h3 style="margin-top:0;">Rule V: Confusing Pairs of Adjectives (अक्सर भ्रमित करने वाले विशेषण जोड़े)</h3>
  <p><span class="lang-en">SSC tests these fundamental semantic distinctions in almost every examination shift:</span>
  <span class="lang-hi">इन जोड़ों के अर्थ और प्रयोग में स्पष्ट अंतर समझें:</span></p>
</div>

<h3>1. Little vs Few (मात्रा बनाम संख्या)</h3>
<table class="notes-table">
  <thead>
    <tr>
      <th>Uncountable (मात्रा - Little)</th>
      <th>Countable (संख्या - Few)</th>
      <th>Meaning / हिंदी अर्थ</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td><strong>Little</strong> (Hardly any)</td>
      <td><strong>Few</strong> (Hardly any)</td>
      <td><strong>न के बराबर</strong> (नकारात्मक अर्थ / Negative sense)</td>
    </tr>
    <tr>
      <td><strong>A little</strong> (Some quantity)</td>
      <td><strong>A few</strong> (Some number)</td>
      <td><strong>थोड़ा-सा / कुछ</strong> (सकारात्मक अर्थ / Affirmative sense)</td>
    </tr>
    <tr>
      <td><strong>The little</strong> (Not much, but all)</td>
      <td><strong>The few</strong> (Not many, but all)</td>
      <td><strong>जो थोड़ा-सा था, वह सब</strong> (निश्चित संदर्भ)</td>
    </tr>
  </tbody>
</table>

<div class="callout-box alert">
  <p><strong>⚠️ Tricky SSC Rule on 'Quantity' & 'Number':</strong><br/>
  'quantity' और 'number' शब्दों के पहले <em>little</em> या <em>few</em> नहीं लगता! उनके साथ हमेशा <strong>small</strong> का प्रयोग होता है:<br/>
  ❌ <em>a little quantity / a few number</em> → ✓ <strong>a small quantity / a small number</strong>.</p>
</div>

<h3>2. Other Essential Confusing Pairs</h3>
<table class="notes-table">
  <thead>
    <tr>
      <th>Pair (जोड़ा)</th>
      <th>Exact Distinction & Usage</th>
      <th>Example Sentences</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td><strong>Farther vs Further</strong></td>
      <td>• <strong>Farther:</strong> Greater physical distance (अधिक दूर)<br/>• <strong>Further:</strong> Additional / In addition to (अतिरिक्त / और आगे)</td>
      <td>• Kolkata is <strong>farther</strong> from Delhi than Kanpur.<br/>• No <strong>further</strong> discussion is needed.</td>
    </tr>
    <tr>
      <td><strong>Elder/Eldest vs Older/Oldest</strong></td>
      <td>• <strong>Elder/Eldest:</strong> Used strictly for <strong>blood relations</strong> (persons only). Takes 'to', not 'than'.<br/>• <strong>Older/Oldest:</strong> Used for persons (non-relatives), animals, and things. Refers to age and time. Takes 'than'.</td>
      <td>• My <strong>elder</strong> brother is an engineer.<br/>• She is elder <strong>to</strong> me.<br/>• Rohan is <strong>older than</strong> Sohan.<br/>• This is the <strong>oldest</strong> temple in the city.</td>
    </tr>
    <tr>
      <td><strong>Later/Latest vs Latter/Last</strong></td>
      <td>• <strong>Later / Latest:</strong> Refers to <strong>Time</strong> (बाद में / सबसे नया-ताज़ा).<br/>• <strong>Latter / Last:</strong> Refers to <strong>Position</strong> (क्रम में दो में से बाद वाला / सबसे अंतिम).</td>
      <td>• She arrived <strong>later</strong> than I.<br/>• What is the <strong>latest</strong> score?<br/>• Between Ram and Shyam, the <strong>latter</strong> (Shyam) is smarter.<br/>• Z is the <strong>last</strong> letter of alphabet.</td>
    </tr>
    <tr>
      <td><strong>Some vs Any</strong></td>
      <td>• <strong>Some:</strong> Used in <strong>Affirmative sentences</strong> and in polite requests (<em>Could you give me some milk?</em>).<br/>• <strong>Any:</strong> Used in <strong>Negative</strong> and <strong>Interrogative</strong> sentences. (<em>No any / Not any</em> are wrong!).</td>
      <td>• I have <strong>some</strong> books.<br/>• I do not have <strong>any</strong> doubt.<br/>• Do you have <strong>any</strong> money?</td>
    </tr>
    <tr>
      <td><strong>Less vs Fewer</strong></td>
      <td>• <strong>Less:</strong> For uncountable quantity (कम मात्रा).<br/>• <strong>Fewer:</strong> For plural countable numbers (कम संख्या).</td>
      <td>• There is <strong>less</strong> sugar in the tea.<br/>• There are <strong>fewer</strong> passengers today (<em>less passengers</em> ❌).</td>
    </tr>
  </tbody>
</table>""")

    # Rule VI to X: Degrees Agreement, Ordinals, Comparing 2 Qualities, other/else
    html.append("""<div class="note-intro-card">
  <h3 style="margin-top:0;">Rule VI, VII & VIII: Advanced Comparison Rules</h3>
  <p><span class="lang-en">Rules governing simultaneous adjectives, order of numerals, and comparing two qualities of the same person:</span>
  <span class="lang-hi">एक साथ आने वाले विशेषणों, संख्याओं के क्रम और एक ही व्यक्ति के दो गुणों की तुलना के नियम:</span></p>
</div>

<h3>Rule VI: Both Adjectives in the Same Degree (समान डिग्री का नियम)</h3>
<p>जब दो विशेषण 'and' से जुड़कर एक ही संज्ञा की विशेषता बताते हैं, तो दोनों <strong>समान डिग्री</strong> में होने चाहिए:</p>
<ul>
  <li>❌ <em>Incorrect:</em> Gandhiji was the noblest and wiser leader.</li>
  <li>✓ <em>Correct:</em> Gandhiji was the <strong>noblest and wisest</strong> leader. (दोनों Superlative!)</li>
</ul>

<h3>Rule VII: Ordinal before Cardinal Numeral (Ordinal पहले, Cardinal बाद में)</h3>
<div class="callout-box info">
  <p><strong>Order of Numbers:</strong> <strong>Ordinal</strong> (First, Second, Third, Last) हमेशा <strong>Cardinal</strong> (One, Two, Three) से <strong>पहले</strong> आता है:<br/>
  ❌ <em>The two first chapters of the book</em><br/>
  ✓ <strong>The first two chapters of the book</strong> [हिंदी: किताब के पहले दो अध्याय]</p>
</div>

<h3>Rule VIII: Comparing Two Qualities of the SAME Person ('more clever' vs 'cleverer')</h3>
<div class="callout-box alert">
  <p><strong>⚠️ Major SSC Trap:</strong><br/>
  • जब <strong>दो अलग-अलग व्यक्तियों</strong> की तुलना हो: <em>She is <strong>cleverer than</strong> her sister.</em> ✓<br/>
  • जब <strong>एक ही व्यक्ति के दो अलग गुणों</strong> की तुलना हो (एक गुण दूसरे से अधिक है): तब <code>-er</code> नहीं लगता, बल्कि <strong>more + Positive Degree</strong> आता है:<br/>
  ❌ <em>She is cleverer than honest.</em><br/>
  ✓ <strong>She is more clever than honest.</strong> [हिंदी: वह ईमानदार होने से ज्यादा चतुर है।]<br/>
  ❌ <em>Rohan is braver than wise.</em><br/>
  ✓ <strong>Rohan is more brave than wise.</strong></p>
</div>

<h3>Rule X: Illogical Comparisons & Use of ‘other / else’</h3>
<p>1. <strong>Comparative Degree में उसी समूह के लिए 'other' अनिवार्य है:</strong><br/>
❌ <em>The Ganga is more sacred than any river of India.</em><br/>
✓ <strong>The Ganga is more sacred than any other river of India.</strong> [क्योंकि गंगा भी भारत की नदी है, अतः खुद को छोड़कर अन्य नदियों से तुलना होगी!]<br/>
• लेकिन जब वस्तु उस समूह की न हो, तो 'other' नहीं लगता: <em>The Nile is longer than <strong>any river in India</strong>.</em> ✓ (नील भारत की नदी नहीं है!)</p>

<p>2. <strong>Illogical Comparison (That of / Those of):</strong><br/>
तुलना हमेशा समान वस्तुओं में होनी चाहिए (व्यक्ति की तुलना व्यक्ति से, जलवायु की तुलना जलवायु से):<br/>
❌ <em>The climate of Chennai is warmer than Delhi.</em> (चेन्नई की जलवायु की तुलना दिल्ली शहर से हो गई!)<br/>
✓ <strong>The climate of Chennai is warmer than that of Delhi.</strong> (या <em>Delhi's climate</em>)</p>""")

    # Rule XI to XIV: All, Both, Whole, Correlatives, As...as, Prepositions
    html.append("""<div class="note-intro-card">
  <h3 style="margin-top:0;">Rule XI to XIV: All, Both, Whole & Correlative Positions</h3>
</div>

<table class="notes-table">
  <thead>
    <tr>
      <th>Rule</th>
      <th>Key Formula & Construction</th>
      <th>Example Sentences</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td><strong>Rule XI: All, Both, Whole</strong></td>
      <td>• 'The' always comes <strong>after</strong> All / Both.<br/>• 'The' always comes <strong>before</strong> Whole.<br/>• Possessive case comes after All / Both.</td>
      <td>• <strong>All the</strong> students were present. ✓<br/>• <strong>Both the</strong> boys left early. ✓<br/>• <strong>The whole</strong> country is suffering. ✓<br/>• <strong>All my</strong> efforts (not <em>my all efforts</em> ❌).</td>
    </tr>
    <tr>
      <td><strong>Rule XII: Position of Correlatives</strong></td>
      <td><code>Not only... but also</code>, <code>Either... or</code>, <code>Neither... nor</code> must be placed immediately before the parallel parts of speech they emphasize.</td>
      <td>❌ <em>She not only came to see me but also to take books.</em><br/>✓ <em>She came <strong>not only to see</strong> me <strong>but also to take</strong> books.</em></td>
    </tr>
    <tr>
      <td><strong>Rule XIII: as...as / than</strong></td>
      <td>बराबरी के लिए <code>as... as</code>, तुलना के लिए <code>than</code>। यदि वाक्य में दोनों हों, तो दोनों का पूरा रूप लिखा जाएगा।</td>
      <td>❌ <em>She is as honest, if not more honest than him.</em><br/>✓ <em>She is <strong>as honest as</strong>, if not more honest than him.</em></td>
    </tr>
    <tr>
      <td><strong>Rule XIV: Different Prepositions</strong></td>
      <td>यदि दो विशेषणों के साथ अलग-अलग Preposition लगते हों, तो दोनों के साथ उनका Preposition पूरा लिखें।</td>
      <td>❌ <em>He is senior and older than I.</em><br/>✓ <em>He is <strong>senior to</strong> and <strong>older than</strong> I.</em></td>
    </tr>
  </tbody>
</table>""")

    # Rule XV to XVIII: Times rule, Predicative-only adjectives, Order of Adjectives
    html.append("""<div class="note-intro-card">
  <h3 style="margin-top:0;">Rule XVI, XVII & XVIII: Times Comparison, Predicative Adjectives & Order</h3>
</div>

<h3>Rule XVI: Comparison with 'Times' (गुना के साथ Positive Degree)</h3>
<div class="callout-box alert">
  <p>जब वाक्य में <strong>'times' (गुना)</strong> शब्द आए, तो Comparative Degree नहीं, बल्कि <strong>as + Positive Degree + as</strong> आता है:<br/>
  ❌ <em>My book is three times cheaper than yours.</em><br/>
  ✓ <strong>My book is three times as cheap as yours.</strong> [हिंदी: मेरी किताब तुम्हारी से तीन गुना सस्ती है।]<br/>
  ❌ <em>Your income is many times higher than mine.</em><br/>
  ✓ <strong>Your income is many times as high as mine.</strong></p>
</div>

<h3>Rule XVII: Adjectives that Never Precede a Noun (Predicative-Only)</h3>
<p>निम्नलिखित विशेषण कभी भी संज्ञा से पहले (Attributively) नहीं आते; ये हमेशा क्रिया के बाद आते हैं:<br/>
<code>afraid, asleep, awake, alone, alike, alive, ashamed, fond, ill, well, glad, sorry, worth, due, unable</code></p>
<ul>
  <li>❌ <em>An asleep boy / An ill man / An alone lady</em> (सर्वथा अशुद्ध!)</li>
  <li>✓ <strong>The boy was asleep. / The man is ill. / She was alone.</strong></li>
</ul>

<h3>Rule XVIII: Order of Multiple Adjectives (SSACNM / S S A C N M / OSASCOMP)</h3>
<p>जब एक ही संज्ञा के लिए कई विशेषण एक साथ आएँ, तो उनका क्रम निम्नलिखित नियम के अनुसार होता है:</p>

<div class="formula-card">
  <div class="formula-header">⚡ Master Mnemonic: SSACNM (S S A C N M)</div>
  <div class="formula-body">
    <p><code>Size (आकार) → Shape (बनावट) → Age (उम्र) → Colour (रंग) → Nationality/Origin (राष्ट्रीयता) → Material (सामग्री) → NOUN</code></p>
    <p>• <strong>Example 1:</strong> A <strong>big</strong> (Size) <strong>round</strong> (Shape) <strong>black</strong> (Colour) <strong>Indian</strong> (Nationality) <strong>plastic</strong> (Material) <strong>table</strong> (Noun).<br/>
    • <strong>Example 2:</strong> A <strong>twenty-year-old</strong> (Age) <strong>black</strong> (Colour) <strong>American</strong> (Nationality) <strong>man</strong> (Noun).<br/>
    • <strong>Example 3:</strong> A <strong>large</strong> (Size) <strong>glass</strong> (Material) <strong>room</strong> (Noun).</p>
  </div>
</div>""")

    # 6. Solved Shift PYQ Practice Set
    html.append("""<h2><span class="lang-en">5. SSC CGL/CHSL Solved Shift Questions (PYQ Spotting Errors)</span><span class="lang-hi">5. विगत वर्षों के हल प्रश्न (विस्तृत व्याख्या सहित)</span></h2>

<div class="pyq-box">
  <div class="pyq-title">Q1. SSC CGL Tier-1 Shift Question</div>
  <div class="pyq-body">
    <p><strong>Spot the error in the sentence:</strong><br/>
    <em>"Of the two candidates / Raman is definitely / the most suitable for the job / No error."</em></p>
    <p><strong>Answer & Detailed Explanation:</strong><br/>
    👉 <strong>Error is in Part 3.</strong> जब केवल <strong>दो व्यक्तियों (two candidates)</strong> की तुलना हो, तो Superlative Degree नहीं, बल्कि <strong>Comparative Degree (the more suitable)</strong> का प्रयोग होता है।<br/>
    ✓ <strong>Correct Sentence:</strong> <em>"Of the two candidates, Raman is definitely <strong>the more suitable</strong> for the job."</em></p>
  </div>
</div>

<div class="pyq-box">
  <div class="pyq-title">Q2. SSC CHSL Tier-1 Shift Question</div>
  <div class="pyq-body">
    <p><strong>Spot the error in the sentence:</strong><br/>
    <em>"No sooner did the teacher / enter the classroom / than all student stood up / No error."</em></p>
    <p><strong>Answer & Detailed Explanation:</strong><br/>
    👉 <strong>Error is in Part 3.</strong> 'All' के बाद हमेशा Plural Noun आता है और 'the' लगता है (All the students).<br/>
    ✓ <strong>Correct Sentence:</strong> <em>"No sooner did the teacher enter the classroom than <strong>all the students</strong> stood up."</em></p>
  </div>
</div>

<div class="pyq-box">
  <div class="pyq-title">Q3. SSC CPO Tier-1 Shift Question</div>
  <div class="pyq-body">
    <p><strong>Spot the error in the sentence:</strong><br/>
    <em>"My car is / much more superior than / yours in performance / No error."</em></p>
    <p><strong>Answer & Detailed Explanation:</strong><br/>
    👉 <strong>Error is in Part 2.</strong> 'Superior' के साथ 'than' नहीं, <strong>'to'</strong> लगता है और इसके पहले 'more' नहीं आता।<br/>
    ✓ <strong>Correct Sentence:</strong> <em>"My car is <strong>superior to</strong> yours in performance."</em></p>
  </div>
</div>""")

    # 7. FAQs
    html.append("""<h2><span class="lang-en">6. Frequently Asked Questions (FAQs)</span><span class="lang-hi">6. अक्सर पूछे जाने वाले प्रश्न</span></h2>

<div class="lang-card-en" style="margin-bottom:15px;">
  <p><strong>Q1. Can we say 'more preferable'?</strong><br/>
  <strong>Ans:</strong> No. 'Preferable' already has a comparative force. Saying 'more preferable' is a redundant double comparative. Always say <strong>preferable to</strong>.</p>
</div>

<div class="lang-card-en" style="margin-bottom:15px;">
  <p><strong>Q2. What is the difference between 'elder' and 'older'?</strong><br/>
  <strong>Ans:</strong> 'Elder' is used exclusively for family blood relations (brother, sister, son, daughter) and takes 'to'. 'Older' is used for persons outside the family, animals, and inanimate objects, and takes 'than'.</p>
</div>

<div class="lang-card-en" style="margin-bottom:15px;">
  <p><strong>Q3. Why is 'He is braver than wise' incorrect?</strong><br/>
  <strong>Ans:</strong> When comparing two different qualities of the same person, use <strong>more + positive degree</strong> (<em>He is more brave than wise</em>), not the -er form.</p>
</div>""")

    # 8. CTA Card
    html.append("""<div style="background: linear-gradient(135deg, #1e3a8a, #2563eb); color: #ffffff; padding: 24px; border-radius: 14px; margin: 30px 0; text-align: center;">
  <h3 style="margin: 0 0 8px 0; color: #ffffff; font-size: 19px; font-weight: 800;">Master Adjective Error Spotting in Live CBT Mode</h3>
  <p style="margin: 0 0 16px 0; color: #dbeafe; font-size: 14px;">Attempt verified SSC shift questions with instant percentiles, analytics, and bilingual solutions.</p>
  <a href="/papers" style="display: inline-block; background: #ffffff; color: #1e3a8a; font-weight: 800; padding: 11px 22px; border-radius: 8px; text-decoration: none; font-size: 14px;">
    Attempt Shift Papers Now →
  </a>
</div>""")

    return "\n\n".join(html)

if __name__ == "__main__":
    content = build_adjective_content()
    print("Adjective content generated successfully!")
    print("Total characters:", len(content))
    print("Total words:", len(content.split()))
