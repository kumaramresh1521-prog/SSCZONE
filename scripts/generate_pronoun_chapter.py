# -*- coding: utf-8 -*-
"""
Generates Chapter 1: Pronoun (सर्वनाम)
Produces: content (bilingual), english_content, and hindi_content
"""

import json
import re

def build_pronoun_content():
    # Bilingual HTML
    html = []

    # 1. Introduction
    html.append("""<h2><span class="lang-en">1. What is a Pronoun? (Definition & Purpose)</span><span class="lang-hi">1. सर्वनाम (Pronoun) क्या है? (परिभाषा एवं उद्देश्य)</span></h2>

<div class="lang-en">
  <div class="lang-card-en">
    <p>A <strong>Pronoun</strong> is a word used in place of a noun in order to avoid awkward and unnecessary repetition of the noun in a sentence or paragraph.</p>
    <p><strong>Example:</strong></p>
    <ul>
      <li><em>Awkward (Repeated Noun):</em> Rahul bought a new car because Rahul loves driving, but Rahul's car broke down.</li>
      <li><em>Natural & Correct (With Pronouns):</em> Rahul bought a new car because <strong>he</strong> loves driving, but <strong>his</strong> car broke down.</li>
    </ul>
    <p>Here, <strong>he</strong> and <strong>his</strong> replace the noun <em>Rahul</em>, making the sentence grammatically crisp and readable.</p>
  </div>
</div>

<div class="lang-hi">
  <div class="lang-card-hi">
    <p><strong>सर्वनाम (Pronoun)</strong> वह शब्द है जो किसी <em>संज्ञा (Noun)</em> के स्थान पर प्रयुक्त होता है, ताकि वाक्य में संज्ञा को बार-बार दोहराना न पड़े और भाषा सहज व सुंदर लगे।</p>
    <p><strong>सरल उदाहरण:</strong></p>
    <ul>
      <li><em>संज्ञा का बार-बार दोहराव (अशुद्ध/अजीब):</em> अमन एक अच्छा लड़का है। अमन रोज स्कूल जाता है। अमन के पिताजी डॉक्टर हैं।</li>
      <li><em>सर्वनाम के साथ (शुद्ध एवं सहज):</em> अमन एक अच्छा लड़का है। <strong>वह</strong> रोज स्कूल जाता है। <strong>उसके</strong> पिताजी डॉक्टर हैं।</li>
    </ul>
    <p>यहाँ <strong>वह</strong> और <strong>उसके</strong> सर्वनाम हैं जो संज्ञा 'अमन' की जगह आए हैं।</p>
  </div>
</div>

<div class="callout-box info">
  <p><strong>📌 Core Takeaway / मुख्य बिंदु:</strong><br/>
  <span class="lang-en">A pronoun must always agree with the noun it replaces (its <strong>antecedent</strong>) in <strong>Person</strong> (1st, 2nd, 3rd), <strong>Number</strong> (Singular, Plural), and <strong>Gender</strong> (Masculine, Feminine, Neuter).</span>
  <span class="lang-hi">सर्वनाम हमेशा उस संज्ञा (Antecedent) के अनुसार होना चाहिए जिसके लिए वह आ रहा है — यानी <strong>पुरुष (Person)</strong>, <strong>वचन (Number)</strong> तथा <strong>लिंग (Gender)</strong> में पूर्ण सामंजस्य होना अनिवार्य है।</span></p>
</div>""")

    # 2. 8 Types of Pronouns
    html.append("""<h2><span class="lang-en">2. Classification: 8 Types of Pronouns</span><span class="lang-hi">2. सर्वनाम के 8 प्रमुख प्रकार</span></h2>

<div class="lang-en">
  <div class="lang-card-en">
    <p>In standard English grammar tested in SSC CGL, CHSL, and CPO, Pronouns are classified into <strong>8 core categories</strong>:</p>
    <ol>
      <li><strong>Personal Pronouns:</strong> Refer to specific persons or things (<em>I, we, you, he, she, it, they</em>).</li>
      <li><strong>Demonstrative Pronouns:</strong> Point out specific objects or position (<em>this, that, these, those</em>).</li>
      <li><strong>Relative Pronouns:</strong> Connect dependent clauses and refer to a preceding noun (<em>who, whom, whose, which, that</em>).</li>
      <li><strong>Interrogative Pronouns:</strong> Used to ask questions (<em>who, whom, whose, what, which</em>).</li>
      <li><strong>Indefinite Pronouns:</strong> Refer to non-specific, vague persons or things (<em>everybody, nobody, someone, all, few, none</em>).</li>
      <li><strong>Reflexive & Emphatic Pronouns:</strong> Turn the action back to the subject or emphasize it (<em>myself, himself, themselves</em>).</li>
      <li><strong>Distributive Pronouns:</strong> Refer to persons or things one at a time (<em>each, either, neither</em>).</li>
      <li><strong>Reciprocal Pronouns:</strong> Express mutual relationship (<em>each other, one another</em>).</li>
    </ol>
  </div>
</div>

<div class="lang-hi">
  <div class="lang-card-hi">
    <p>प्रतियोगी परीक्षाओं (SSC CGL, CHSL, CPO) के दृष्टिकोण से सर्वनाम को <strong>8 मुख्य भेदों</strong> में बाँटा गया है:</p>
    <ol>
      <li><strong>पुरुषवाचक सर्वनाम (Personal Pronouns):</strong> व्यक्तियों या वस्तुओं के लिए प्रयुक्त होते हैं (<em>I, we, you, he, she, it, they</em>)।</li>
      <li><strong>संकेतवाचक सर्वनाम (Demonstrative Pronouns):</strong> किसी वस्तु की ओर संकेत करने वाले (<em>this, that, these, those</em>)।</li>
      <li><strong>संबंधवाचक सर्वनाम (Relative Pronouns):</strong> दो वाक्यों या उपवाक्यों को जोड़ने वाले (<em>who, which, that, whose, whom</em>)।</li>
      <li><strong>प्रश्नवाचक सर्वनाम (Interrogative Pronouns):</strong> प्रश्न पूछने के लिए प्रयुक्त (<em>who, what, which, whose, whom</em>)।</li>
      <li><strong>अनिश्चयवाचक सर्वनाम (Indefinite Pronouns):</strong> अनिश्चित व्यक्ति या वस्तु का बोध कराने वाले (<em>everybody, someone, nobody, all, few</em>)।</li>
      <li><strong>निजवाचक सर्वनाम (Reflexive Pronouns):</strong> कर्ता पर क्रिया का प्रभाव दर्शाने वाले (<em>myself, himself, herself, themselves</em>)।</li>
      <li><strong>प्रत्येकवाचक सर्वनाम (Distributive Pronouns):</strong> एक समय में एक व्यक्ति या वस्तु का बोध कराने वाले (<em>each, either, neither</em>)।</li>
      <li><strong>परस्परवाचक सर्वनाम (Reciprocal Pronouns):</strong> आपस के संबंध को व्यक्त करने वाले (<em>each other, one another</em>)।</li>
    </ol>
  </div>
</div>""")

    # 3. Personal Pronouns & Case Table
    html.append("""<h2><span class="lang-en">3. Personal Pronouns & Master Case Table</span><span class="lang-hi">3. पुरुषवाचक सर्वनाम एवं संपूर्ण कारक सारणी</span></h2>

<div class="lang-en">
  <div class="lang-card-en">
    <p><strong>Personal Pronouns</strong> change their form based on <strong>Person</strong> (1st, 2nd, 3rd) and <strong>Grammatical Case</strong> (Subjective, Objective, Possessive Adjective, and Possessive Pronoun). Understanding this table is fundamental to solving 90% of error-spotting questions in SSC.</p>
  </div>
</div>

<div class="lang-hi">
  <div class="lang-card-hi">
    <p><strong>पुरुषवाचक सर्वनाम (Personal Pronouns)</strong> के तीन पुरुष होते हैं: <em>प्रथम पुरुष (First Person - बोलने वाला)</em>, <em>मध्यम पुरुष (Second Person - सुनने वाला)</em>, तथा <em>अन्य पुरुष (Third Person - जिसके बारे में बात हो रही हो)</em>। नीचे दी गई सारणी को कंठस्थ कर लें:</p>
  </div>
</div>

<table class="notes-table">
  <thead>
    <tr>
      <th>Person (पुरुष)</th>
      <th>Number (वचन)</th>
      <th>Subjective (कर्ता रूप)</th>
      <th>Objective (कर्म रूप)</th>
      <th>Possessive Adjective (+ Noun)</th>
      <th>Possessive Pronoun (अकेला)</th>
      <th>Reflexive Pronoun</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td><strong>1st Person</strong></td>
      <td>Singular (एकवचन)</td>
      <td><strong>I</strong> (मैं)</td>
      <td><strong>me</strong> (मुझे)</td>
      <td><strong>my</strong> (मेरा + संज्ञा)</td>
      <td><strong>mine</strong> (मेरा)</td>
      <td><strong>myself</strong> (मैं स्वयं)</td>
    </tr>
    <tr>
      <td><strong>1st Person</strong></td>
      <td>Plural (बहुवचन)</td>
      <td><strong>we</strong> (हम)</td>
      <td><strong>us</strong> (हमें)</td>
      <td><strong>our</strong> (हमारा + संज्ञा)</td>
      <td><strong>ours</strong> (हमारा)</td>
      <td><strong>ourselves</strong> (हम स्वयं)</td>
    </tr>
    <tr>
      <td><strong>2nd Person</strong></td>
      <td>Singular / Plural</td>
      <td><strong>you</strong> (तुम/आप)</td>
      <td><strong>you</strong> (तुम्हें)</td>
      <td><strong>your</strong> (तुम्हारा + संज्ञा)</td>
      <td><strong>yours</strong> (तुम्हारा)</td>
      <td><strong>yourself / yourselves</strong></td>
    </tr>
    <tr>
      <td><strong>3rd Person</strong></td>
      <td>Singular (Male)</td>
      <td><strong>he</strong> (वह - पुरुष)</td>
      <td><strong>him</strong> (उसे)</td>
      <td><strong>his</strong> (उसका + संज्ञा)</td>
      <td><strong>his</strong> (उसका)</td>
      <td><strong>himself</strong> (वह स्वयं)</td>
    </tr>
    <tr>
      <td><strong>3rd Person</strong></td>
      <td>Singular (Female)</td>
      <td><strong>she</strong> (वह - स्त्री)</td>
      <td><strong>her</strong> (उसे)</td>
      <td><strong>her</strong> (उसका + संज्ञा)</td>
      <td><strong>hers</strong> (उसका)</td>
      <td><strong>herself</strong> (वह स्वयं)</td>
    </tr>
    <tr>
      <td><strong>3rd Person</strong></td>
      <td>Singular (Neuter)</td>
      <td><strong>it</strong> (यह/वह - निर्जीव/जीव)</td>
      <td><strong>it</strong> (इसे)</td>
      <td><strong>its</strong> (इसका + संज्ञा)</td>
      <td><em>— (No pronoun form)</em></td>
      <td><strong>itself</strong> (यह स्वयं)</td>
    </tr>
    <tr>
      <td><strong>3rd Person</strong></td>
      <td>Plural</td>
      <td><strong>they</strong> (वे)</td>
      <td><strong>them</strong> (उन्हें)</td>
      <td><strong>their</strong> (उनका + संज्ञा)</td>
      <td><strong>theirs</strong> (उनका)</td>
      <td><strong>themselves</strong> (वे स्वयं)</td>
    </tr>
  </tbody>
</table>

<div class="callout-box alert">
  <p><strong>⚠️ Crucial Exam Distinction / महत्वपूर्ण परीक्षा अंतर:</strong><br/>
  <span class="lang-en"><strong>Possessive Adjective</strong> always needs a noun immediately following it: <em>"This is <strong>my</strong> car."</em><br/>
  <strong>Possessive Pronoun</strong> stands completely alone without any noun: <em>"This car is <strong>mine</strong>."</em> (Never write <em>mine car</em> ✗).</span>
  <span class="lang-hi"><strong>Possessive Adjective (my, our, your, his, her, their):</strong> इसके तुरंत बाद संज्ञा (Noun) का आना अनिवार्य है: <em>"This is <strong>my</strong> book."</em><br/>
  <strong>Possessive Pronoun (mine, ours, yours, his, hers, theirs):</strong> यह हमेशा अकेला आता है, इसके बाद संज्ञा नहीं आती: <em>"This book is <strong>mine</strong>."</em> (कभी भी <em>mine book</em> नहीं लिखते ✗)।</span></p>
</div>""")

    # 4. Demonstrative, Relative, Interrogative, Distributive, Reciprocal Explanations
    html.append("""<h2><span class="lang-en">4. Demonstrative, Relative, Distributive & Reciprocal Nuances</span><span class="lang-hi">4. संकेतवाचक, संबंधवाचक, प्रत्येकवाचक एवं परस्परवाचक सर्वनाम की बारीकियां</span></h2>

<div class="lang-en">
  <div class="lang-card-en">
    <p><strong>A. Demonstrative Pronoun vs Demonstrative Adjective:</strong></p>
    <ul>
      <li><em>Pronoun (Stands alone as subject):</em> <strong>This</strong> is my house. / <strong>Those</strong> are ripe apples.</li>
      <li><em>Adjective (Qualifies the noun next to it):</em> <strong>This</strong> house is mine. / <strong>Those</strong> apples are ripe.</li>
    </ul>

    <p><strong>B. Relative Pronouns (Who, Whom, Which, That):</strong></p>
    <ul>
      <li><strong>Who:</strong> Used strictly for persons as <em>Subject</em> (<em>"The man <strong>who</strong> helped me is my friend."</em>).</li>
      <li><strong>Whom:</strong> Used strictly for persons as <em>Object</em> (<em>"The girl <strong>whom</strong> you met yesterday is my sister."</em>).</li>
      <li><strong>Which:</strong> Used for non-living things, animals, or for choice (<em>"The book <strong>which</strong> I bought is costly."</em>).</li>
      <li><strong>That:</strong> Used for both persons and things, especially after superlatives, <em>all, same, only, none</em>.</li>
    </ul>

    <p><strong>C. Reciprocal Pronouns (Each other vs One another):</strong></p>
    <ul>
      <li><strong>Each other:</strong> Strictly used for <strong>exactly TWO</strong> persons or things. (<em>"Both brothers love <strong>each other</strong>."</em>).</li>
      <li><strong>One another:</strong> Strictly used for <strong>MORE THAN TWO</strong> persons or things. (<em>"The students helped <strong>one another</strong>."</em>).</li>
    </ul>
  </div>
</div>

<div class="lang-hi">
  <div class="lang-card-hi">
    <p><strong>A. संकेतवाचक सर्वनाम vs संकेतवाचक विशेषण (This, That, These, Those):</strong></p>
    <ul>
      <li><em>सर्वनाम (Pronoun):</em> जब ये अकेले आएं: <strong>This</strong> is my pen. (यह मेरा पेन है)।</li>
      <li><em>विशेषण (Adjective):</em> जब इनके तुरंत बाद संज्ञा हो: <strong>This</strong> pen is mine. (यह पेन मेरा है)।</li>
    </ul>

    <p><strong>B. परस्परवाचक सर्वनाम (Each other vs One another का स्वर्णिम नियम):</strong></p>
    <ul>
      <li><strong>Each other:</strong> केवल और केवल <strong>दो (2)</strong> व्यक्तियों या वस्तुओं के लिए आता है।<br/>
      उदाहरण: <em>Both sisters respect <strong>each other</strong>.</em> (दोनों बहनें एक-दूसरे का सम्मान करती हैं)।</li>
      <li><strong>One another:</strong> <strong>दो से अधिक</strong> व्यक्तियों या वस्तुओं के लिए आता है।<br/>
      उदाहरण: <em>All the four players congratulated <strong>one another</strong>.</em> (चारों खिलाड़ियों ने एक-दूसरे को बधाई दी)।</li>
    </ul>
  </div>
</div>""")

    # 5. 17 Golden Rules
    html.append("""<h2><span class="lang-en">5. The 17 Golden Exam Rules of Pronoun (With Error-Spotting Examples)</span><span class="lang-hi">5. सर्वनाम के 17 स्वर्णिम नियम (परीक्षा में बार-बार पूछे जाने वाले नियम व उदाहरण)</span></h2>

<!-- Rule 1 -->
<div class="callout-box info">
  <h4><span class="lang-en">Rule I: Verbs Followed by Reflexive Pronouns</span><span class="lang-hi">नियम 1: जिन क्रियाओं के बाद Reflexive Pronoun अनिवार्य होता है</span></h4>
  <p><span class="lang-en">When the subject of the verb is also the receiver of the action, the action is reflected. The following verbs are used reflexively if no direct object is present: <strong>acquit, absent, avail, reconcile, amuse, resign, avenge, revenge, enjoy, exert, apply, adapt, adjust, pride, overreach</strong>.</span>
  <span class="lang-hi">यदि क्रिया का कोई प्रत्यक्ष कर्म (Direct Object) न हो, तो निम्नलिखित क्रियाओं के बाद Reflexive Pronoun (myself, himself, themselves आदि) का प्रयोग अनिवार्य है: <strong>acquit, absent, avail, reconcile, amuse, resign, avenge, revenge, enjoy, exert, apply, adapt, adjust, pride</strong>.</span></p>

  <p><strong>Examples (उदाहरण):</strong></p>
  <ul>
    <li><span class="lang-en">✓ You should avail <strong>yourself</strong> of every opportunity in life.</span><span class="lang-hi">✓ तुम्हें जीवन के हर अवसर का लाभ उठाना चाहिए।</span></li>
    <li><span class="lang-en">✗ They enjoyed during the summer vacation. (Incorrect)</span><br/>
        <span class="lang-en">✓ They enjoyed <strong>themselves</strong> during the summer vacation. (Correct)</span><span class="lang-hi">✓ उन्होंने गर्मियों की छुट्टियों में खूब आनंद लिया।</span></li>
    <li><span class="lang-en">✓ He resigned <strong>himself</strong> to his failure.</span><span class="lang-hi">✓ उसने अपनी असफलता को स्वीकार कर लिया।</span></li>
    <li><span class="lang-en">⚡ <em>Crucial Note on 'Enjoy':</em> If a direct object is already given, do NOT use a reflexive pronoun! <br/>
    <em>"They enjoyed <strong>the movie</strong> last evening."</em> (Here 'the movie' is the direct object, so <em>themselves</em> is not required).</span>
    <span class="lang-hi">⚡ <em>ध्यान दें:</em> यदि 'enjoy' के बाद कर्म (Object) मौजूद हो, तो Reflexive Pronoun नहीं आता! जैसे: <em>"They enjoyed <strong>the picture</strong>."</em></span></li>
  </ul>
</div>

<!-- Rule 2 -->
<div class="callout-box alert">
  <h4><span class="lang-en">Rule II: Verbs That Are NEVER Used Reflexively</span><span class="lang-hi">नियम 2: जिन क्रियाओं के बाद Reflexive Pronoun कभी नहीं आता</span></h4>
  <p><span class="lang-en">The following intransitive/reflexive verbs do NOT take reflexive pronouns: <strong>keep, stop, turn, qualify, bathe, move, rest, hide</strong>.</span>
  <span class="lang-hi">निम्नलिखित क्रियाओं के बाद खुद को दर्शाने के लिए Reflexive Pronoun (yourself, himself आदि) लगाना पूर्णतः अशुद्ध है: <strong>keep, stop, turn, qualify, bathe, move, rest, hide</strong>.</span></p>

  <p><strong>Error-Spotting Drills:</strong></p>
  <ul>
    <li><span class="lang-en">✗ You should keep <strong>yourself</strong> away from bad companions. (Drop 'yourself')</span><br/>
        <span class="lang-en">✓ You should <strong>keep</strong> away from bad companions.</span><span class="lang-hi">✓ तुम्हें बुरे लड़कों से दूर रहना चाहिए।</span></li>
    <li><span class="lang-en">✗ He has qualified <strong>himself</strong> for the post of Inspector. (Drop 'himself')</span><br/>
        <span class="lang-en">✓ He has <strong>qualified</strong> for the post of Inspector.</span><span class="lang-hi">✓ वह इंस्पेक्टर पद के लिए योग्य हो गया है।</span></li>
    <li><span class="lang-en">✗ The thief hid <strong>himself</strong> behind the counter. (Drop 'himself')</span><br/>
        <span class="lang-en">✓ The thief <strong>hid</strong> behind the counter.</span><span class="lang-hi">✓ चोर काउंटर के पीछे छिप गया।</span></li>
  </ul>
</div>

<!-- Rule 3 -->
<div class="callout-box info">
  <h4><span class="lang-en">Rule III: Reflexive Pronouns Cannot Stand Alone as Subject or Object</span><span class="lang-hi">नियम 3: अकेला Reflexive Pronoun कभी कर्ता या कर्म नहीं बन सकता</span></h4>
  <p><span class="lang-en">A reflexive pronoun (myself, yourself, himself) cannot act as the subject or object of a verb unless it is preceded by the corresponding noun or pronoun. (Colloquial use of "Myself Rahul" in spoken English is 100% grammatically incorrect in exams!).</span>
  <span class="lang-hi">Reflexive pronoun कभी भी वाक्य का स्वतंत्र कर्ता (Subject) या कर्म (Object) नहीं बन सकता। स्पोकन इंग्लिश में बोला जाने वाला <em>"Myself Rahul"</em> प्रतियोगी परीक्षा में पूरी तरह गलत है।</span></p>

  <p><strong>Exam Drills:</strong></p>
  <ul>
    <li><span class="lang-en">✗ <strong>Myself</strong> will see to it that you get justice. (Wrong)</span><br/>
        <span class="lang-en">✓ <strong>I</strong> will see to it that you get justice. (Correct)</span><span class="lang-hi">✓ मैं देखूंगा कि तुम्हें न्याय मिले।</span></li>
    <li><span class="lang-en">✗ <strong>Yourself and he</strong> reached the venue on time. (Wrong)</span><br/>
        <span class="lang-en">✓ <strong>You and he</strong> reached the venue on time. (Correct)</span><span class="lang-hi">✓ तुम और वह समय पर कार्यक्रम स्थल पर पहुंचे।</span></li>
    <li><span class="lang-en">✗ Raj will buy books for <strong>myself and my sister</strong>. (Wrong)</span><br/>
        <span class="lang-en">✓ Raj will buy books for <strong>me and my sister</strong>. (Correct)</span><span class="lang-hi">✓ राज मेरे और मेरी बहन के लिए किताबें खरीदेगा।</span></li>
    <li><span class="lang-en">✓ <strong>I myself</strong> investigated the case. (Correct — here 'myself' is an Emphatic pronoun qualifying 'I').</span></li>
  </ul>
</div>

<!-- Rule 4 -->
<div class="callout-box alert">
  <h4><span class="lang-en">Rule IV: Verb 'To Be' Takes Subjective Case Complement</span><span class="lang-hi">नियम 4: 'To Be' क्रिया (is/am/are/was/were) के बाद Subjective रूप आता है</span></h4>
  <p><span class="lang-en">When the complement of the verb 'to be' (is, am, are, was, were, been) is a personal pronoun, it must always be in the <strong>Subjective (Nominative) case</strong>, NOT the objective case.</span>
  <span class="lang-hi">जब 'To Be' क्रिया (is, am, are, was, were) का पूरक कोई सर्वनाम हो, तो वह हमेशा <strong>Subjective Case (I, he, she, we, they)</strong> में आएगा, Objective (me, him, her, us, them) में नहीं।</span></p>

  <p><strong>Exam Examples:</strong></p>
  <ul>
    <li><span class="lang-en">✗ It is <strong>me</strong> who have brought you home. (Wrong)</span><br/>
        <span class="lang-en">✓ It is <strong>I</strong> who have brought you home. (Correct)</span><span class="lang-hi">✓ मैं ही हूँ जो तुम्हें घर लेकर आया हूँ।</span></li>
    <li><span class="lang-en">✗ Was it <strong>her</strong> who did it for you? (Wrong)</span><br/>
        <span class="lang-en">✓ Was it <strong>she</strong> who did it for you? (Correct)</span><span class="lang-hi">✓ क्या वह वही थी जिसने तुम्हारे लिए यह किया?</span></li>
    <li><span class="lang-en">✗ If I were <strong>him</strong>, I would not accept the bribe. (Wrong)</span><br/>
        <span class="lang-en">✓ If I were <strong>he</strong>, I would not accept the bribe. (Correct)</span><span class="lang-hi">✓ यदि मैं उसकी जगह होता, तो रिश्वत न लेता।</span></li>
  </ul>
</div>

<!-- Rule 5 -->
<div class="callout-box info">
  <h4><span class="lang-en">Rule V: Verbs and Prepositions Are Followed by Objective Case</span><span class="lang-hi">नियम 5: क्रिया तथा Preposition के बाद हमेशा Objective Case आता है</span></h4>
  <p><span class="lang-en">Whenever a pronoun follows a transitive verb or a preposition (such as <em>between, to, for, with, except, like, let</em>), it must always be in the <strong>Objective Case</strong> (<em>me, him, her, us, them</em>).</span>
  <span class="lang-hi">किसी भी क्रिया अथवा Preposition (जैसे <em>between, to, for, with, except, let, but</em>) के बाद आने वाला सर्वनाम हमेशा <strong>Objective Case (me, him, her, us, them)</strong> में होना चाहिए।</span></p>

  <p><strong>Exam Traps:</strong></p>
  <ul>
    <li><span class="lang-en">✗ Between you and <strong>I</strong>, Suhani is very intelligent. (Wrong)</span><br/>
        <span class="lang-en">✓ Between you and <strong>me</strong>, Suhani is very intelligent. (Correct)</span><span class="lang-hi">✓ तुम्हारे और मेरे बीच की बात है, सुहानी बहुत बुद्धिमान है।</span></li>
    <li><span class="lang-en">✗ <strong>Let they</strong> go there immediately. (Wrong)</span><br/>
        <span class="lang-en">✓ <strong>Let them</strong> go there immediately. (Correct)</span><span class="lang-hi">✓ उन्हें तुरंत वहाँ जाने दो।</span></li>
    <li><span class="lang-en">✗ She is teaching Rohit and <strong>she</strong>. (Wrong)</span><br/>
        <span class="lang-en">✓ She is teaching Rohit and <strong>her</strong>. (Correct)</span><span class="lang-hi">✓ वह रोहित और उसे पढ़ा रही है।</span></li>
    <li><span class="lang-en">✗ Everyone attended the party except <strong>he</strong>. (Wrong)</span><br/>
        <span class="lang-en">✓ Everyone attended the party except <strong>him</strong>. (Correct)</span><span class="lang-hi">✓ उसके अलावा सभी पार्टी में शामिल हुए।</span></li>
  </ul>
</div>

<!-- Rule 6 -->
<div class="callout-box alert">
  <h4><span class="lang-en">Rule VI: Order of Pronouns (231 vs 123 Rules)</span><span class="lang-hi">नियम 6: सर्वनामों का क्रम (231 और 123 का नियम)</span></h4>
  <p><span class="lang-en">When pronouns of different persons are used together in a single sentence, their sequence is strictly governed by etiquette and context:</span>
  <span class="lang-hi">जब एक ही वाक्य में अलग-अलग पुरुष (Persons) के सर्वनाम एक साथ आएं, तो उनका क्रम निम्नलिखित नियमानुसार होता है:</span></p>

  <ul>
    <li><span class="lang-en"><strong>A. Singular Pronouns in Good / Normal / Pleasant Contexts → Rule 231:</strong><br/>
    Order: <strong>Second Person (You) → Third Person (He/She/They/Noun) → First Person (I)</strong>.</span>
    <span class="lang-hi"><strong>A. एकवचन सर्वनाम (सामान्य/अच्छी बात में) → 231 का नियम:</strong><br/>
    क्रम: <strong>You (2) → He/She/Mohan (3) → I (1)</strong>.</span><br/>
    <em>✗ I and you will attend her wedding. → ✓ <strong>You and I</strong> will attend her wedding.</em><br/>
    <em>✓ <strong>You, Mohan and I</strong> will watch a movie tonight.</em></li>

    <li><span class="lang-en"><strong>B. Plural Pronouns (In Any Context) → Rule 123:</strong><br/>
    Order: <strong>First Person (We) → Second Person (You) → Third Person (They)</strong>.</span>
    <span class="lang-hi"><strong>B. बहुवचन सर्वनाम (Plural) → 123 का नियम:</strong><br/>
    क्रम: <strong>We (1) → You (2) → They (3)</strong>.</span><br/>
    <em>✓ <strong>We, you and they</strong> are leaving for Mumbai tomorrow.</em></li>

    <li><span class="lang-en"><strong>C. Confession of Guilt, Mistake, or Unpleasant Acts → Rule 123:</strong><br/>
    When confessing a crime, blunder, or accepting punishment, good manners dictate taking the blame first!</span>
    <span class="lang-hi"><strong>C. भूल स्वीकार करने, अपराध या अप्रिय बात में → 123 का नियम:</strong><br/>
    विनम्रता व शिष्टाचार के नाते अपनी गलती पहले स्वीकार की जाती है (I पहले):</span><br/>
    <em>✗ You and I will be punished. → ✓ <strong>I and you</strong> will be punished.</em><br/>
    <em>✓ <strong>I, you and he</strong> are responsible for this catastrophic loss.</em></li>
  </ul>
</div>

<!-- Rule 7 -->
<div class="callout-box info">
  <h4><span class="lang-en">Rule VII: Possessive Adjectives with Compound Subjects</span><span class="lang-hi">नियम 7: संयुक्त कर्ताओं के साथ Possessive Adjective का प्रयोग</span></h4>
  
  <ul>
    <li><span class="lang-en"><strong>(A) Subjects joined by 'as well as, along with, together with, with, in addition to, like, unlike, rather than, except, but, no less than, nothing but':</strong><br/>
    The possessive adjective must agree strictly with the <strong>FIRST subject</strong>!</span>
    <span class="lang-hi"><strong>(A) as well as, along with, together with आदि से जुड़े कर्ता:</strong><br/>
    Possessive Adjective हमेशा <strong>पहले कर्ता (First Subject)</strong> के अनुसार आता है!</span><br/>
    <em>✗ Reena as well as her children has returned to <strong>their</strong> home. (Wrong)</em><br/>
    <em>✓ Reena as well as her children has returned to <strong>her</strong> home. (Correct)</em><br/>
    <em>✓ My sister along with her friends is doing <strong>her</strong> job at Delhi. (Correct)</em></li>

    <li><span class="lang-en"><strong>(B) Subjects joined by 'either...or, neither...nor, not only...but also, none but':</strong><br/>
    The possessive adjective must agree with the <strong>NEAREST subject</strong>!</span>
    <span class="lang-hi"><strong>(B) either...or, neither...nor, not only...but also से जुड़े कर्ता:</strong><br/>
    Possessive Adjective हमेशा <strong>नजदीकी कर्ता (Nearest Subject)</strong> के अनुसार आता है!</span><br/>
    <em>✗ Neither the students nor the teacher was in <strong>their</strong> uniform. (Wrong)</em><br/>
    <em>✓ Neither the students nor the teacher was in <strong>his/her</strong> uniform. (Correct)</em></li>

    <li><span class="lang-en"><strong>(C) When 'each, every, neither, either, anyone, everyone' is the subject:</strong><br/>
    Possessive adjective must be <strong>Third Person Singular (his / her)</strong>, NOT their!</span>
    <span class="lang-hi"><strong>(C) each, every, neither, either, everyone जब कर्ता हों:</strong><br/>
    Possessive रूप हमेशा <strong>his/her (एकवचन)</strong> होगा, their नहीं!</span><br/>
    <em>✗ Everyone should do <strong>their</strong> duty. (Wrong)</em><br/>
    <em>✓ Everyone should do <strong>his</strong> duty. (Correct)</em></li>

    <li><span class="lang-en"><strong>(D) When 'One' is the Subject → Use 'One's':</strong><br/>
    If the indefinite pronoun 'one' is used as a subject, its possessive form must be <strong>one's</strong> (never <em>his</em>)!</span>
    <span class="lang-hi"><strong>(D) जब 'One' कर्ता हो → केवल 'one's' आएगा:</strong><br/>
    'One' के साथ कभी भी <em>his</em> नहीं आता!</span><br/>
    <em>✗ One should do <strong>his</strong> duty sincerely. (Wrong)</em><br/>
    <em>✓ One should do <strong>one's</strong> duty sincerely. (Correct)</em></li>

    <li><span class="lang-en"><strong>(E) Pronoun for different persons combined:</strong><br/>
    1st + 2nd/3rd Person (You and I / He and I) → takes <strong>our</strong>.<br/>
    2nd + 3rd Person (You and he) → takes <strong>your</strong>.</span>
    <span class="lang-hi"><strong>(E) अलग-अलग पुरुष मिलकर:</strong><br/>
    You and I → <strong>our</strong> (हमारा)<br/>
    You and he → <strong>your</strong> (तुम्हारा)</span><br/>
    <em>✓ You and I have brought <strong>our</strong> books.</em><br/>
    <em>✓ You and he have completed <strong>your</strong> work.</em></li>
  </ul>
</div>

<!-- Rule 8 -->
<div class="callout-box alert">
  <h4><span class="lang-en">Rule VIII: Nouns That NEVER Take a Possessive Pronoun</span><span class="lang-hi">नियम 8: जिन संज्ञाओं के पहले Possessive Case नहीं लगाया जाता</span></h4>
  <p><span class="lang-en">A possessive noun or pronoun should NOT be used directly with the following nouns: <strong>separation, leave, excuse, mention, report, pardon, sight, favour</strong>.</span>
  <span class="lang-hi">निम्नलिखित 8 संज्ञाओं के ठीक पहले Possessive pronoun (your, his, my आदि) लगाना व्याकरण की दृष्टि से अशुद्ध है: <strong>separation, leave, excuse, mention, report, pardon, sight, favour</strong>.</span></p>

  <p><strong>Fixed Correct Idiomatic Patterns:</strong></p>
  <ul>
    <li><span class="lang-en">✗ <strong>Your separation</strong> is very painful to me. (Wrong)</span><br/>
        <span class="lang-en">✓ <strong>Separation from you</strong> is very painful to me. (Correct)</span><span class="lang-hi">✓ तुम्हारी जुदाई मेरे लिए बहुत कष्टदायी है।</span></li>
    <li><span class="lang-en">✗ At <strong>his sight</strong> the robbers fled. (Wrong)</span><br/>
        <span class="lang-en">✓ At <strong>the sight of him</strong> the robbers fled. (Correct)</span><span class="lang-hi">✓ उसे देखते ही लुटेरे भाग गए।</span></li>
    <li><span class="lang-en">✗ I beg <strong>your favour</strong>, please. (Wrong)</span><br/>
        <span class="lang-en">✓ I beg <strong>a favour of/from you</strong>, please. (Correct)</span><span class="lang-hi">✓ कृपया मुझ पर यह उपकार/एहसान कीजिए।</span></li>
    <li><span class="lang-en">✗ She made <strong>your mention</strong> yesterday. (Wrong)</span><br/>
        <span class="lang-en">✓ She made <strong>mention of you</strong> yesterday. (Correct)</span><span class="lang-hi">✓ उसने कल तुम्हारा जिक्र किया।</span></li>
  </ul>
</div>

<!-- Rule 9 -->
<div class="callout-box info">
  <h4><span class="lang-en">Rule IX: 'Either / Neither' (For Two) vs 'Anyone / None' (For More Than Two)</span><span class="lang-hi">नियम 9: दो के लिए (Either/Neither) तथा दो से अधिक के लिए (Anyone/None)</span></h4>
  
  <ul>
    <li><span class="lang-en"><strong>For exactly TWO:</strong> Use <strong>Either</strong> (one of the two) and <strong>Neither</strong> (none of the two).</span>
    <span class="lang-hi"><strong>केवल दो के लिए:</strong> <strong>Either</strong> (दोनों में से कोई एक) और <strong>Neither</strong> (दोनों में से कोई भी नहीं) का प्रयोग होता है।</span><br/>
    <em>✗ <strong>Anyone</strong> of his two eyes is defective. → ✓ <strong>Either</strong> of his two eyes is defective.</em><br/>
    <em>✗ <strong>None</strong> of his two arms was injured. → ✓ <strong>Neither</strong> of his two arms was injured.</em></li>

    <li><span class="lang-en"><strong>For MORE THAN TWO:</strong> Use <strong>Anyone / Any</strong> and <strong>None</strong>.</span>
    <span class="lang-hi"><strong>दो से अधिक (3 या अधिक) के लिए:</strong> <strong>Anyone/Any</strong> और <strong>None</strong> का प्रयोग होता है।</span><br/>
    <em>✗ <strong>Either</strong> of his four sons has sold the property. → ✓ <strong>Anyone</strong> of his four sons has sold the property.</em><br/>
    <em>✗ <strong>Neither</strong> of the ten candidates was selected. → ✓ <strong>None</strong> of the ten candidates was selected.</em></li>
  </ul>
</div>

<!-- Rule 10 -->
<div class="callout-box alert">
  <h4><span class="lang-en">Rule X: Pronoun Rules in Question Tags</span><span class="lang-hi">नियम 10: Question Tag में सर्वनाम के अचूक नियम</span></h4>
  <p><span class="lang-en">In a Question Tag, the subject pronoun and auxiliary verb must strictly correspond with the main clause:</span>
  <span class="lang-hi">Question Tag में सर्वनाम और सहायक क्रिया हमेशा मुख्य वाक्य के अनुसार तय होते हैं:</span></p>

  <ul>
    <li><span class="lang-en"><strong>1. Positive Statement → Negative Tag:</strong> <em>"She comes here daily, <strong>doesn't she?</strong>"</em></span></li>
    <li><span class="lang-en"><strong>2. Negative Statement → Positive Tag:</strong> <em>"The boys are not going on picnic, <strong>are they?</strong>"</em></span></li>
    <li><span class="lang-en"><strong>3. Semi-Negative Adverbs (hardly, seldom, barely, scarcely, few, little):</strong><br/>
    These words make the statement negative; hence the tag must be <strong>POSITIVE</strong>!</span>
    <span class="lang-hi">hardly, seldom, few, little जैसे शब्द नकारात्मक अर्थ देते हैं, अतः इनका Tag <strong>सकारात्मक (Positive)</strong> होगा:</span><br/>
    <em>✗ He is seldom absent, isn't he? → ✓ He is seldom absent, <strong>is he?</strong></em><br/>
    <em>✗ Few students are working hard, aren't they? → ✓ Few students are working hard, <strong>are they?</strong></em></li>

    <li><span class="lang-en"><strong>4. Indefinite Pronouns for Persons (everybody, someone, nobody, none, neither):</strong><br/>
    Always take <strong>THEY</strong> as the subject pronoun in the question tag (and plural auxiliary verb)!</span>
    <span class="lang-hi">everybody, nobody, someone आदि के लिए Tag में सर्वनाम <strong>THEY</strong> और बहुवचन क्रिया आती है:</span><br/>
    <em>✓ Everybody can speak English, <strong>can't they?</strong></em><br/>
    <em>✓ No one can speak English, <strong>can they?</strong></em><br/>
    <em>✓ None of your friends like her, <strong>do they?</strong></em></li>

    <li><span class="lang-en"><strong>5. Indefinite Pronouns for Things (everything, nothing, something):</strong><br/>
    Always take <strong>IT</strong> in the tag:</span><br/>
    <em>✓ Everything is settled, <strong>isn't it?</strong></em><br/>
    <em>✓ Nothing is settled, <strong>is it?</strong></em></li>

    <li><span class="lang-en"><strong>6. Imperative Sentence Tags:</strong><br/>
    <em>"Don't close the room, <strong>will you?</strong>"</em><br/>
    <em>"Let us play, <strong>shall we?</strong>"</em> (Let us / Let's takes <strong>shall we</strong>)<br/>
    <em>"Let them stay here, <strong>will you?</strong>"</em> (Let him/them takes <strong>will you</strong>)</span></li>
  </ul>
</div>

<!-- Rule 11 -->
<div class="callout-box info">
  <h4><span class="lang-en">Rule XI: Use of 'Both' (Conjunction & Negative Restrictions)</span><span class="lang-hi">नियम 11: 'Both' का सही प्रयोग (and का साथ व नकारात्मक निषेध)</span></h4>
  <p><span class="lang-en"><strong>Both</strong> is followed strictly by <strong>and</strong> (never by <em>as well as</em>). Furthermore, <strong>Both</strong> is NEVER used in a negative sentence; use <strong>Neither</strong> instead!</span>
  <span class="lang-hi"><strong>Both</strong> के साथ हमेशा <strong>and</strong> आता है (<em>as well as</em> कभी नहीं)। दूसरी महत्वपूर्ण बात: <strong>Both का प्रयोग नकारात्मक वाक्य में वर्जित है</strong>; नकारात्मक के लिए <strong>Neither</strong> का प्रयोग करें!</span></p>

  <p><strong>Examples:</strong></p>
  <ul>
    <li><span class="lang-en">✗ Both you <strong>as well as</strong> my brother are going there. (Wrong)</span><br/>
        <span class="lang-en">✓ Both you <strong>and</strong> my brother are going there. (Correct)</span><span class="lang-hi">✓ तुम और मेरा भाई दोनों वहाँ जा रहे हैं।</span></li>
    <li><span class="lang-en">✗ <strong>Both of them are not</strong> going there. (Grave Grammatical Blunder!)</span><br/>
        <span class="lang-en">✓ <strong>Neither of them is</strong> going there. (Correct)</span><span class="lang-hi">✓ उनमें से कोई भी वहाँ नहीं जा रहा है।</span></li>
  </ul>
</div>

<!-- Rule 12 -->
<div class="callout-box alert">
  <h4><span class="lang-en">Rule XII: 'Which' Instead of 'Who' for Choice / Selection</span><span class="lang-hi">नियम 12: चुनाव या चयन (Choice) दर्शाने के लिए Who की जगह Which</span></h4>
  <p><span class="lang-en">Whenever you refer to a <strong>choice or selection between two or more persons or things</strong>, use <strong>Which</strong> instead of <em>Who</em>!</span>
  <span class="lang-hi">जब दो या दो से अधिक व्यक्तियों या वस्तुओं में से किसी एक को <strong>चुनने (Choice/Selection)</strong> की बात हो, तो <em>Who</em> के स्थान पर <strong>Which</strong> का प्रयोग किया जाता है!</span></p>

  <p><strong>Examples:</strong></p>
  <ul>
    <li><span class="lang-en">✗ Of the two sisters, <strong>who</strong> is the more intelligent? (Wrong)</span><br/>
        <span class="lang-en">✓ Of the two sisters, <strong>which</strong> is the more intelligent? (Correct)</span><span class="lang-hi">✓ दोनों बहनों में से कौन अधिक बुद्धिमान है?</span></li>
    <li><span class="lang-en">✗ <strong>Who</strong> is your father in the crowd? (Wrong)</span><br/>
        <span class="lang-en">✓ <strong>Which</strong> is your father in the crowd? (Correct)</span><span class="lang-hi">✓ भीड़ में तुम्हारे पिताश्री कौन-से हैं?</span></li>
  </ul>
</div>

<!-- Rule 13 -->
<div class="callout-box info">
  <h4><span class="lang-en">Rule XIII: No Noun After a Possessive Pronoun</span><span class="lang-hi">नियम 13: Possessive Pronoun के बाद कभी Noun नहीं आता</span></h4>
  <p><span class="lang-en">Possessive Pronouns (<em>mine, ours, yours, hers, theirs</em>) replace both the possessive adjective and the noun. Hence, placing a noun after them is grammatically redundant.</span>
  <span class="lang-hi">Possessive Pronouns (<em>mine, ours, yours, hers, theirs</em>) स्वयं संज्ञा का स्थान लेते हैं, इसलिए इनके बाद कभी संज्ञा (Noun) नहीं आती।</span></p>

  <ul>
    <li><span class="lang-en">✓ This book is <strong>mine</strong>. (= This is <strong>my book</strong>).</span></li>
    <li><span class="lang-en">✓ This shirt is <strong>yours</strong>. (= This is <strong>your shirt</strong>).</span></li>
    <li><span class="lang-en">✗ <strong>Our</strong> is a populous country. → ✓ <strong>Ours</strong> is a populous country.</span><span class="lang-hi">✓ हमारा देश घनी आबादी वाला देश है।</span></li>
  </ul>
</div>

<!-- Rule 14 -->
<div class="callout-box alert">
  <h4><span class="lang-en">Rule XIV: 'Who' vs 'Whom' in Relative Clauses</span><span class="lang-hi">नियम 14: Relative Clause में Who और Whom का सही प्रयोग</span></h4>
  <p><span class="lang-en"><strong>Who</strong> functions as the <strong>Subject</strong> of the relative clause (does the action). <strong>Whom</strong> functions as the <strong>Object</strong> of the relative clause (receives the action).<br/>
  🔥 <strong>TCS Hack / Shortcut:</strong> Temporarily strike out parenthetical interrupting clauses like <em>"he said", "everybody knows", "I think"</em> to instantly see whether the verb needs a subject or an object!</span>
  <span class="lang-hi"><strong>Who:</strong> कर्ता (Subject) की जगह आता है जो क्रिया करता है। <strong>Whom:</strong> कर्म (Object) की जगह आता है।<br/>
  🔥 <strong>शॉर्टकट ट्रिक:</strong> वाक्य के बीच में आने वाले <em>"he said", "everybody knows"</em> जैसे शब्दों को थोड़ी देर के लिए अनदेखा करें, तुरंत पता चल जाएगा कि क्रिया को कर्ता चाहिए (Who) या कर्म (Whom)।</span></p>

  <p><strong>Exam Drills:</strong></p>
  <ul>
    <li><span class="lang-en">✗ He was talking of the women <strong>who</strong>, he said, he met in America. <br/>
    <em>(Analysis: Strike out 'he said'. We get 'he met [whom] in America'. Object is missing!)</em><br/>
    ✓ He was talking of the women <strong>whom</strong>, he said, he met in America.</span></li>
    <li><span class="lang-en">✗ She is the kind of lady <strong>whom</strong>, everybody knows, is intelligent. <br/>
    <em>(Analysis: Strike out 'everybody knows'. We get '[who] is intelligent'. Subject for 'is' is missing!)</em><br/>
    ✓ She is the kind of lady <strong>who</strong>, everybody knows, is intelligent.</span></li>
  </ul>
</div>

<!-- Rule 15 -->
<div class="callout-box info">
  <h4><span class="lang-en">Rule XV: 'But' Used as a Relative Pronoun (= Who not / Which not)</span><span class="lang-hi">नियम 15: Relative Pronoun के रूप में 'But' (अर्थ: जो... न हो)</span></h4>
  <p><span class="lang-en">In classical literary and SSC exam English, <strong>But</strong> is often used after a negative principal clause as a relative pronoun equivalent to <em>"who did not"</em> or <em>"which does not"</em>.</span>
  <span class="lang-hi">नकारात्मक वाक्यों में <strong>But</strong> का प्रयोग Relative Pronoun की तरह होता है, जिसका अर्थ <em>"जो... न हो" (who did not / which is not)</em> होता है।</span></p>

  <ul>
    <li><span class="lang-en">✓ There was none <strong>but</strong> wept. <em>(= There was no one who did not weep).</em></span><span class="lang-hi">✓ ऐसा कोई नहीं था जो रोया न हो।</span></li>
    <li><span class="lang-en">✓ There is no country <strong>but</strong> is corrupt. <em>(= There is no country which is not corrupt).</em></span><span class="lang-hi">✓ ऐसा कोई देश नहीं जो भ्रष्ट न हो।</span></li>
  </ul>
</div>

<!-- Rule 16 -->
<div class="callout-box alert">
  <h4><span class="lang-en">Rule XVI: Use of 'The Same' as a Pronoun Is Strictly Wrong</span><span class="lang-hi">नियम 16: Pronoun के रूप में 'The same' का प्रयोग पूर्णतः अशुद्ध है</span></h4>
  <p><span class="lang-en">In modern grammar, <strong>'the same'</strong> must NEVER be used in place of personal pronouns like <em>it</em> or <em>them</em>.</span>
  <span class="lang-hi">किसी वस्तु या संज्ञा के स्थान पर सर्वनाम के रूप में <strong>'the same'</strong> लिखना गलत है; इसकी जगह <strong>it</strong> या <strong>them</strong> का प्रयोग करें।</span></p>

  <ul>
    <li><span class="lang-en">✗ I shall give you a book and <strong>the same</strong> is very useful. (Wrong)</span><br/>
        <span class="lang-en">✓ I shall give you a book and <strong>it</strong> is very useful. (Correct)</span><span class="lang-hi">✓ मैं तुम्हें एक किताब दूँगा और वह बहुत उपयोगी है।</span></li>
    <li><span class="lang-en">✗ He bought a house and is living in <strong>the same</strong>. (Wrong)</span><br/>
        <span class="lang-en">✓ He bought a house and is living in <strong>it</strong>. (Correct)</span><span class="lang-hi">✓ उसने एक घर खरीदा और वह उसी में रह रहा है।</span></li>
  </ul>
</div>

<!-- Rule 17 -->
<div class="callout-box info">
  <h4><span class="lang-en">Rule XVII: 'What' Is Used WITHOUT an Antecedent</span><span class="lang-hi">नियम 17: 'What' का प्रयोग बिना किसी पूर्ववर्ती संज्ञा (Antecedent) के होता है</span></h4>
  <p><span class="lang-en"><strong>What</strong> refers to things and means <em>"that which"</em> or <em>"the thing which"</em>. It contains its own antecedent within itself. Therefore, you must NEVER place a noun antecedent before <strong>what</strong>! If a noun antecedent is present, use <strong>which</strong> or <strong>that</strong>.</span>
  <span class="lang-hi"><strong>What</strong> का अर्थ होता है <em>"वह जो"</em>। इसमें पूर्ववर्ती संज्ञा पहले से समाहित होती है। अतः <strong>what</strong> के ठीक पहले कभी कोई संज्ञा (Noun) नहीं आ सकती! यदि पहले संज्ञा दी हो, तो <strong>which</strong> या <strong>that</strong> का प्रयोग करें।</span></p>

  <p><strong>Examples:</strong></p>
  <ul>
    <li><span class="lang-en">✓ It is incredible <strong>what</strong> she said. (Correct — no noun before 'what').</span><span class="lang-hi">✓ उसने जो कहा, वह अविश्वसनीय है।</span></li>
    <li><span class="lang-en">✓ I don't believe in <strong>what</strong> you say. (Correct).</span><span class="lang-hi">✓ तुम जो कहते हो, मैं उस पर विश्वास नहीं करता।</span></li>
    <li><span class="lang-en">✗ I don't believe in <strong>the words what</strong> she uttered. (Wrong — 'words' is an antecedent noun!)</span><br/>
        <span class="lang-en">✓ I don't believe in <strong>the words that/which</strong> she uttered. (Correct).</span><span class="lang-hi">✓ मैं उन शब्दों पर विश्वास नहीं करता जो उसने कहे।</span></li>
  </ul>
</div>""")

    # 6. Quick Revision Summary
    html.append("""<h2><span class="lang-en">6. Quick Revision: Top 8 Pronoun Traps</span><span class="lang-hi">6. त्वरित दोहराव: सर्वनाम के 8 सबसे बड़े परीक्षा जाल</span></h2>

<table class="notes-table">
  <thead>
    <tr>
      <th>Exam Trap (नियम)</th>
      <th>Incorrect (अशुद्ध रूप)</th>
      <th>Correct (शुद्ध रूप)</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td><strong>Verbs with Reflexive</strong></td>
      <td>He absented from the meeting.</td>
      <td>He absented <strong>himself</strong> from the meeting.</td>
    </tr>
    <tr>
      <td><strong>Verbs without Reflexive</strong></td>
      <td>He hid himself in the closet.</td>
      <td>He <strong>hid</strong> in the closet.</td>
    </tr>
    <tr>
      <td><strong>Order of Pronouns (Normal)</strong></td>
      <td>I, you and he will go.</td>
      <td><strong>You, he and I</strong> will go (231 rule).</td>
    </tr>
    <tr>
      <td><strong>Preposition + Objective</strong></td>
      <td>Between you and I.</td>
      <td>Between you and <strong>me</strong>.</td>
    </tr>
    <tr>
      <td><strong>One as Subject</strong></td>
      <td>One must respect his parents.</td>
      <td>One must respect <strong>one's</strong> parents.</td>
    </tr>
    <tr>
      <td><strong>Choice between Persons</strong></td>
      <td>Who of the two sisters is taller?</td>
      <td><strong>Which</strong> of the two sisters is taller?</td>
    </tr>
    <tr>
      <td><strong>Negative with Both</strong></td>
      <td>Both of them did not come.</td>
      <td><strong>Neither</strong> of them came.</td>
    </tr>
    <tr>
      <td><strong>Antecedent with What</strong></td>
      <td>The advice what he gave was good.</td>
      <td>The advice <strong>that/which</strong> he gave was good.</td>
    </tr>
  </tbody>
</table>""")

    # 7. 15 Interactive Practice MCQs
    html.append("""<h2><span class="lang-en">7. Interactive Practice MCQs (Based on Pronoun Rules)</span><span class="lang-hi">7. इंटरैक्टिव अभ्यास प्रश्न (सर्वनाम नियमों पर आधारित)</span></h2>
<p><span class="lang-en">Test your understanding of the 17 Pronoun rules. Click an option for instant answer feedback:</span><span class="lang-hi">सर्वनाम के 17 नियमों पर आधारित अभ्यास प्रश्न। सही विकल्प जानने के लिए ऑप्शन पर क्लिक करें:</span></p>""")

    mcqs = [
        {
            "num": 1,
            "q_en": "You must avail _______ of this golden scholarship opportunity.",
            "q_hi": "You must avail _______ of this golden scholarship opportunity.",
            "options": [
                ("yourself", True),
                ("you", False),
                ("yours", False),
                ("no word needed", False),
            ]
        },
        {
            "num": 2,
            "q_en": "Find the error: 'Myself (A) / will manage (B) / all the event arrangements (C) / No error (D)'",
            "q_hi": "'Myself (A) / will manage (B) / all the event arrangements (C) / No error (D)' में त्रुटि पहचानें:",
            "options": [
                ("A (Change 'Myself' to 'I')", True),
                ("B", False),
                ("C", False),
                ("D (No error)", False),
            ]
        },
        {
            "num": 3,
            "q_en": "It was _______ who alerted the police before the burglary took place.",
            "q_hi": "It was _______ who alerted the police before the burglary took place.",
            "options": [
                ("he", True),
                ("him", False),
                ("himself", False),
                ("his", False),
            ]
        },
        {
            "num": 4,
            "q_en": "Between you and _______, the new project manager is extremely competent.",
            "q_hi": "Between you and _______, the new project manager is extremely competent.",
            "options": [
                ("me", True),
                ("I", False),
                ("myself", False),
                ("mine", False),
            ]
        },
        {
            "num": 5,
            "q_en": "Choose the grammatically correct sequence of pronouns for a pleasant event:",
            "q_hi": "सकारात्मक वाक्य के लिए सर्वनामों का सही क्रम चुनें:",
            "options": [
                ("You, he and I shall visit the historical museum.", True),
                ("I, you and he shall visit the historical museum.", False),
                ("He, you and I shall visit the historical museum.", False),
                ("You, I and he shall visit the historical museum.", False),
            ]
        },
        {
            "num": 6,
            "q_en": "Choose the correct sequence of pronouns when admitting a mistake or guilt:",
            "q_hi": "भूल या दोष स्वीकार करने के लिए सर्वनामों का सही क्रम चुनें:",
            "options": [
                ("I, you and he are to blame for this loss.", True),
                ("You, he and I are to blame for this loss.", False),
                ("He, you and I are to blame for this loss.", False),
                ("You, I and he are to blame for this loss.", False),
            ]
        },
        {
            "num": 7,
            "q_en": "The Principal as well as the teachers has submitted _______ report to the board.",
            "q_hi": "The Principal as well as the teachers has submitted _______ report to the board.",
            "options": [
                ("his", True),
                ("their", False),
                ("our", False),
                ("its", False),
            ]
        },
        {
            "num": 8,
            "q_en": "One must always be faithful to _______ promised words and commitments.",
            "q_hi": "One must always be faithful to _______ promised words and commitments.",
            "options": [
                ("one's", True),
                ("his", False),
                ("their", False),
                ("oneself", False),
            ]
        },
        {
            "num": 9,
            "q_en": "Both the brothers were arguing fiercely with _______ over the parental land.",
            "q_hi": "Both the brothers were arguing fiercely with _______ over the parental land.",
            "options": [
                ("each other", True),
                ("one another", False),
                ("themselves", False),
                ("one other", False),
            ]
        },
        {
            "num": 10,
            "q_en": "_______ of his five sons agreed to look after the ancestral farm.",
            "q_hi": "_______ of his five sons agreed to look after the ancestral farm.",
            "options": [
                ("None", True),
                ("Neither", False),
                ("Either", False),
                ("Each other", False),
            ]
        },
        {
            "num": 11,
            "q_en": "Everybody in the conference room was wearing a badge, _______?",
            "q_hi": "Everybody in the conference room was wearing a badge, _______?",
            "options": [
                ("weren't they?", True),
                ("wasn't he?", False),
                ("wasn't it?", False),
                ("didn't they?", False),
            ]
        },
        {
            "num": 12,
            "q_en": "He is seldom late for office meetings, _______?",
            "q_hi": "He is seldom late for office meetings, _______?",
            "options": [
                ("is he?", True),
                ("isn't he?", False),
                ("doesn't he?", False),
                ("does he?", False),
            ]
        },
        {
            "num": 13,
            "q_en": "Find the grammatically correct sentence:",
            "q_hi": "व्याकरण की दृष्टि से शुद्ध वाक्य चुनें:",
            "options": [
                ("Neither of them is going to the conference.", True),
                ("Both of them are not going to the conference.", False),
                ("Both you as well as he are invited.", False),
                ("Either of the four candidates won the award.", False),
            ]
        },
        {
            "num": 14,
            "q_en": "_______ of the two applicants is more suitable for this senior post?",
            "q_hi": "दो आवेदकों में से चयन दर्शाने के लिए सही शब्द भरें:",
            "options": [
                ("Which", True),
                ("Who", False),
                ("Whom", False),
                ("Whose", False),
            ]
        },
        {
            "num": 15,
            "q_en": "She is the talented artist _______, everyone believes, will win the national award.",
            "q_hi": "She is the talented artist _______, everyone believes, will win the national award.",
            "options": [
                ("who", True),
                ("whom", False),
                ("which", False),
                ("whose", False),
            ]
        }
    ]

    for m in mcqs:
        opt_html = []
        letters = ["A", "B", "C", "D"]
        for idx, (txt, is_corr) in enumerate(m["options"]):
            corr_str = "true" if is_corr else "false"
            opt_html.append(f"""    <div class="quiz-option" data-is-correct="{corr_str}"><span class="quiz-option-key">{letters[idx]}</span> {txt}</div>""")
        
        opts_rendered = "\n".join(opt_html)

        html.append(f"""<div class="quiz-card">
  <div class="quiz-badge">Practice Question {m['num']}</div>
  <div class="quiz-question"><span class="lang-en">{m['q_en']}</span><span class="lang-hi">{m['q_hi']}</span></div>
  <div class="quiz-options">
{opts_rendered}
  </div>
</div>""")

    return "\n\n".join(html)

