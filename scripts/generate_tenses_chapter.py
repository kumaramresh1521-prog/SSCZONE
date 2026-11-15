# -*- coding: utf-8 -*-
"""
Generates Chapter 2: Tenses (काल)
Produces: content (bilingual), english_content, and hindi_content
"""

import json
import re

def build_tenses_content():
    html = []

    # 1. Introduction
    html.append("""<h2><span class="lang-en">1. What is a Tense? (Time vs State of Action)</span><span class="lang-hi">1. काल (Tense) क्या है? (समय एवं कार्य की अवस्था)</span></h2>

<div class="lang-en">
  <div class="lang-card-en">
    <p>A <strong>Tense</strong> is defined as that form of a verb which indicates two fundamental dimensions:</p>
    <ol>
      <li><strong>The Time of an Action:</strong> <em>When</em> the action takes place (Present, Past, or Future).</li>
      <li><strong>The State / Aspect of an Action:</strong> <em>How</em> the action exists (habitual, in progress, fully completed, or continuing over a period of time).</li>
    </ol>
    <p><strong>(A) Time of an Action:</strong></p>
    <ul>
      <li><em>Present:</em> He goes to school. (Action relates to present time).</li>
      <li><em>Past:</em> He went to school. (Action relates to past time).</li>
      <li><em>Future:</em> He will go to school. (Action relates to future time).</li>
    </ul>
    <p><strong>(B) State / Function of an Action:</strong></p>
    <ul>
      <li><em>Habitual (Indefinite):</em> I write letters regularly. (General habit).</li>
      <li><em>Progressive (Continuous):</em> I am writing a letter. (Ongoing action right now).</li>
      <li><em>Preceding (Perfect):</em> I have just written a letter. (Completed before now, connected to present).</li>
      <li><em>Time Expression (Perfect Continuous):</em> I have been writing a letter for two hours. (Began in past, still continuing).</li>
    </ul>
  </div>
</div>

<div class="lang-hi">
  <div class="lang-card-hi">
    <p><strong>काल (Tense)</strong> क्रिया का वह रूप है जो केवल समय (Time) ही नहीं बताता, बल्कि कार्य की <strong>अवस्था (State of Action)</strong> भी दर्शाता है:</p>
    <ol>
      <li><strong>काम का समय (Time):</strong> कार्य कब हुआ — वर्तमान (Present), भूतकाल (Past), या भविष्य (Future)।</li>
      <li><strong>काम की अवस्था (State/Aspect):</strong> कार्य किस हाल में है — नियमित आदत (Habitual), चालू है (Progressive), पूरा हो चुका है (Preceding/Perfect), या किसी समय से जारी है (Time Expression)।</li>
    </ol>
    <p>प्रत्येक मुख्य काल (Present, Past, Future) के चार रूप होते हैं, जिससे अंग्रेजी व्याकरण में कुल <strong>12 Tenses</strong> बनते हैं।</p>
  </div>
</div>

<div class="callout-box info">
  <p><strong>⏱️ The 3 Time Frames / समय के तीन ढाँचे:</strong><br/>
  <span class="lang-en">
    1. <strong>Point of Time:</strong> A specific exact moment (e.g., in 1947, on Monday, at 7:00 PM).<br/>
    2. <strong>Period of Time:</strong> A duration without fixed start point (e.g., for ten years, from Monday to Saturday).<br/>
    3. <strong>Expression of Time:</strong> Combination of point and duration (e.g., winter 1950, since childhood).
  </span>
  <span class="lang-hi">
    1. <strong>निश्चित बिंदु-समय (Point of Time):</strong> एक निश्चित समय बिंदु (जैसे: 1947 में, सोमवार को, सुबह 7 बजे)।<br/>
    2. <strong>अवधि (Period of Time):</strong> समय का अंतराल (जैसे: 10 वर्षों के लिए, दो घंटे से)।<br/>
    3. <strong>बिंदु + अवधि (Expression of Time):</strong> जैसे: 1947 की सर्दी, बचपन से।
  </span></p>
</div>""")

    # 2. Present Indefinite Tense
    html.append("""<h2><span class="lang-en">2. The Present Indefinite Tense (Simple Present)</span><span class="lang-hi">2. सामान्य वर्तमान काल (Present Indefinite Tense)</span></h2>

<div class="lang-en">
  <div class="lang-card-en">
    <p><strong>Basic Sentence Structure:</strong></p>
    <ul>
      <li><em>Affirmative:</em> <code>Subject + V1 (s/es with 3rd person singular) + Object</code></li>
      <li><em>Negative:</em> <code>Subject + do/does not + V1 + Object</code></li>
      <li><em>Interrogative:</em> <code>Do/Does + Subject + V1 + Object?</code></li>
    </ul>

    <p><strong>Core Usages:</strong></p>
    <ol>
      <li><strong>Habits, Customs, Routines & Repeated Actions:</strong> Expressed with Adverbs of Frequency: <em>often, seldom, usually, never, occasionally, sometimes, normally, generally, always, frequently, rarely, daily</em>.<br/>
      <em>Example:</em> "The old lady goes for a walk in the morning daily." / "Suhani always comes in time."</li>
      <li><strong>Permanent Nature & Eternal Scientific Principles (Universal Truths):</strong><br/>
      <em>Example:</em> "Water boils at 100°C." / "Rivers freeze at high altitude." / "Plants prepare their own food."</li>
      <li><strong>Historical Present (Dramatic Narration):</strong> Used by commentators and storytellers to make past events vivid.<br/>
      <em>Example:</em> "Now Netaji enters and addresses the Indian soldiers."</li>
      <li><strong>Fixed Future Arrangement / Timetable:</strong> Official schedules and planned future events.<br/>
      <em>Example:</em> "The Prime Minister arrives from New York tomorrow." / "He leaves for his new job next week."</li>
    </ol>
  </div>
</div>

<div class="lang-hi">
  <div class="lang-card-hi">
    <p><strong>संरचना (Structure):</strong></p>
    <ul>
      <li>सकारात्मक: <code>Subject + V1 (एकवचन कर्ता के साथ s/es) + Object</code> (He writes / They write)</li>
      <li>नकारात्मक: <code>Subject + do/does not + V1 + Object</code> (He does not write)</li>
    </ul>

    <p><strong>प्रमुख उपयोग:</strong></p>
    <ol>
      <li><strong>आदत, दिनचर्या व बार-बार होने वाले काम:</strong> इसके साथ Adverbs of Frequency आते हैं: <em>often (अक्सर), seldom (शायद ही कभी), usually (आमतौर पर), never (कभी नहीं), always (हमेशा), daily (रोज़)</em> आदि।</li>
      <li><strong>सार्वभौमिक एवं वैज्ञानिक सत्य (Universal Truths):</strong> जो बातें हमेशा सच रहती हैं, वे सदा Present Indefinite में लिखी जाती हैं: <em>"Water boils at 100°C."</em> (पानी 100°C पर उबलता है)।</li>
      <li><strong>ऐतिहासिक वर्तमान (Historical Present):</strong> बीती घटना को आँखों के सामने जीवंत सुनाने हेतु: <em>"Now, Arjun shoots arrows at Bhishma."</em></li>
      <li><strong>निश्चित भविष्य की समय-सारणी (Future Arrangement):</strong> पक्के कार्यक्रम वाले भविष्य के कार्य हेतु: <em>"The train leaves at 5:00 PM tomorrow."</em></li>
    </ol>
  </div>
</div>""")

    # 3. Present Continuous & Stative Verbs
    html.append("""<h2><span class="lang-en">3. Present Continuous Tense & The Stative Verbs Master List</span><span class="lang-hi">3. चालू वर्तमान काल एवं Stative Verbs (जो क्रियाएँ -ing में नहीं आतीं)</span></h2>

<div class="lang-en">
  <div class="lang-card-en">
    <p><strong>Structure:</strong> <code>Subject + is/am/are + V-ing + Object</code></p>
    <p><strong>Primary Functions:</strong></p>
    <ul>
      <li><strong>Action in Progress:</strong> Action happening at the moment of speaking (temporary nature): <em>"It is raining outside." / "She is swimming in the river."</em></li>
      <li><strong>Near Future Definite Plan:</strong> <em>"I am going to the cinema tomorrow." / "She is coming next week."</em></li>
      <li><strong>With 'Always' (Expressing Irritation / Complaint):</strong> When <em>always</em> is used with continuous tense, it indicates annoying behavior: <em>"She is always nagging her children." / "He is always praising his friends."</em></li>
    </ul>

    <p><strong>🔥 Stative Verbs (Non-Progressive Verbs):</strong><br/>
    Certain verbs describe a <em>state, condition, perception, or feeling</em> rather than a dynamic physical activity. These verbs <strong>CANNOT be used in continuous (-ing) tenses</strong> under normal circumstances!</p>
  </div>
</div>

<div class="lang-hi">
  <div class="lang-card-hi">
    <p><strong>संरचना:</strong> <code>Subject + is/am/are + V-ing + Object</code></p>
    <p><strong>प्रमुख उपयोग:</strong></p>
    <ul>
      <li>बोलते समय जारी कार्य: <em>"It is raining outside."</em> (बाहर बारिश हो रही है)।</li>
      <li>निकट भविष्य की पक्की योजना: <em>"I am meeting the doctor tomorrow."</em></li>
      <li>'always' के साथ शिकायत या नाराजगी का भाव: <em>"He is always praising his friends."</em> (वह हमेशा अपने दोस्तों की तारीफ ही करता रहता है)।</li>
    </ul>

    <p><strong>🔥 Stative Verbs का सबसे बड़ा नियम:</strong><br/>
    जो क्रियाएं कोई शारीरिक काम नहीं, बल्कि <em>अवस्था (State), इंद्रिय-बोध (Perception), स्वामित्व (Possession) या मानसिक भाव</em> दर्शाती हैं, उनका <strong>Continuous (-ing) रूप नहीं बनता</strong>! इन्हें सदा Simple Present में लिखा जाता है।</p>
  </div>
</div>

<table class="notes-table">
  <thead>
    <tr>
      <th>Group (श्रेणी)</th>
      <th>Stative Verbs (प्रमुख क्रियाएँ)</th>
      <th>Incorrect (-ing) ✗</th>
      <th>Correct Form (Simple Present) ✓</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td><strong>1. Verbs of Perception (इंद्रिय-बोध)</strong></td>
      <td>see, hear, smell, taste, prefer, please</td>
      <td>We are hearing the bell. ✗</td>
      <td>We <strong>hear</strong> the bell. ✓</td>
    </tr>
    <tr>
      <td><strong>2. Verbs of Thinking (सोच-विचार)</strong></td>
      <td>think, know, mean, mind, understand, suppose</td>
      <td>I am not meaning this. ✗</td>
      <td>I don't <strong>mean</strong> this. ✓</td>
    </tr>
    <tr>
      <td><strong>3. Verbs of Possession (स्वामित्व)</strong></td>
      <td>own, have, belong, possess, contain, comprise</td>
      <td>He is owning a luxury car. ✗<br/>This house is belonging to me. ✗</td>
      <td>He <strong>owns</strong> a luxury car. ✓<br/>This house <strong>belongs</strong> to me. ✓</td>
    </tr>
    <tr>
      <td><strong>4. Feelings & Emotions (भाव / मनोदशा)</strong></td>
      <td>love, hate, like, want, wish, desire, believe</td>
      <td>I am not hating him. ✗</td>
      <td>I don't <strong>hate</strong> him. ✓</td>
    </tr>
    <tr>
      <td><strong>5. Verbs in General (सामान्य अवस्था)</strong></td>
      <td>look, seem, appear, resemble, cost, require, stand</td>
      <td>The book is containing good content. ✗</td>
      <td>The book <strong>contains</strong> good content. ✓</td>
    </tr>
  </tbody>
</table>

<div class="callout-box alert">
  <h4><span class="lang-en">Stative vs Progressive: Contrast of Meaning</span><span class="lang-hi">Stative बनाम Progressive: अर्थ का महत्वपूर्ण अंतर</span></h4>
  <p><span class="lang-en">Some verbs can be used in the -ing form ONLY when their meaning shifts from a state to an active physical action:</span>
  <span class="lang-hi">कुछ क्रियाएं -ing में तभी आ सकती हैं जब उनका अर्थ 'अवस्था' से बदलकर 'सक्रिय कार्य' हो जाए:</span></p>
  <ul>
    <li><span class="lang-en"><em>Smell (State):</em> The rose <strong>smells</strong> sweet. (गुलाब की खुशबू मीठी है — Stative)</span><br/>
        <span class="lang-en"><em>Smell (Active Action):</em> She is <strong>smelling</strong> a black rose. (वह काला गुलाब सूँघ रही है — Progressive)</span></li>
    <li><span class="lang-en"><em>Have (Possession):</em> She <strong>has</strong> a large house. (उसके पास बड़ा घर है — Stative)</span><br/>
        <span class="lang-en"><em>Have (Eating/Action):</em> She is <strong>having</strong> lunch now. (वह अभी खाना खा रही है — Progressive)</span></li>
    <li><span class="lang-en"><em>Think (Opinion):</em> I <strong>think</strong> she is honest. (मुझे लगता है वह ईमानदार है — Stative)</span><br/>
        <span class="lang-en"><em>Think (Mental Planning):</em> I am <strong>thinking</strong> of moving to Delhi. (मैं दिल्ली जाने की योजना बना रहा हूँ — Progressive)</span></li>
  </ul>
</div>""")

    # 4. Present Perfect & Golden Rules
    html.append("""<h2><span class="lang-en">4. Present Perfect Tense & The 2 Cardinal Rules</span><span class="lang-hi">4. पूर्ण वर्तमान काल (Present Perfect) एवं 2 अचूक नियम</span></h2>

<div class="lang-en">
  <div class="lang-card-en">
    <p><strong>Structure:</strong> <code>Subject + has/have + V3 + Object</code></p>
    <p>The <strong>Present Perfect Tense</strong> represents an action completed in the past that has a direct, active link with the present moment.</p>
    <p><strong>Common Signal Adverbs:</strong> <em>ever, just, already, recently, lately, yet, so far, till now, by the time</em>.</p>
    <ul>
      <li><em>"I have <strong>just</strong> finished my breakfast."</em> (अभी-अभी खाया है).</li>
      <li><em>"We have seen this movie <strong>already</strong>."</em> (पहले ही देख चुके हैं).</li>
      <li><em>"We haven't seen Reeta <strong>lately</strong>."</em> (इधर हाल में नहीं देखा).</li>
    </ul>
  </div>
</div>

<div class="lang-hi">
  <div class="lang-card-hi">
    <p><strong>संरचना:</strong> <code>Subject + has/have + V3 + Object</code></p>
    <p>यह काल भूतकाल और वर्तमान का संगम है — कार्य भले ही अतीत में पूरा हुआ हो, लेकिन उसका प्रभाव या संबंध वर्तमान से जुड़ा रहता है।</p>
    <p><strong>पहचान वाले शब्द:</strong> <em>just (अभी-अभी), already (पहले ही), recently/lately (हाल ही में), yet/so far (अब तक - नकारात्मक वाक्यों में)</em>।</p>
  </div>
</div>

<div class="callout-box info">
  <h4><span class="lang-en">Golden Rule 1: Present Perfect + Definite Past Point of Time = SIMPLE PAST</span><span class="lang-hi">स्वर्णिम नियम 1: Present Perfect + निश्चित बीता समय = SIMPLE PAST</span></h4>
  <p><span class="lang-en">If a sentence contains a definite finished point of time in the past (such as <strong>yesterday, two days ago, last year, in 1947, the other day, formerly</strong>), you MUST use <strong>Simple Past (V2)</strong>, NEVER Present Perfect (has/have + V3)!</span>
  <span class="lang-hi">यदि वाक्य में बीते हुए समय का कोई निश्चित शब्द (जैसे <strong>yesterday, ago, last week, in 2020, the other day</strong>) दिया हो, तो वहाँ कभी भी Present Perfect (has/have + V3) नहीं आता, बल्कि हमेशा <strong>Simple Past (V2)</strong> आता है!</span></p>

  <p><strong>Top Recurring SSC Questions:</strong></p>
  <ul>
    <li><span class="lang-en">✗ She <strong>has returned</strong> two days ago. (Incorrect — omit 'has')</span><br/>
        <span class="lang-en">✓ She <strong>returned</strong> two days ago. (Correct — Simple Past)</span><span class="lang-hi">✓ वह दो दिन पहले लौटी।</span></li>
    <li><span class="lang-en">✗ I <strong>have met</strong> your brother yesterday. (Incorrect — omit 'have')</span><br/>
        <span class="lang-en">✓ I <strong>met</strong> your brother yesterday. (Correct)</span><span class="lang-hi">✓ मैं कल तुम्हारे भाई से मिला।</span></li>
    <li><span class="lang-en">✗ India <strong>has won</strong> independence in 1947. (Incorrect)</span><br/>
        <span class="lang-en">✓ India <strong>won</strong> independence in 1947. (Correct)</span></li>
  </ul>
</div>

<div class="callout-box alert">
  <h4><span class="lang-en">Golden Rule 2: Present Indefinite + Time Expression = PRESENT PERFECT</span><span class="lang-hi">स्वर्णिम नियम 2: वर्तमान क्रिया + अवधि/बिंदु-समय (Since/For) = PRESENT PERFECT</span></h4>
  <p><span class="lang-en">When a state or action started in the past and continues into the present with <strong>since, for, how long, whole, all along</strong>, you cannot use Simple Present; you MUST use <strong>Present Perfect</strong>!</span>
  <span class="lang-hi">यदि कोई स्थिति अतीत से शुरू होकर अब तक बनी हुई है और साथ में <strong>since / for / how long</strong> लगा है, तो वहाँ Simple Present नहीं, बल्कि <strong>Present Perfect</strong> आएगा:</span></p>

  <ul>
    <li><span class="lang-en">✗ He <strong>knows</strong> me for two years. (Wrong)</span><br/>
        <span class="lang-en">✓ He <strong>has known</strong> me for two years. (Correct)</span><span class="lang-hi">✓ वह मुझे दो साल से जानता है।</span></li>
    <li><span class="lang-en">✗ She <strong>owns</strong> this parlour since 2002. (Wrong)</span><br/>
        <span class="lang-en">✓ She <strong>has owned</strong> this parlour since 2002. (Correct)</span><span class="lang-hi">✓ वह 2002 से इस पार्लर की मालकिन है।</span></li>
  </ul>
</div>""")

    # 5. Past Tenses & Past Perfect (Past of the Past)
    html.append("""<h2><span class="lang-en">5. Past Tenses & Past Perfect (The 'Past of the Past' Rule)</span><span class="lang-hi">5. भूतकाल एवं Past Perfect ('भूतकाल का भूतकाल' नियम)</span></h2>

<div class="lang-en">
  <div class="lang-card-en">
    <p><strong>A. Past Indefinite (Simple Past):</strong> <code>Subject + V2 + Object</code></p>
    <ul>
      <li>Used for completed past actions with past time markers: <em>"She bought a car two years ago."</em></li>
      <li>Used for past habits: <em>"He always carried an umbrella." / "I used to go to Delhi by train."</em></li>
    </ul>

    <p><strong>B. Past Continuous:</strong> <code>Subject + was/were + V-ing + Object</code></p>
    <ul>
      <li>Action in progress in the past: <em>"It was still raining when I reached there."</em></li>
    </ul>

    <p><strong>C. Past Perfect (had + V3):</strong></p>
    <p>Past Perfect does NOT simply mean past; it means <strong>the earlier of two past actions</strong>!</p>
  </div>
</div>

<div class="lang-hi">
  <div class="lang-card-hi">
    <p><strong>A. Past Indefinite (Simple Past):</strong> <code>Subject + V2 + Object</code><br/>
    बीते समय में पूरा हुआ एकल कार्य या पुरानी आदतें (used to / would): <em>"I met him yesterday."</em></p>

    <p><strong>B. Past Perfect (had + V3) — परीक्षा का सबसे महत्वपूर्ण नियम:</strong></p>
    <p>जब भूतकाल में <strong>दो कार्य</strong> हुए हों, तो जो कार्य <strong>पहले पूरा हुआ</strong>, उसे <strong>Past Perfect (had + V3)</strong> में लिखा जाता है, और जो कार्य <strong>बाद में हुआ</strong>, उसे <strong>Simple Past (V2)</strong> में लिखा जाता है!</p>
  </div>
</div>

<div class="callout-box info">
  <h4><span class="lang-en">The Two Past Actions Formula (Before / After)</span><span class="lang-hi">दो बीते कार्यों का अचूक सूत्र (Before / After)</span></h4>
  <div class="formula-card">
    <code>1st Action (Earlier) → Past Perfect [had + V3]</code><br/>
    <code>2nd Action (Later)   → Simple Past [V2]</code>
  </div>
  <ul>
    <li><span class="lang-en">✓ The patient <strong>had died</strong> before the doctor <strong>arrived</strong>.</span><span class="lang-hi">✓ डॉक्टर के आने से पहले मरीज मर चुका था। (मरीज पहले मरा = had died; डॉक्टर बाद में आया = arrived)।</span></li>
    <li><span class="lang-en">✓ The train <strong>had left</strong> before we <strong>reached</strong> the station.</span><span class="lang-hi">✓ हमारे स्टेशन पहुँचने से पहले ट्रेन जा चुकी थी।</span></li>
    <li><span class="lang-en">✓ I finished the book after I <strong>had returned</strong> from college.</span><span class="lang-hi">✓ कॉलेज से लौटने के बाद मैंने किताब खत्म की।</span></li>
    <li><span class="lang-en">⚡ <em>Single Action Blunder:</em> Never use Past Perfect for a single standalone past action without an earlier reference point!<br/>
    ✗ I <strong>had gone</strong> to Delhi last week. (Incorrect)<br/>
    ✓ I <strong>went</strong> to Delhi last week. (Correct — Simple Past)</span></li>
  </ul>
</div>

<div class="callout-box alert">
  <h4><span class="lang-en">Unfulfilled Wishes / Intentions with Past Perfect</span><span class="lang-hi">अधूरी इच्छाएं या योजनाएं (Unfulfilled Intentions)</span></h4>
  <p><span class="lang-en">When verbs like <strong>want, hope, expect, think, suppose, intend</strong> are used with <code>had + V3</code>, it indicates that the action was desired or planned, but <strong>DID NOT take place</strong>!</span>
  <span class="lang-hi">जब <em>want, hope, expect, intend</em> जैसी क्रियाओं के साथ <code>had + V3</code> का प्रयोग होता है, तो इसका अर्थ होता है कि वह इच्छा या योजना <strong>पूरी नहीं हो सकी</strong>:</span></p>
  <ul>
    <li><span class="lang-en">✓ I <strong>had wanted</strong> to help my brother. <em>(Meaning: but I could not help).</em></span><span class="lang-hi">✓ मैं अपने भाई की मदद करना चाहता था (पर कर न सका)।</span></li>
    <li><span class="lang-en">✓ I <strong>had expected</strong> to pass the exam. <em>(Meaning: but I did not pass).</em></span><span class="lang-hi">✓ मुझे परीक्षा पास करने की उम्मीद थी (पर पास न हुआ)।</span></li>
    <li><span class="lang-en">✓ Vishal <strong>had intended</strong> to set up his own business. <em>(Meaning: but could not).</em></span><span class="lang-hi">✓ विशाल का अपना व्यवसाय शुरू करने का इरादा था (पर न कर सका)।</span></li>
  </ul>
</div>""")

    # 6. Future Tenses & Shall vs Will
    html.append("""<h2><span class="lang-en">6. Future Tenses & The Nuance of Shall vs Will</span><span class="lang-hi">6. भविष्यत् काल एवं Shall बनाम Will का अचूक नियम</span></h2>

<div class="lang-en">
  <div class="lang-card-en">
    <p><strong>Structure:</strong></p>
    <ul>
      <li><em>Future Indefinite:</em> <code>Subject + will/shall + V1</code> (They will come here shortly).</li>
      <li><em>Future Continuous:</em> <code>Subject + will/shall be + V-ing</code> (She will be waiting for me when I reach).</li>
      <li><em>Future Perfect:</em> <code>Subject + will/shall have + V3</code> (She will have prepared food before I reach home).</li>
    </ul>

    <p><strong>The Shall vs Will Rule (Normal vs Emphatic/Modal):</strong></p>
    <ul>
      <li><strong>Ordinary / Neutral Future:</strong> Use <strong>Shall</strong> with 1st Person (<em>I, We</em>); Use <strong>Will</strong> with 2nd & 3rd Person (<em>You, He, She, They</em>).</li>
      <li><strong>Determination, Promise, Threat, Order, or Official Duty:</strong> The rule is <strong>REVERSED</strong>!
        <ul>
          <li>Use <strong>Will</strong> with <em>I, We</em> (e.g., <em>"I <strong>will</strong> help my brother."</em> — Firm determination).</li>
          <li>Use <strong>Shall</strong> with <em>You, He, They</em> (e.g., <em>"You <strong>shall</strong> not move."</em> — Strict order; <em>"They <strong>shall</strong> be rewarded."</em> — Solemn promise).</li>
        </ul>
      </li>
    </ul>
  </div>
</div>

<div class="lang-hi">
  <div class="lang-card-hi">
    <p><strong>Shall बनाम Will का नियम:</strong></p>
    <ul>
      <li><strong>साधारण भविष्य (General Future):</strong> I / We के साथ <strong>shall</strong>; You / He / She / They के साथ <strong>will</strong> आता है।<br/>
      <em>"I shall go to Delhi."</em> (मैं दिल्ली जाऊँगा — जा भी सकता हूँ, नहीं भी)।</li>
      <li><strong>आदेश, वादा, दृढ़ निश्चय, कर्तव्य या धमकी (Determination/Order/Promise):</strong> नियम <strong>उल्टा</strong> हो जाता है!<br/>
      1st Person (I, We) के साथ <strong>will</strong> आता है, और 2nd/3rd Person (You, He, They) के साथ <strong>shall</strong> आता है:
        <ul>
          <li><em>"You <strong>shall</strong> not move."</em> (आदेश: तुम हिलोगे नहीं)।</li>
          <li><em>"They <strong>shall</strong> be rewarded."</em> (वादा: उन्हें पुरस्कार दिया जाएगा)।</li>
          <li><em>"I <strong>will</strong> crack SSC CGL 2026."</em> (दृढ़ संकल्प: मैं परीक्षा पास करूँगा ही)।</li>
        </ul>
      </li>
    </ul>
  </div>
</div>""")

    # 7. Perfect Continuous & Since vs For
    html.append("""<h2><span class="lang-en">7. Perfect Continuous Tenses & The 'Since vs For' Rule</span><span class="lang-hi">7. पूर्ण चालू काल एवं 'Since बनाम For' का सटीक नियम</span></h2>

<div class="lang-en">
  <div class="lang-card-en">
    <p><strong>Perfect Continuous Tenses</strong> describe an action that started in the past and is still continuing into the present or up to a specified time frame.</p>
    <ul>
      <li><em>Present Perfect Continuous:</em> <code>S + has/have been + V-ing + (since/for + time)</code><br/>
      <em>"She has been suffering from fever for two days."</em></li>
      <li><em>Past Perfect Continuous:</em> <code>S + had been + V-ing + (since/for + time)</code><br/>
      <em>"She had been playing chess the whole day yesterday."</em></li>
    </ul>

    <p><strong>The Definitive Rule: Since vs For</strong></p>
    <ul>
      <li><strong>SINCE (Point of Time):</strong> Used when the exact starting point of the action is named:
        <ul>
          <li>Specific days/dates: <em>since Monday, since 15th August, since 2004</em></li>
          <li>Parts of day: <em>since morning, since noon, since evening, since night</em></li>
          <li>Stages of life / Events: <em>since childhood, since his birth, since I arrived here</em></li>
          <li>Clock time: <em>since 8:00 AM, since 4 o'clock</em></li>
        </ul>
      </li>
      <li><strong>FOR (Period / Duration of Time):</strong> Used for counting numerical duration:
        <ul>
          <li>Number + units: <em>for two hours, for ten days, for five months, for three years, for a long time</em></li>
        </ul>
      </li>
    </ul>
  </div>
</div>

<div class="lang-hi">
  <div class="lang-card-hi">
    <p><strong>Since बनाम For का अचूक नियम:</strong></p>
    <ul>
      <li><strong>SINCE (निश्चित बिंदु-समय / Point of Time):</strong> जब काम के शुरू होने का निश्चित समय, दिन, तारीख या पहर दिया हो:<br/>
      <em>since Monday (सोमवार से), since 2010 (2010 से), since morning (सुबह से), since childhood (बचपन से), since 5 o'clock (5 बजे से)</em>।</li>
      <li><strong>FOR (अवधि / Period of Time):</strong> जब समय की गिनती या कुल अवधि दी हो:<br/>
      <em>for two days (दो दिन से), for five hours (पाँच घंटे से), for ten years (दस साल से), for a long time (काफी समय से)</em>।</li>
    </ul>
  </div>
</div>""")

    # 8. Master 12 Tenses Summary Table
    html.append("""<h2><span class="lang-en">8. Master Summary: All 12 Tenses at a Glance</span><span class="lang-hi">8. संपूर्ण सारणी: सभी 12 काल एक नज़र में</span></h2>

<table class="notes-table">
  <thead>
    <tr>
      <th>Tense</th>
      <th>Hindi (हिंदी)</th>
      <th>Active Voice Structure (संरचना)</th>
      <th>Example Sentence (उदाहरण)</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td><strong>Present Indefinite</strong></td>
      <td>सामान्य वर्तमान</td>
      <td><code>S + V1 (s/es)</code></td>
      <td>She writes letters.</td>
    </tr>
    <tr>
      <td><strong>Present Continuous</strong></td>
      <td>चालू वर्तमान</td>
      <td><code>S + is/am/are + V-ing</code></td>
      <td>She is writing a letter.</td>
    </tr>
    <tr>
      <td><strong>Present Perfect</strong></td>
      <td>पूर्ण वर्तमान</td>
      <td><code>S + has/have + V3</code></td>
      <td>She has written a letter.</td>
    </tr>
    <tr>
      <td><strong>Present Perfect Continuous</strong></td>
      <td>पूर्ण चालू वर्तमान</td>
      <td><code>S + has/have been + V-ing</code></td>
      <td>She has been writing for an hour.</td>
    </tr>
    <tr>
      <td><strong>Past Indefinite</strong></td>
      <td>सामान्य भूतकाल</td>
      <td><code>S + V2</code></td>
      <td>She wrote a letter.</td>
    </tr>
    <tr>
      <td><strong>Past Continuous</strong></td>
      <td>चालू भूतकाल</td>
      <td><code>S + was/were + V-ing</code></td>
      <td>She was writing a letter.</td>
    </tr>
    <tr>
      <td><strong>Past Perfect</strong></td>
      <td>पूर्ण भूतकाल</td>
      <td><code>S + had + V3</code></td>
      <td>She had written a letter.</td>
    </tr>
    <tr>
      <td><strong>Past Perfect Continuous</strong></td>
      <td>पूर्ण चालू भूतकाल</td>
      <td><code>S + had been + V-ing</code></td>
      <td>She had been writing for an hour.</td>
    </tr>
    <tr>
      <td><strong>Future Indefinite</strong></td>
      <td>सामान्य भविष्यत्</td>
      <td><code>S + will/shall + V1</code></td>
      <td>She will write a letter.</td>
    </tr>
    <tr>
      <td><strong>Future Continuous</strong></td>
      <td>चालू भविष्यत्</td>
      <td><code>S + will/shall be + V-ing</code></td>
      <td>She will be writing a letter.</td>
    </tr>
    <tr>
      <td><strong>Future Perfect</strong></td>
      <td>पूर्ण भविष्यत्</td>
      <td><code>S + will/shall have + V3</code></td>
      <td>She will have written a letter.</td>
    </tr>
    <tr>
      <td><strong>Future Perfect Continuous</strong></td>
      <td>पूर्ण चालू भविष्यत्</td>
      <td><code>S + will/shall have been + V-ing</code></td>
      <td>She will have been writing for an hour.</td>
    </tr>
  </tbody>
</table>""")

    # 9. 15 Interactive Practice MCQs
    html.append("""<h2><span class="lang-en">9. Interactive Practice MCQs (Based on Tenses Rules)</span><span class="lang-hi">9. इंटरैक्टिव अभ्यास प्रश्न (Tenses नियमों पर आधारित)</span></h2>
<p><span class="lang-en">Test your understanding of the 12 Tenses and Stative Verb rules. Click an option for instant answer feedback:</span><span class="lang-hi">काल एवं Stative Verbs के नियमों पर आधारित अभ्यास प्रश्न। सही उत्तर जानने के लिए ऑप्शन पर क्लिक करें:</span></p>""")

    mcqs = [
        {
            "num": 1,
            "q_en": "She _______ from London two days ago.",
            "q_hi": "She _______ from London two days ago. (ago = definite past point of time)",
            "options": [
                ("returned", True),
                ("has returned", False),
                ("had returned", False),
                ("was returning", False),
            ]
        },
        {
            "num": 2,
            "q_en": "Mr. Sharma _______ this luxury showroom since 2010.",
            "q_hi": "Mr. Sharma _______ this luxury showroom since 2010. (since + time expression with stative verb)",
            "options": [
                ("has owned", True),
                ("is owning", False),
                ("has been owning", False),
                ("owns", False),
            ]
        },
        {
            "num": 3,
            "q_en": "Find the grammatically incorrect sentence:",
            "q_hi": "व्याकरण की दृष्टि से अशुद्ध वाक्य पहचानें:",
            "options": [
                ("This ancestral property is belonging to my family.", True),
                ("This ancestral property belongs to my family.", False),
                ("She is having lunch with her client right now.", False),
                ("The soup smells delicious.", False),
            ]
        },
        {
            "num": 4,
            "q_en": "The train _______ the station before we reached the platform.",
            "q_hi": "The train _______ the station before we reached the platform. (Past of the past)",
            "options": [
                ("had left", True),
                ("left", False),
                ("has left", False),
                ("was leaving", False),
            ]
        },
        {
            "num": 5,
            "q_en": "I _______ him well for more than five years.",
            "q_hi": "I _______ him well for more than five years. (know = stative verb with 'for')",
            "options": [
                ("have known", True),
                ("am knowing", False),
                ("have been knowing", False),
                ("know", False),
            ]
        },
        {
            "num": 6,
            "q_en": "Water _______ at 100 degrees Celsius under normal atmospheric pressure.",
            "q_hi": "Water _______ at 100 degrees Celsius. (Universal scientific truth)",
            "options": [
                ("boils", True),
                ("is boiling", False),
                ("has boiled", False),
                ("boiled", False),
            ]
        },
        {
            "num": 7,
            "q_en": "She _______ for her lost passport since morning.",
            "q_hi": "She _______ for her lost passport since morning. (action ongoing from morning)",
            "options": [
                ("has been searching", True),
                ("is searching", False),
                ("searched", False),
                ("had searched", False),
            ]
        },
        {
            "num": 8,
            "q_en": "I _______ to assist him financially, but my own salary was delayed.",
            "q_hi": "I _______ to assist him financially, but my own salary was delayed. (Unfulfilled past wish)",
            "options": [
                ("had wanted", True),
                ("wanted", False),
                ("have wanted", False),
                ("was wanting", False),
            ]
        },
        {
            "num": 9,
            "q_en": "You _______ not enter this confidential laboratory without authorization. (Strict order)",
            "q_hi": "You _______ not enter this confidential laboratory. (आदेश दर्शाने के लिए You के साथ)",
            "options": [
                ("shall", True),
                ("will", False),
                ("would", False),
                ("may", False),
            ]
        },
        {
            "num": 10,
            "q_en": "She has been residing in this apartment _______ ten years.",
            "q_hi": "She has been residing in this apartment _______ ten years. (numerical duration)",
            "options": [
                ("for", True),
                ("since", False),
                ("from", False),
                ("by", False),
            ]
        },
        {
            "num": 11,
            "q_en": "By this time tomorrow, the flight _______ in New York.",
            "q_hi": "By this time tomorrow, the flight _______ in New York. (Future deadline)",
            "options": [
                ("will have landed", True),
                ("will land", False),
                ("lands", False),
                ("will be landing", False),
            ]
        },
        {
            "num": 12,
            "q_en": "He _______ late for his afternoon classes.",
            "q_hi": "He _______ late for his afternoon classes. (Adverb of frequency 'often')",
            "options": [
                ("often gets", True),
                ("is often getting", False),
                ("has often got", False),
                ("often get", False),
            ]
        },
        {
            "num": 13,
            "q_en": "Find the error: 'I am hearing (A) / a strange screeching noise (B) / coming from the attic (C) / No error (D)'",
            "q_hi": "'I am hearing (A) / a strange screeching noise (B) / coming from the attic (C)' में त्रुटि पहचानें:",
            "options": [
                ("A (Change 'I am hearing' to 'I hear')", True),
                ("B", False),
                ("C", False),
                ("D", False),
            ]
        },
        {
            "num": 14,
            "q_en": "The Prime Minister _______ for Tokyo tomorrow morning on an official bilateral visit.",
            "q_hi": "The Prime Minister _______ for Tokyo tomorrow morning. (Fixed schedule)",
            "options": [
                ("leaves", True),
                ("shall have left", False),
                ("has left", False),
                ("left", False),
            ]
        },
        {
            "num": 15,
            "q_en": "It was still pouring heavily when we _______ the mountain campsite.",
            "q_hi": "It was still pouring heavily when we _______ the mountain campsite.",
            "options": [
                ("reached", True),
                ("had reached", False),
                ("were reaching", False),
                ("have reached", False),
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
    h = re.sub(r'<div class="lang-hi">.*?</div>\s*', '', bilingual_html, flags=re.DOTALL)
    h = re.sub(r'<span class="lang-hi">.*?</span>\s*', '', h, flags=re.DOTALL)
    h = re.sub(r'<div class="lang-en">\s*<div class="lang-card-en">(.*?)</div>\s*</div>', r'\1', h, flags=re.DOTALL)
    h = re.sub(r'<span class="lang-en">(.*?)</span>', r'\1', h, flags=re.DOTALL)
    return h

def extract_pure_hindi(bilingual_html):
    h = re.sub(r'<div class="lang-en">.*?</div>\s*', '', bilingual_html, flags=re.DOTALL)
    h = re.sub(r'<span class="lang-en">.*?</span>\s*', '', h, flags=re.DOTALL)
    h = re.sub(r'<div class="lang-hi">\s*<div class="lang-card-hi">(.*?)</div>\s*</div>', r'\1', h, flags=re.DOTALL)
    h = re.sub(r'<span class="lang-hi">(.*?)</span>', r'\1', h, flags=re.DOTALL)
    return h

if __name__ == "__main__":
    content = build_tenses_content()
    en = extract_pure_english(content)
    hi = extract_pure_hindi(content)
    print(f"Tenses HTML built! Total length: {len(content)}, EN: {len(en)}, HI: {len(hi)}")