def extract_pure_english(bilingual_html):
    # Remove lang-hi divs and spans
    h = re.sub(r'<div class="lang-hi">.*?</div>\s*', '', bilingual_html, flags=re.DOTALL)
    h = re.sub(r'<span class="lang-hi">.*?</span>\s*', '', h, flags=re.DOTALL)
    # Unwrap lang-en
    h = re.sub(r'<div class="lang-en">\s*<div class="lang-card-en">(.*?)</div>\s*</div>', r'\1', h, flags=re.DOTALL)
    h = re.sub(r'<span class="lang-en">(.*?)</span>', r'\1', h, flags=re.DOTALL)
    return h

def extract_pure_hindi(bilingual_html):
    # Remove lang-en divs and spans
    h = re.sub(r'<div class="lang-en">.*?</div>\s*', '', bilingual_html, flags=re.DOTALL)
    h = re.sub(r'<span class="lang-en">.*?</span>\s*', '', h, flags=re.DOTALL)
    # Unwrap lang-hi
    h = re.sub(r'<div class="lang-hi">\s*<div class="lang-card-hi">(.*?)</div>\s*</div>', r'\1', h, flags=re.DOTALL)
    h = re.sub(r'<span class="lang-hi">(.*?)</span>', r'\1', h, flags=re.DOTALL)
    return h

if __name__ == "__main__":
    content = build_pronoun_content()
    en = extract_pure_english(content)
    hi = extract_pure_hindi(content)
    print(f"Pronoun HTML built! Total length: {len(content)}, EN: {len(en)}, HI: {len(hi)}")
