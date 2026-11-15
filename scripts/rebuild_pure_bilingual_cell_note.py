import json
import os
import sys

sys.path.append(os.path.dirname(__file__))
from build_bilingual_cell_note import svg_cell_comparison, svg_cell_cycle

NOTES_FILE = os.path.join(os.path.dirname(__file__), "..", "src", "data", "chapter_notes.json")

def generate_note_html():
    html = []

    # 1. Section 1 (Starts directly without intro card or crux box)
    html.append("""<h2><span class="lang-en">1. The Cell: Fundamental Unit of Life</span><span class="lang-hi">1. कोशिका: जीवन की मौलिक इकाई</span></h2>

<div class="lang-en">
  <div class="lang-card-en">
    <p>A <strong>Cell</strong> is the fundamental structural, functional, and biological unit of all living organisms. It is the smallest self-sustaining biological entity capable of independent existence and executing essential life processes such as metabolism, respiration, nutrition, and self-replication.</p>
    
    <p><strong>Historical Discoveries (Chronological Milestones):</strong></p>
    <ul>
      <li><strong>Robert Hooke (1665):</strong> First observed dead cork cells under a primitive compound microscope and coined the term <em>"Cell"</em> (from Latin <em>cellula</em> meaning 'little room'). He published these drawings in his landmark treatise <em>Micrographia</em>.</li>
      <li><strong>Antonie van Leeuwenhoek (1674):</strong> First to discover and describe <strong>living cells</strong> (bacteria, protozoa, red blood cells, and human spermatozoa) using handcrafted high-magnification single lenses. Globally revered as the <em>Father of Microbiology</em>.</li>
      <li><strong>Robert Brown (1831):</strong> Discovered and named the <strong>Nucleus</strong> within plant orchid cells.</li>
      <li><strong>J. E. Purkinje (1839):</strong> Coined the term <strong>Protoplasm</strong> for the living fluid substance inside the cell. Biologist T. H. Huxley famously designated Protoplasm as the <em>"Physical Basis of Life"</em>.</li>
    </ul>

    <p><strong>The Classical Cell Theory:</strong></p>
    <p>Formulated jointly in 1838–1839 by German botanist <strong>Matthias Schleiden</strong> and German zoologist <strong>Theodor Schwann</strong>:</p>
    <ol>
      <li>All living organisms are composed of one or more cells and cellular products.</li>
      <li>The cell is the basic structural and functional unit of life.</li>
    </ol>
    <p>In 1855, German pathologist <strong>Rudolf Virchow</strong> completed the theory with his seminal aphorism: <strong style="color: #2563eb;">"Omnis cellula-e-cellula"</strong> — meaning <em>"All cells arise solely from pre-existing cells through cell division."</em></p>
  </div>
</div>

<div class="lang-hi">
  <div class="lang-card-hi">
    <p><strong>कोशिका (Cell)</strong> सभी सजीवों के शरीर की सबसे छोटी <em>संरचनात्मक (Structural)</em> और <em>कार्यात्मक (Functional)</em> इकाई है। यह स्वतंत्र रूप से जीवित रहकर जीवन की समस्त आवश्यक जैविक क्रियाएं (पोषण, श्वसन, उत्सर्जन, वृद्धि एवं जनन) संपन्न करने में पूर्णतः सक्षम होती है।</p>
    
    <p><strong>प्रमुख ऐतिहासिक खोजें:</strong></p>
    <ul>
      <li><strong>रॉबर्ट हुक (1665):</strong> पेड़ की छाल (कॉर्क) में सर्वप्रथम मृत कोशिकाओं को देखा और उन्हें <em>"Cell"</em> (छोटा कमरा) नाम दिया। इनकी प्रसिद्ध वैज्ञानिक पुस्तक का नाम <strong>Micrographia</strong> है।</li>
      <li><strong>एंटनी वॉन ल्यूवेनहॉक (1674):</strong> स्वनिर्मित उच्च आवर्धन लेंस द्वारा सर्वप्रथम <strong>जीवित कोशिका (Live Cell)</strong> (जीवाणु, प्रोटोजोआ, शुक्राणु तथा RBC) को देखा। इन्हें <em>'सूक्ष्म जीव विज्ञान का पिता' (Father of Microbiology)</em> कहा जाता है।</li>
      <li><strong>रॉबर्ट ब्राउन (1831):</strong> आर्किड पौधे की कोशिकाओं में सर्वप्रथम <strong>केंद्रक (Nucleus)</strong> की खोज की।</li>
      <li><strong>जे. ई. पुरकिंजे (1839):</strong> कोशिका के भीतर उपस्थित तरल सजीव द्रव्य को <strong>जीवद्रव्य (Protoplasm)</strong> नाम दिया। वैज्ञानिक टी. एच. हक्सले ने जीवद्रव्य को <em>"जीवन का भौतिक आधार" (Physical Basis of Life)</em> कहा।</li>
    </ul>

    <p><strong>कोशिका सिद्धांत (Cell Theory):</strong></p>
    <p>1838–1839 में जर्मन वनस्पतिशास्त्री <strong>मथायस श्लीडेन</strong> तथा जर्मन जंतुविज्ञानी <strong>थियोडोर श्वान</strong> ने प्रतिपादित किया कि सभी जीव कोशिकाओं और उनके उत्पादों से बने हैं।</p>
    <p>1855 में <strong>रुडोल्फ विरचो</strong> ने सिद्धांत को पूर्ण करते हुए प्रसिद्ध सूत्र दिया: <strong style="color: #059669;">"Omnis cellula-e-cellula"</strong> — अर्थात <em>"सभी नई कोशिकाएं पहले से मौजूद पूर्ववर्ती कोशिकाओं के विभाजन से ही उत्पन्न होती हैं।"</em></p>
  </div>
</div>

<div class="callout-box alert">
  <p><strong>🔥 Exception to Cell Theory / कोशिका सिद्धांत का अपवाद:</strong> <br/>
  <span class="lang-en"><strong>Viruses, Viroids, and Prions</strong> are notable exceptions to the Cell Theory because they lack cellular organization, cytoplasm, and independent metabolic machinery outside a living host.</span>
  <span class="lang-hi"><strong>विषाणु (Viruses), वाइरोइड्स एवं प्रायोन्स</strong> कोशिका सिद्धांत के अपवाद हैं क्योंकि इनमें स्वतंत्र कोशिका संगठन, कोशिकाद्रव्य तथा उपापचयी तंत्र नहीं होता।</span></p>
</div>""")

    # 3. Section 2 & Table 1
    html.append("""<h2><span class="lang-en">2. Cell Dimensions & Records</span><span class="lang-hi">2. आकार और परिमाप के रिकॉर्ड</span></h2>

<table class="notes-table">
  <thead>
    <tr>
      <th>
        <span class="lang-en">Category / Record</span>
        <span class="lang-hi">श्रेणी / रिकॉर्ड</span>
      </th>
      <th>
        <span class="lang-en">Record Holder</span>
        <span class="lang-hi">धारक (जीव / कोशिका)</span>
      </th>
      <th>
        <span class="lang-en">Dimension & Core Facts</span>
        <span class="lang-hi">माप एवं मुख्य तथ्य</span>
      </th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td>
        <div class="lang-en"><strong>Smallest Cell on Earth</strong></div>
        <div class="lang-hi"><strong>पृथ्वी पर सबसे छोटी कोशिका</strong></div>
      </td>
      <td>
        <div class="lang-en"><em>Mycoplasma gallisepticum</em> (PPLO)</div>
        <div class="lang-hi"><em>माइकोप्लाज्मा गैलीसेप्टिकम</em> (PPLO)</div>
      </td>
      <td>
        <div class="lang-en"><strong>0.1 to 0.3 μm</strong> (Lacks cell wall; penicillin-resistant)</div>
        <div class="lang-hi"><strong>0.1 से 0.3 μm</strong> (कोशिका भित्ति नहीं पाई जाती; पेनिसिलिन प्रतिरोधी)</div>
      </td>
    </tr>
    <tr>
      <td>
        <div class="lang-en"><strong>Largest Single Cell on Earth</strong></div>
        <div class="lang-hi"><strong>पृथ्वी पर सबसे बड़ी एकल कोशिका</strong></div>
      </td>
      <td>
        <div class="lang-en">Ostrich Egg (शुतुरमुर्ग का अंडा)</div>
        <div class="lang-hi">शुतुरमुर्ग का अंडा (Ostrich Egg)</div>
      </td>
      <td>
        <div class="lang-en"><strong>15 to 18 cm diameter</strong> (Single unfertilized ovum)</div>
        <div class="lang-hi"><strong>15 से 18 सेमी व्यास</strong> (एकल अनिषेचित डिंब कोशिका)</div>
      </td>
    </tr>
    <tr>
      <td>
        <div class="lang-en"><strong>Longest Cell in Human Body</strong></div>
        <div class="lang-hi"><strong>मानव शरीर की सबसे लंबी कोशिका</strong></div>
      </td>
      <td>
        <div class="lang-en">Motor Neuron / Nerve Cell</div>
        <div class="lang-hi">तंत्रिका कोशिका (Neuron)</div>
      </td>
      <td>
        <div class="lang-en">Can reach up to <strong>90 cm to 1 meter</strong> in length</div>
        <div class="lang-hi">लंबाई <strong>90 सेमी से 1 मीटर</strong> तक हो सकती है</div>
      </td>
    </tr>
    <tr>
      <td>
        <div class="lang-en"><strong>Largest Cell in Human Body</strong></div>
        <div class="lang-hi"><strong>मानव शरीर की सबसे बड़ी कोशिका</strong></div>
      </td>
      <td>
        <div class="lang-en">Female Ovum / Egg Cell</div>
        <div class="lang-hi">मादा डिंब (Female Ovum)</div>
      </td>
      <td>
        <div class="lang-en"><strong>~120 to 150 μm</strong> (Visible to unaided human eye)</div>
        <div class="lang-hi"><strong>~120 से 150 μm</strong> (नग्न आंखों से दिखाई देने योग्य)</div>
      </td>
    </tr>
    <tr>
      <td>
        <div class="lang-en"><strong>Smallest Cell in Human Body</strong></div>
        <div class="lang-hi"><strong>मानव शरीर की सबसे छोटी कोशिका</strong></div>
      </td>
      <td>
        <div class="lang-en">Cerebellar Granule Neuron / Male Sperm</div>
        <div class="lang-hi">पुरुष शुक्राणु (Sperm) / सेरेबेलर ग्रेन्युल न्यूरॉन</div>
      </td>
      <td>
        <div class="lang-en"><strong>~4 to 5 μm</strong></div>
        <div class="lang-hi"><strong>~4 से 5 μm</strong></div>
      </td>
    </tr>
  </tbody>
</table>""")

    # 4. Section 3 & Table 2
    html.append("""<h2><span class="lang-en">3. Prokaryotic vs. Eukaryotic Cells</span><span class="lang-hi">3. प्रोकेरियोटिक बनाम यूकेरियोटिक कोशिकाएं</span></h2>

<div class="lang-en">
  <div class="lang-card-en">
    <p>All cellular life on Earth is classified into two major evolutionary architectures: <strong>Prokaryotes</strong> (primitive, uncompartmentalized cells lacking a membrane-bound nucleus) and <strong>Eukaryotes</strong> (advanced cells containing an organized true nucleus and specialized membrane-enclosed organelles).</p>
  </div>
</div>

<div class="lang-hi">
  <div class="lang-card-hi">
    <p>संसार के सभी जीव दो प्रकार की कोशिका संरचनाओं में विभाजित हैं: <strong>प्रोकेरियोटिक (अविकसित)</strong> जिनमें केंद्रक झिल्ली तथा झिल्लीदार कोशिकांग अनुपस्थित होते हैं, एवं <strong>यूकेरियोटिक (विकसित)</strong> जिनमें सुस्पष्ट दोहरी झिल्लीयुक्त केंद्रक तथा विशिष्ट अंगक मौजूद होते हैं।</p>
  </div>
</div>

<table class="notes-table">
  <thead>
    <tr>
      <th>
        <span class="lang-en">Feature</span>
        <span class="lang-hi">लक्षण</span>
      </th>
      <th>
        <span class="lang-en">Prokaryotic Cell (असीमकेन्द्रकी)</span>
        <span class="lang-hi">प्रोकेरियोटिक कोशिका</span>
      </th>
      <th>
        <span class="lang-en">Eukaryotic Cell (ससीमकेन्द्रकी)</span>
        <span class="lang-hi">यूकेरियोटिक कोशिका</span>
      </th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td>
        <div class="lang-en"><strong>True Nucleus (केंद्रक)</strong></div>
        <div class="lang-hi"><strong>सत्य केंद्रक</strong></div>
      </td>
      <td>
        <div class="lang-en"><strong>Absent.</strong> Naked circular DNA lies directly in cytoplasm in an unmembrane region called <strong>Nucleoid</strong>.</div>
        <div class="lang-hi"><strong>अनुपस्थित।</strong> बिना झिल्ली का नग्न वृत्ताकार DNA सीधे कोशिकाद्रव्य में <strong>केंद्रकाभ (Nucleoid)</strong> में रहता है।</div>
      </td>
      <td>
        <div class="lang-en"><strong>Present.</strong> Linear DNA is safely packed with Histone proteins inside a double-membrane envelope.</div>
        <div class="lang-hi"><strong>उपस्थित।</strong> रैखिक DNA हिस्टोन प्रोटीन के साथ दोहरी केंद्रक झिल्ली (Nuclear Envelope) में सुरक्षित रहता है।</div>
      </td>
    </tr>
    <tr>
      <td>
        <div class="lang-en"><strong>Membrane Organelles (झिल्लीयुक्त अंगक)</strong></div>
        <div class="lang-hi"><strong>झिल्लीदार कोशिकांग</strong></div>
      </td>
      <td>
        <div class="lang-en"><strong>Absent.</strong> No Mitochondria, ER, Golgi Apparatus, Lysosomes, or Plastids.</div>
        <div class="lang-hi"><strong>अनुपस्थित।</strong> माइटोकॉन्ड्रिया, ER, गॉल्जीकाय, लाइसोसोम या लवक नहीं पाए जाते।</div>
      </td>
      <td>
        <div class="lang-en"><strong>Present.</strong> Full compartmentalized organellar system.</div>
        <div class="lang-hi"><strong>उपस्थित।</strong> झिल्लीदार कोशिकांगों का पूर्ण विकसित तंत्र मौजूद होता है।</div>
      </td>
    </tr>
    <tr>
      <td>
        <div class="lang-en"><strong>Ribosomes (राइबोसोम)</strong></div>
        <div class="lang-hi"><strong>राइबोसोम का प्रकार</strong></div>
      </td>
      <td>
        <div class="lang-en"><strong>70S only</strong> (50S large subunit + 30S small subunit).</div>
        <div class="lang-hi"><strong>केवल 70S</strong> (50S बड़ी उपइकाई + 30S छोटी उपइकाई)।</div>
      </td>
      <td>
        <div class="lang-en"><strong>80S in cytoplasm</strong> (60S + 40S); <strong>70S inside Mitochondria & Chloroplasts</strong>.</div>
        <div class="lang-hi"><strong>कोशिकाद्रव्य में 80S</strong> (60S + 40S); <strong>माइटोकॉन्ड्रिया व हरितलवक के भीतर 70S</strong>।</div>
      </td>
    </tr>
    <tr>
      <td>
        <div class="lang-en"><strong>Cell Wall Composition (भित्ति संघटन)</strong></div>
        <div class="lang-hi"><strong>कोशिका भित्ति का संघटन</strong></div>
      </td>
      <td>
        <div class="lang-en">Composed of <strong>Peptidoglycan (Murein)</strong>.</div>
        <div class="lang-hi"><strong>पेप्टिडोग्लाइकन (म्यूरीन)</strong> से निर्मित।</div>
      </td>
      <td>
        <div class="lang-en">Plants: <strong>Cellulose</strong>; Fungi: <strong>Chitin</strong>; Animals: <strong>Absent</strong>.</div>
        <div class="lang-hi">पादप: <strong>सेलूलोज़</strong>; कवक: <strong>काइटिन</strong>; जंतु: <strong>अनुपस्थित</strong>।</div>
      </td>
    </tr>
    <tr>
      <td>
        <div class="lang-en"><strong>Cell Division (कोशिका विभाजन)</strong></div>
        <div class="lang-hi"><strong>विभाजन विधि</strong></div>
      </td>
      <td>
        <div class="lang-en"><strong>Binary Fission / Amitosis</strong> (No spindle fiber formation).</div>
        <div class="lang-hi"><strong>द्विविखंडन (Binary Fission) / असूत्री विभाजन</strong> (तर्कुतंतु नहीं बनते)।</div>
      </td>
      <td>
        <div class="lang-en"><strong>Mitosis & Meiosis</strong> (Well-developed spindle apparatus).</div>
        <div class="lang-hi"><strong>समसूत्री (Mitosis) एवं अर्धसूत्री (Meiosis)</strong> विभाजन।</div>
      </td>
    </tr>
    <tr>
      <td>
        <div class="lang-en"><strong>Cellular Respiration (श्वसन स्थल)</strong></div>
        <div class="lang-hi"><strong>श्वसन स्थल</strong></div>
      </td>
      <td>
        <div class="lang-en"><strong>Mesosomes</strong> (Specialized plasma membrane infoldings).</div>
        <div class="lang-hi"><strong>मीसोसोम (Mesosomes)</strong> (प्लाज्मा झिल्ली के अंतर्वलन पर)।</div>
      </td>
      <td>
        <div class="lang-en"><strong>Mitochondria</strong> (Inner membrane Cristae).</div>
        <div class="lang-hi"><strong>माइटोकॉन्ड्रिया</strong> (क्रिस्टी की आंतरिक झिल्ली पर)।</div>
      </td>
    </tr>
    <tr>
      <td>
        <div class="lang-en"><strong>Representative Examples (उदाहरण)</strong></div>
        <div class="lang-hi"><strong>प्रमुख उदाहरण</strong></div>
      </td>
      <td>
        <div class="lang-en">Bacteria, Blue-Green Algae (Cyanobacteria), Mycoplasma.</div>
        <div class="lang-hi">जीवाणु (Bacteria), नील-हरित शैवाल (BGA), माइकोप्लाज्मा।</div>
      </td>
      <td>
        <div class="lang-en">Protists, Fungi, all Plants and Animals.</div>
        <div class="lang-hi">प्रोटोजोआ, कवक, सभी पादप तथा जंतु।</div>
      </td>
    </tr>
  </tbody>
</table>""")

    # 5. Insert SVG 1
    html.append(svg_cell_comparison)

    # 6. Section 4: Master Architecture of Cell Organelles
    html.append("""<h2><span class="lang-en">4. Master Architecture of Cell Organelles</span><span class="lang-hi">4. प्रमुख कोशिकांग एवं उनकी कार्यप्रणाली</span></h2>

<h3><span class="lang-en">A. Plasma Membrane / Cell Membrane</span><span class="lang-hi">A. प्लाज्मा झिल्ली / कोशिका झिल्ली</span></h3>
<div class="lang-en">
  <div class="lang-card-en">
    <p>A living, ultra-thin, elastic, and <strong>selectively permeable</strong> outer boundary composed of a Phospholipid bilayer embedded with transport proteins. The universally accepted architectural framework is the <strong>Fluid Mosaic Model</strong> proposed by <strong>S. J. Singer and G. L. Nicolson (1972)</strong>, where proteins float like icebergs in a fluid lipid sea. It precisely controls endocytosis, exocytosis, and osmotic balance.</p>
  </div>
</div>
<div class="lang-hi">
  <div class="lang-card-hi">
    <p>यह सजीव, अत्यंत पतली, लचीली तथा <strong>चयनात्मक पारगम्य (Selectively Permeable)</strong> झिल्ली है जो फॉस्फोलिपिड की दोहरी परत तथा प्रोटीनों से बनी होती है। इसका सर्वाधिक मान्य मॉडल <strong>सिंगर और निकोलसन (1972)</strong> द्वारा प्रस्तुत <strong>तरल मोज़ेक मॉडल (Fluid Mosaic Model)</strong> है। यह कोशिका के अंदर और बाहर पदार्थों के आवागमन तथा परासरण संतुलन को नियंत्रित करती है।</p>
  </div>
</div>

<h3><span class="lang-en">B. Cell Wall</span><span class="lang-hi">B. कोशिका भित्ति (केवल पादप एवं कवक)</span></h3>
<div class="lang-en">
  <div class="lang-card-en">
    <p>A completely non-living, rigid, and freely permeable protective layer situated outside the plasma membrane in plant, fungal, and bacterial cells (completely <strong>absent in animal cells</strong>). Plant cell walls are made of <strong>Cellulose</strong>, hemicellulose, and pectin. Adjoining plant cells are cemented together by the <strong>Middle Lamella</strong>, which is primarily composed of <strong>Calcium and Magnesium Pectate</strong>.</p>
  </div>
</div>
<div class="lang-hi">
  <div class="lang-card-hi">
    <p>यह पादप, कवक एवं जीवाणुओं में प्लाज्मा झिल्ली के बाहर पाई जाने वाली पूरी तरह निर्जीव, दृढ़ तथा पूर्ण पारगम्य परत है (<strong>जंतु कोशिका में सर्वथा अनुपस्थित</strong>)। पादपों में यह <strong>सेलूलोज़ (Cellulose)</strong> की बनी होती है। दो समीपवर्ती पादप कोशिकाओं को आपस में जोड़ने वाली 'मध्य पटलिका' (Middle Lamella) मुख्य रूप से <strong>कैल्शियम और मैग्नीशियम पेक्टेट</strong> से बनी होती है।</p>
  </div>
</div>

<h3><span class="lang-en">C. Nucleus — The Director / Brain of the Cell</span><span class="lang-hi">C. केंद्रक (Nucleus) — कोशिका का नियंत्रक / मस्तिष्क</span></h3>
<div class="lang-en">
  <div class="lang-card-en">
    <p>Discovered by <strong>Robert Brown (1831)</strong>. Enveloped by a double-layered porous nuclear membrane, it contains the nucleolus and chromatin network (DNA + basic Histone proteins). It orchestrates hereditary transmission and directs all cellular metabolic activities, rightfully earning the title of <strong>"Director / Control Center of the Cell"</strong>.</p>
  </div>
</div>
<div class="lang-hi">
  <div class="lang-card-hi">
    <p>इसकी खोज <strong>रॉबर्ट ब्राउन (1831)</strong> ने की थी। यह दोहरी छिद्रयुक्त झिल्ली से घिरा होता है और इसके भीतर केंद्रिका (Nucleolus) तथा क्रोमैटिन धागे (DNA + हिस्टोन प्रोटीन) होते हैं। यह कोशिका की समस्त उपापचयी क्रियाओं और आनुवंशिक सूचनाओं का नियंत्रण केंद्र है, इसलिए इसे <strong>"कोशिका का मस्तिष्क / नियंत्रक"</strong> कहा जाता है।</p>
  </div>
</div>

<h3><span class="lang-en">D. Mitochondria — The Powerhouse of the Cell</span><span class="lang-hi">D. माइटोकॉन्ड्रिया — कोशिका का ऊर्जा घर (Powerhouse)</span></h3>
<div class="lang-en">
  <div class="lang-card-en">
    <p>First observed by <strong>Richard Altmann (1890)</strong>, who called them <em>'Bioblasts'</em>; the term <em>'Mitochondria'</em> was coined by <strong>Carl Benda (1898)</strong>. Double-membraned organelle whose inner membrane is thrown into numerous folds called <strong>Cristae</strong> to maximize surface area. Cristae host ATP-synthase complexes that execute cellular respiration (Krebs cycle and Oxidative Phosphorylation), generating energy in the form of <strong>ATP (Adenosine Triphosphate)</strong> — the <em>Energy Currency of the Cell</em>. Crucially, mitochondria possess their own circular DNA and 70S ribosomes, making them <strong>Semi-autonomous organelles</strong>.</p>
  </div>
</div>
<div class="lang-hi">
  <div class="lang-card-hi">
    <p>सर्वप्रथम <strong>रिचर्ड ऑल्टमैन (1890)</strong> ने देखा और <em>बायोब्लास्ट</em> कहा; <strong>कार्ल बेंडा (1898)</strong> ने इसे <em>'माइटोकॉन्ड्रिया'</em> नाम दिया। यह दोहरी झिल्ली वाला अंगक है जिसकी भीतरी झिल्ली पर कई उंगलीनुमा उभार होते हैं जिन्हें <strong>क्रिस्टी (Cristae)</strong> कहते हैं। यहाँ कोशिकीय श्वसन द्वारा <strong>ATP (ऊर्जा की मुद्रा)</strong> का निर्माण होता है, इसलिए इसे <strong>"कोशिका का ऊर्जा घर (Powerhouse)"</strong> कहते हैं। इसके पास अपना स्वयं का DNA और 70S राइबोसोम होता है, अतः इसे <strong>अर्ध-स्वायत्त (Semi-autonomous)</strong> अंगक कहा जाता है।</p>
  </div>
</div>

<h3><span class="lang-en">E. Endoplasmic Reticulum (ER) — Internal Transport Network</span><span class="lang-hi">E. अंतःप्रद्रव्यी जालिका (ER) — आंतरिक कंकाल एवं परिवहन</span></h3>
<div class="lang-en">
  <div class="lang-card-en">
    <p>A continuous network of membrane-bound tubules and cisternae acting as the cell's cytoskeleton and internal transit highway. Divided into: <strong>Rough ER (RER)</strong>, studded with ribosomes on its outer face for active protein synthesis; and <strong>Smooth ER (SER)</strong>, lacking ribosomes, which synthesizes lipids/steroids and acts as the crucial detoxifier of drugs and poisons in liver cells.</p>
  </div>
</div>
<div class="lang-hi">
  <div class="lang-card-hi">
    <p>यह नलिकाओं और थैलियों का जाल है जो कोशिका को आंतरिक सहारा और परिवहन मार्ग प्रदान करता है। यह दो प्रकार का होता है: <strong>खुरदरी ER (RER)</strong>, जिसकी सतह पर राइबोसोम चिपके होते हैं और यह प्रोटीन संश्लेषण करती है; तथा <strong>चिकनी ER (SER)</strong>, जिस पर राइबोसोम नहीं होते और यह वसा/लिपिड का निर्माण करती है एवं यकृत कोशिकाओं में दवाओं तथा विषैले पदार्थों का विषहरण (Detoxification) करती है।</p>
  </div>
</div>

<h3><span class="lang-en">F. Ribosomes — The Protein Factories</span><span class="lang-hi">F. राइबोसोम — प्रोटीन की फैक्ट्री (Protein Factory)</span></h3>
<div class="lang-en">
  <div class="lang-card-en">
    <p>Discovered by Romanian-American cell biologist <strong>George Palade (1955)</strong> under electron microscopy. Ribosomes are the smallest, <strong>non-membranous</strong> organelles composed of ribosomal RNA (rRNA) and proteins. Found free-floating in cytoplasm and attached to the RER. They translate mRNA genetic codes into polypeptide chains, earning the title of <strong>"Protein Factory of the Cell"</strong>.</p>
  </div>
</div>
<div class="lang-hi">
  <div class="lang-card-hi">
    <p>इसकी खोज <strong>जॉर्ज पैलेड (1955)</strong> ने इलेक्ट्रॉन सूक्ष्मदर्शी से की थी। ये कोशिका के सबसे छोटे और <strong>झिल्ली-रहित (Non-membranous)</strong> अंगक हैं जो RNA और प्रोटीन से मिलकर बने होते हैं। ये mRNA के कोड पढ़कर अमीनो अम्लों से प्रोटीन का निर्माण करते हैं, इसलिए इन्हें <strong>"प्रोटीन की फैक्ट्री (Protein Factory)"</strong> कहा जाता है।</p>
  </div>
</div>

<h3><span class="lang-en">G. Golgi Apparatus — The Post Office / Packaging Center</span><span class="lang-hi">G. गॉल्जीकाय — कोशिका का डाकघर / पैकेजिंग केंद्र</span></h3>
<div class="lang-en">
  <div class="lang-card-en">
    <p>Discovered by Italian physician <strong>Camillo Golgi (1898)</strong>. Consists of stacks of parallel, flattened, membrane-bound cisternae. It receives raw proteins and lipids from the ER, chemically modifies them (glycosylation), packs them into vesicles, and dispatches them to intra- or extra-cellular destinations. Thus termed the <strong>"Post Office / Packaging Center / Traffic Police of the Cell"</strong>. In plant cells, unfused Golgi units are termed <strong>Dictyosomes</strong>.</p>
  </div>
</div>
<div class="lang-hi">
  <div class="lang-card-hi">
    <p>इसकी खोज <strong>कैमिलो गॉल्जी (1898)</strong> ने की थी। यह चपटी झिल्लीदार थैलियों (सिस्टर्नी) का समूह है। यह ER से आने वाले प्रोटीनों और लिपिड्स को संशोधित (Modify), पैक (Pack) तथा लक्ष्य स्थान तक भेजने का कार्य करता है, इसलिए इसे कोशिका का <strong>"डाकघर (Post Office)"</strong> या <strong>"ट्रैफिक पुलिस"</strong> कहा जाता है। पादप कोशिकाओं में इसके बिखरे हुए स्वरूप को <strong>डिक्टियोसोम (Dictyosome)</strong> कहते हैं।</p>
  </div>
</div>

<h3><span class="lang-en">H. Lysosomes — The Suicidal Bags of the Cell</span><span class="lang-hi">H. लाइसोसोम — आत्मघाती थैली (Suicidal Bag)</span></h3>
<div class="lang-en">
  <div class="lang-card-en">
    <p>Discovered by Belgian cytologist <strong>Christian de Duve (1955)</strong>. Spherical single-membrane vesicles packed with approximately 50 distinct <strong>acid hydrolase enzymes</strong> (functioning optimally at acidic pH ~4.5–5.0). Under severe cellular injury, starvation, or aging, the lysosomal membrane ruptures, releasing hydrolytic enzymes that digest the entire host cell — earning the famed title of <strong>"Suicidal Bags / Scavengers of the Cell"</strong>.</p>
  </div>
</div>
<div class="lang-hi">
  <div class="lang-card-hi">
    <p>इसकी खोज <strong>क्रिश्चियन डी डुवे (1955)</strong> ने की थी। यह एकल झिल्ली से घिरी थैली है जिसमें लगभग 50 प्रकार के शक्तिशाली <strong>जल-अपघटकीय एंजाइम (Hydrolytic Enzymes)</strong> भरे होते हैं जो अम्लीय माध्यम में कार्य करते हैं। कोशिका के क्षतिग्रस्त या मृत होने पर यह थैली फट जाती है और इसके एंजाइम पूरी कोशिका को ही पचा डालते हैं, इसीलिए इसे <strong>"आत्मघाती थैली (Suicide Bag)"</strong> या कोशिका का अपमार्जक कहा जाता है।</p>
  </div>
</div>

<h3><span class="lang-en">I. Plastids — Plant-Exclusive Organelles</span><span class="lang-hi">I. लवक (Plastids) — केवल पादप कोशिकाओं में</span></h3>
<div class="lang-en">
  <div class="lang-card-en">
    <p>Double-membraned plant organelles classified into three types: 
    1. <strong>Chloroplasts:</strong> Contain green chlorophyll pigment and execute photosynthesis; termed the <strong>"Kitchen of the Cell"</strong>. Contains internal thylakoids stacked into grana. Like mitochondria, chloroplasts have their own circular DNA and 70S ribosomes (semi-autonomous). 
    2. <strong>Chromoplasts:</strong> Impart vibrant yellow, orange, and red colors to flowers and fruits (e.g., Lycopene in tomatoes, Carotene in carrots). 
    3. <strong>Leucoplasts:</strong> Colorless storage plastids (Amyloplasts store starch; Elaioplasts store oils; Aleuroplasts store proteins).</p>
  </div>
</div>
<div class="lang-hi">
  <div class="lang-card-hi">
    <p>ये केवल पादप कोशिकाओं में पाए जाने वाले दोहरी झिल्लीयुक्त अंगक हैं। ये तीन प्रकार के होते हैं:
    1. <strong>हरितलवक (Chloroplast):</strong> इनमें हरा वर्णक क्लोरोफिल होता है जो प्रकाश संश्लेषण द्वारा भोजन बनाता है; इसे <strong>"कोशिका की रसोई (Kitchen of the Cell)"</strong> कहते हैं। इसके पास भी अपना DNA और 70S राइबोसोम होता है।
    2. <strong>वर्णीलवक (Chromoplast):</strong> ये फूलों और फलों को आकर्षक रंग (लाल, पीला, नारंगी) प्रदान करते हैं (जैसे टमाटर में लाइकोपीन, गाजर में कैरोटीन)।
    3. <strong>अवर्णीलवक (Leucoplast):</strong> ये रंगहीन लवक हैं जो भोजन संग्रह करते हैं (स्टार्च, वसा तथा प्रोटीन)।</p>
  </div>
</div>

<h3><span class="lang-en">J. Vacuoles — Cellular Storage & Turgor</span><span class="lang-hi">J. रसधानी / रिक्तिका (Vacuole)</span></h3>
<div class="lang-en">
  <div class="lang-card-en">
    <p>Non-cytoplasmic cavities enclosed by a specialized semi-permeable membrane called the <strong>Tonoplast</strong>. In mature plant cells, a massive central vacuole occupies <strong>up to 90%</strong> of the cellular volume, maintaining hydrostatic turgor pressure and cell rigidity. In animal cells, vacuoles are small, temporary, and multiple.</p>
  </div>
</div>
<div class="lang-hi">
  <div class="lang-card-hi">
    <p>कोशिकाद्रव्य में स्थित झिल्लीयुक्त थैली जो <strong>टोनोप्लास्ट (Tonoplast)</strong> नामक अर्ध-पारगम्य झिल्ली से घिरी होती है। परिपक्व पादप कोशिका में एक विशाल केंद्रीय रसधानी कोशिका के <strong>90% आयतन</strong> को घेरती है और कोशिका को स्फीति (Turgor Pressure) एवं दृढ़ता प्रदान करती है। जंतु कोशिकाओं में ये बहुत छोटी और अस्थायी होती हैं।</p>
  </div>
</div>

<h3><span class="lang-en">K. Centrosome & Centrioles</span><span class="lang-hi">K. तारककाय एवं तारककेंद्र (केवल जंतु कोशिकाओं में)</span></h3>
<div class="lang-en">
  <div class="lang-card-en">
    <p>Found primarily in <strong>animal cells</strong> (absent in higher plants). Contains two cylindrical structures called <strong>Centrioles</strong> arranged perpendicular to each other in a 9+0 microtubule triplet cartwheel pattern. Discovered by <strong>Edouard van Beneden</strong> and named by <strong>Theodor Boveri (1888)</strong>. It organizes the spindle apparatus during mitotic and meiotic cell division.</p>
  </div>
</div>
<div class="lang-hi">
  <div class="lang-card-hi">
    <p>यह मुख्य रूप से <strong>जंतु कोशिकाओं</strong> में पाया जाता है (उच्च पादपों में अनुपस्थित)। इसमें दो बेलनाकार रचनाएं होती हैं जिन्हें <strong>तारककेंद्र (Centrioles)</strong> कहते हैं। इसकी खोज <strong>बोवेरी (1888)</strong> ने की थी। यह कोशिका विभाजन के समय तर्कुतंतुओं (Spindle Fibers) का निर्माण करके गुणसूत्रों के पृथक्करण में मदद करता है।</p>
  </div>
</div>""")

    # 7. Section 5 & Table 3
    html.append("""<h2><span class="lang-en">5. Master Organelles Summary Cheat-Sheet</span><span class="lang-hi">5. मास्टर रिवीजन सारणी (कोशिकांग सारांश)</span></h2>

<table class="notes-table">
  <thead>
    <tr>
      <th>
        <span class="lang-en">Organelle</span>
        <span class="lang-hi">कोशिकांग</span>
      </th>
      <th>
        <span class="lang-en">Discoverer / Scientist</span>
        <span class="lang-hi">खोजकर्ता वैज्ञानिक</span>
      </th>
      <th>
        <span class="lang-en">Membrane Structure</span>
        <span class="lang-hi">झिल्ली संरचना</span>
      </th>
      <th>
        <span class="lang-en">Core Cellular Function</span>
        <span class="lang-hi">प्रमुख कार्य</span>
      </th>
      <th>
        <span class="lang-en">Functional Nickname / Crux</span>
        <span class="lang-hi">प्रसिद्ध उपनाम / मुख्य बिंदु</span>
      </th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td>
        <div class="lang-en"><strong>Plasma Membrane</strong></div>
        <div class="lang-hi"><strong>प्लाज्मा झिल्ली</strong></div>
      </td>
      <td>
        <div class="lang-en">Singer & Nicolson (1972)</div>
        <div class="lang-hi">सिंगर एवं निकोलसन</div>
      </td>
      <td>
        <div class="lang-en">Single Lipid Bilayer</div>
        <div class="lang-hi">एकल फॉस्फोलिपिड द्विक परत</div>
      </td>
      <td>
        <div class="lang-en">Selective transport & permeability</div>
        <div class="lang-hi">चयनात्मक परिवहन एवं परासरण नियंत्रण</div>
      </td>
      <td>
        <div class="lang-en">Gatekeeper of the Cell</div>
        <div class="lang-hi">कोशिका का सुरक्षा द्वार / गेटकीपर</div>
      </td>
    </tr>
    <tr>
      <td>
        <div class="lang-en"><strong>Cell Wall</strong></div>
        <div class="lang-hi"><strong>कोशिका भित्ति</strong></div>
      </td>
      <td>
        <div class="lang-en">Robert Hooke (1665)</div>
        <div class="lang-hi">रॉबर्ट हुक</div>
      </td>
      <td>
        <div class="lang-en">Non-membranous (Cellulose)</div>
        <div class="lang-hi">झिल्लीरहित (सेलूलोज़ आवरण)</div>
      </td>
      <td>
        <div class="lang-en">Mechanical shape, turgor & protection</div>
        <div class="lang-hi">यांत्रिक सहारा, स्फीति एवं सुरक्षा</div>
      </td>
      <td>
        <div class="lang-en">Absent in Animal Cells</div>
        <div class="lang-hi">केवल पादप एवं कवक में (जंतु में अनुपस्थित)</div>
      </td>
    </tr>
    <tr>
      <td>
        <div class="lang-en"><strong>Nucleus</strong></div>
        <div class="lang-hi"><strong>केंद्रक</strong></div>
      </td>
      <td>
        <div class="lang-en">Robert Brown (1831)</div>
        <div class="lang-hi">रॉबर्ट ब्राउन</div>
      </td>
      <td>
        <div class="lang-en">Double Membrane (Nuclear Pores)</div>
        <div class="lang-hi">दोहरी छिद्रयुक्त झिल्ली</div>
      </td>
      <td>
        <div class="lang-en">Heredity transmission & metabolic regulation</div>
        <div class="lang-hi">आनुवंशिक नियंत्रण एवं उपापचय नियमन</div>
      </td>
      <td>
        <div class="lang-en">Brain / Director of the Cell</div>
        <div class="lang-hi">कोशिका का मस्तिष्क / नियंत्रक</div>
      </td>
    </tr>
    <tr>
      <td>
        <div class="lang-en"><strong>Mitochondria</strong></div>
        <div class="lang-hi"><strong>माइटोकॉन्ड्रिया</strong></div>
      </td>
      <td>
        <div class="lang-en">Altmann (Bioblast) / Benda</div>
        <div class="lang-hi">ऑल्टमैन (बायोब्लास्ट) / बेंडा</div>
      </td>
      <td>
        <div class="lang-en">Double Membrane (Cristae folds)</div>
        <div class="lang-hi">दोहरी झिल्ली (क्रिस्टी उभार)</div>
      </td>
      <td>
        <div class="lang-en">Cellular respiration & ATP synthesis</div>
        <div class="lang-hi">कोशिकीय श्वसन एवं ATP ऊर्जा निर्माण</div>
      </td>
      <td>
        <div class="lang-en">Powerhouse of the Cell (Semi-autonomous)</div>
        <div class="lang-hi">कोशिका का ऊर्जा घर (पावरहाउस)</div>
      </td>
    </tr>
    <tr>
      <td>
        <div class="lang-en"><strong>Endoplasmic Reticulum</strong></div>
        <div class="lang-hi"><strong>अंतःप्रद्रव्यी जालिका (ER)</strong></div>
      </td>
      <td>
        <div class="lang-en">Albert Claude & Keith Porter</div>
        <div class="lang-hi">कीथ पोर्टर एवं क्लॉड</div>
      </td>
      <td>
        <div class="lang-en">Single Membrane network</div>
        <div class="lang-hi">एकल झिल्लीदार नलिकाओं का जाल</div>
      </td>
      <td>
        <div class="lang-en">RER: Proteins; SER: Lipids & Detoxification</div>
        <div class="lang-hi">RER: प्रोटीन; SER: लिपिड व विषहरण</div>
      </td>
      <td>
        <div class="lang-en">Internal Cytoskeleton & Transit Highway</div>
        <div class="lang-hi">आंतरिक कंकाल तंत्र एवं परिवहन राजमार्ग</div>
      </td>
    </tr>
    <tr>
      <td>
        <div class="lang-en"><strong>Ribosomes</strong></div>
        <div class="lang-hi"><strong>राइबोसोम</strong></div>
      </td>
      <td>
        <div class="lang-en">George Palade (1955)</div>
        <div class="lang-hi">जॉर्ज पैलेड</div>
      </td>
      <td>
        <div class="lang-en">Zero Membrane (Non-membranous)</div>
        <div class="lang-hi">झिल्ली-रहित (Zero Membrane)</div>
      </td>
      <td>
        <div class="lang-en">Protein biosynthesis (Translation)</div>
        <div class="lang-hi">प्रोटीन का जैव-संश्लेषण</div>
      </td>
      <td>
        <div class="lang-en">Protein Factory of the Cell</div>
        <div class="lang-hi">प्रोटीन की फैक्ट्री (सबसे छोटा कोशिकांग)</div>
      </td>
    </tr>
    <tr>
      <td>
        <div class="lang-en"><strong>Golgi Apparatus</strong></div>
        <div class="lang-hi"><strong>गॉल्जीकाय</strong></div>
      </td>
      <td>
        <div class="lang-en">Camillo Golgi (1898)</div>
        <div class="lang-hi">कैमिलो गॉल्जी</div>
      </td>
      <td>
        <div class="lang-en">Single Membrane (Cisternae stacks)</div>
        <div class="lang-hi">एकल झिल्ली (चपटी सिस्टर्नी थैलियां)</div>
      </td>
      <td>
        <div class="lang-en">Modification, packaging & secretion</div>
        <div class="lang-hi">पदार्थों का संशोधन, पैकिंग एवं स्रावण</div>
      </td>
      <td>
        <div class="lang-en">Post Office / Traffic Police of Cell</div>
        <div class="lang-hi">कोशिका का डाकघर / ट्रैफिक पुलिस</div>
      </td>
    </tr>
    <tr>
      <td>
        <div class="lang-en"><strong>Lysosomes</strong></div>
        <div class="lang-hi"><strong>लाइसोसोम</strong></div>
      </td>
      <td>
        <div class="lang-en">Christian de Duve (1955)</div>
        <div class="lang-hi">क्रिश्चियन डी डुवे</div>
      </td>
      <td>
        <div class="lang-en">Single Membrane</div>
        <div class="lang-hi">एकल झिल्ली</div>
      </td>
      <td>
        <div class="lang-en">Intracellular digestion via acid hydrolases</div>
        <div class="lang-hi">अम्लीय हाइड्रोलेज़ द्वारा अंतःकोशिकीय पाचन</div>
      </td>
      <td>
        <div class="lang-en">Suicidal Bags / Cellular Scavengers</div>
        <div class="lang-hi">आत्मघाती थैली (Suicide Bag)</div>
      </td>
    </tr>
    <tr>
      <td>
        <div class="lang-en"><strong>Chloroplast</strong></div>
        <div class="lang-hi"><strong>हरितलवक (Chloroplast)</strong></div>
      </td>
      <td>
        <div class="lang-en">Schimper</div>
        <div class="lang-hi">शिम्पर</div>
      </td>
      <td>
        <div class="lang-en">Double Membrane (Thylakoids & Stroma)</div>
        <div class="lang-hi">दोहरी झिल्ली (थाइलेकोइड एवं स्ट्रोमा)</div>
      </td>
      <td>
        <div class="lang-en">Photosynthesis & carbohydrate generation</div>
        <div class="lang-hi">प्रकाश संश्लेषण द्वारा भोजन निर्माण</div>
      </td>
      <td>
        <div class="lang-en">Kitchen of the Cell (Semi-autonomous)</div>
        <div class="lang-hi">कोशिका की रसोई (Kitchen of Cell)</div>
      </td>
    </tr>
    <tr>
      <td>
        <div class="lang-en"><strong>Vacuole</strong></div>
        <div class="lang-hi"><strong>रसधानी / रिक्तिका</strong></div>
      </td>
      <td>
        <div class="lang-en">Spallanzani / Dujardin</div>
        <div class="lang-hi">स्पैलनजानी / डुजार्डिन</div>
      </td>
      <td>
        <div class="lang-en">Single Membrane (Tonoplast)</div>
        <div class="lang-hi">एकल झिल्ली (टोनोप्लास्ट)</div>
      </td>
      <td>
        <div class="lang-en">Maintains turgor pressure & stores cell sap</div>
        <div class="lang-hi">कोशिका रस संग्रह एवं स्फीति दबाव नियंत्रण</div>
      </td>
      <td>
        <div class="lang-en">Central Storage Locker</div>
        <div class="lang-hi">पादप कोशिका का 90% आयतन घेरती है</div>
      </td>
    </tr>
    <tr>
      <td>
        <div class="lang-en"><strong>Centrosome</strong></div>
        <div class="lang-hi"><strong>तारककाय (Centrosome)</strong></div>
      </td>
      <td>
        <div class="lang-en">Boveri (1888)</div>
        <div class="lang-hi">थियोडोर बोवेरी</div>
      </td>
      <td>
        <div class="lang-en">Zero Membrane (Microtubule triplets)</div>
        <div class="lang-hi">झिल्ली-रहित (सूक्ष्मनलिकाएं)</div>
      </td>
      <td>
        <div class="lang-en">Spindle pole formation during cell division</div>
        <div class="lang-hi">विभाजन के समय तर्कुतंतुओं का निर्माण</div>
      </td>
      <td>
        <div class="lang-en">Present only in Animal Cells</div>
        <div class="lang-hi">केवल जंतु कोशिकाओं में उपस्थित</div>
      </td>
    </tr>
  </tbody>
</table>""")

    # 8. Section 6 & Table 4
    html.append("""<h2><span class="lang-en">6. Plant Cell vs. Animal Cell</span><span class="lang-hi">6. पादप बनाम जंतु कोशिका: तुलनात्मक अंतर</span></h2>

<table class="notes-table">
  <thead>
    <tr>
      <th>
        <span class="lang-en">Comparative Feature</span>
        <span class="lang-hi">तुलनात्मक लक्षण</span>
      </th>
      <th>
        <span class="lang-en">Plant Cell (पादप कोशिका)</span>
        <span class="lang-hi">पादप कोशिका</span>
      </th>
      <th>
        <span class="lang-en">Animal Cell (जंतु कोशिका)</span>
        <span class="lang-hi">जंतु कोशिका</span>
      </th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td>
        <div class="lang-en"><strong>Cell Wall (कोशिका भित्ति)</strong></div>
        <div class="lang-hi"><strong>कोशिका भित्ति</strong></div>
      </td>
      <td>
        <div class="lang-en"><strong>Present.</strong> Rigid, outer layer made of Cellulose and Pectin.</div>
        <div class="lang-hi"><strong>उपस्थित।</strong> सेलूलोज़ एवं पेक्टिन की बनी दृढ़ बाहरी सुरक्षा परत।</div>
      </td>
      <td>
        <div class="lang-en"><strong>Absent.</strong> Enclosed solely by the flexible plasma membrane.</div>
        <div class="lang-hi"><strong>अनुपस्थित।</strong> केवल लचीली प्लाज्मा झिल्ली पाई जाती है।</div>
      </td>
    </tr>
    <tr>
      <td>
        <div class="lang-en"><strong>Plastids / Chloroplasts (लवक)</strong></div>
        <div class="lang-hi"><strong>लवक (हरितलवक)</strong></div>
      </td>
      <td>
        <div class="lang-en"><strong>Present.</strong> Capable of photosynthesis and food synthesis.</div>
        <div class="lang-hi"><strong>उपस्थित।</strong> प्रकाश संश्लेषण द्वारा स्वपोषी भोजन निर्माण में सक्षम।</div>
      </td>
      <td>
        <div class="lang-en"><strong>Absent.</strong> Heterotrophic mode of life.</div>
        <div class="lang-hi"><strong>अनुपस्थित।</strong> परपोषी पोषण पद्धति।</div>
      </td>
    </tr>
    <tr>
      <td>
        <div class="lang-en"><strong>Central Vacuole (रसधानी)</strong></div>
        <div class="lang-hi"><strong>रसधानी / रिक्तिका</strong></div>
      </td>
      <td>
        <div class="lang-en"><strong>One huge central vacuole</strong> occupying up to 90% volume.</div>
        <div class="lang-hi"><strong>एक विशाल केंद्रीय रसधानी</strong> (कोशिका का 90% आयतन घेरती है)।</div>
      </td>
      <td>
        <div class="lang-en"><strong>Small, multiple, and temporary</strong> vacuoles.</div>
        <div class="lang-hi"><strong>अनेक, बहुत छोटी तथा अस्थायी</strong> रसधानियां।</div>
      </td>
    </tr>
    <tr>
      <td>
        <div class="lang-en"><strong>Centrosome & Centrioles (तारककाय)</strong></div>
        <div class="lang-hi"><strong>तारककाय / तारककेंद्र</strong></div>
      </td>
      <td>
        <div class="lang-en"><strong>Absent</strong> in all higher flowering plants.</div>
        <div class="lang-hi"><strong>अनुपस्थित</strong> (उच्च विकसित पादपों में नहीं पाया जाता)।</div>
      </td>
      <td>
        <div class="lang-en"><strong>Present.</strong> Directs spindle poles during division.</div>
        <div class="lang-hi"><strong>उपस्थित।</strong> कोशिका विभाजन में तर्कुतंतुओं का निर्माण करता है।</div>
      </td>
    </tr>
    <tr>
      <td>
        <div class="lang-en"><strong>Reserve Food Storage (संचित भोजन)</strong></div>
        <div class="lang-hi"><strong>संचित खाद्य पदार्थ</strong></div>
      </td>
      <td>
        <div class="lang-en">Stored primarily as <strong>Starch</strong> (मंड).</div>
        <div class="lang-hi">मुख्य रूप से <strong>स्टार्च (मंड)</strong> के रूप में संचित।</div>
      </td>
      <td>
        <div class="lang-en">Stored primarily as <strong>Glycogen</strong> and fat droplets.</div>
        <div class="lang-hi">मुख्य रूप से <strong>ग्लाइकोजन (Glycogen)</strong> एवं वसा के रूप में संचित।</div>
      </td>
    </tr>
    <tr>
      <td>
        <div class="lang-en"><strong>Cytokinesis Mode (कोशिकाद्रव्य विभाजन)</strong></div>
        <div class="lang-hi"><strong>कोशिकाद्रव्य विभाजन की विधि</strong></div>
      </td>
      <td>
        <div class="lang-en"><strong>Cell Plate method</strong> (Centrifugal: center to periphery).</div>
        <div class="lang-hi"><strong>कोशिका पट्टिका (Cell Plate) विधि</strong> (केंद्र से परिधि की ओर)।</div>
      </td>
      <td>
        <div class="lang-en"><strong>Cleavage Furrow method</strong> (Centripetal: periphery to center).</div>
        <div class="lang-hi"><strong>खांच (Cleavage Furrow) विधि</strong> (परिधि से केंद्र की ओर)।</div>
      </td>
    </tr>
    <tr>
      <td>
        <div class="lang-en"><strong>Cell Shape (आकार)</strong></div>
        <div class="lang-hi"><strong>कोशिका का आकार</strong></div>
      </td>
      <td>
        <div class="lang-en">Fixed, rectangular, and rigid polygonal shape.</div>
        <div class="lang-hi">निश्चित, आयताकार एवं दृढ़ बहुभुजाकार आकृति।</div>
      </td>
      <td>
        <div class="lang-en">Flexible, irregular, or spherical shape.</div>
        <div class="lang-hi">लचीली, परिवर्तनशील अथवा गोलाकार आकृति।</div>
      </td>
    </tr>
  </tbody>
</table>""")

    # 9. Insert SVG 2
    html.append(svg_cell_cycle)

    # 10. Section 7: Cell Division & The Cell Cycle
    html.append("""<h2><span class="lang-en">7. Cell Division & The Cell Cycle</span><span class="lang-hi">7. कोशिका चक्र एवं कोशिका विभाजन</span></h2>

<h3><span class="lang-en">A. Interphase — The Preparatory Phase (95% Duration)</span><span class="lang-hi">A. अंतरावस्था (Interphase) — विश्राम या तैयारी का चरण</span></h3>
<div class="lang-en">
  <div class="lang-card-en">
    <p>A highly metabolically active phase occupying ~95% of total cycle time. Subdivided into:
    1. <strong>$G_1$ Phase (Gap 1):</strong> Intensive cell growth, RNA synthesis, and protein accumulation. 
    2. <strong>S Phase (Synthesis Phase):</strong> <strong>DNA Replication</strong> takes place here; DNA content doubles from $2C$ to $4C$, but chromosome number remains identical ($2n$). Centrioles also duplicate in the cytoplasm. 
    3. <strong>$G_2$ Phase (Gap 2):</strong> Synthesis of tubulin spindle proteins in preparation for Mitosis.
    4. <strong>$G_0$ Phase (Quiescent Stage):</strong> Inactive metabolic resting state entered by non-dividing mature cells such as adult Heart muscle cells and Neurons.</p>
  </div>
</div>
<div class="lang-hi">
  <div class="lang-card-hi">
    <p>यह कोशिका चक्र की सबसे लंबी अवस्था है (~95% समय)। इसके तीन मुख्य उप-चरण होते हैं:
    1. <strong>$G_1$ चरण:</strong> तीव्र कोशिकीय वृद्धि तथा RNA व प्रोटीन का निर्माण।
    2. <strong>S चरण (संश्लेषण चरण):</strong> <strong>DNA का द्विगुणन (Replication)</strong> इसी चरण में होता है; DNA की मात्रा $2C$ से बढ़कर $4C$ हो जाती है, किंतु गुणसूत्रों की संख्या समान ($2n$) रहती है।
    3. <strong>$G_2$ चरण:</strong> तर्कुतंतु निर्माण हेतु ट्यूबुलिन प्रोटीन का संश्लेषण।
    4. <strong>$G_0$ शांत अवस्था (Quiescent Stage):</strong> जो कोशिकाएं आगे विभाजित नहीं होतीं (जैसे हृदय पेशियां और तंत्रिका कोशिकाएं), वे $G_0$ अवस्था में प्रवेश कर जाती हैं।</p>
  </div>
</div>

<h3><span class="lang-en">B. Mitosis (समसूत्री विभाजन) — Equational Division</span><span class="lang-hi">B. समसूत्री विभाजन (Mitosis) — कायिक विभाजन</span></h3>
<div class="lang-en">
  <div class="lang-card-en">
    <p>Occurs in <strong>somatic (body) cells</strong> for growth, tissue repair, and regeneration. One parent cell yields <strong>two genetically identical diploid ($2n$) daughter cells</strong>. Comprises 4 sequential stages:
    1. <strong>Prophase:</strong> Chromatin condenses into visible chromosomes; nucleolus and nuclear envelope disintegrate.
    2. <strong>Metaphase:</strong> Chromosomes align along the equatorial plate (Metaphasic plate). <em>Chromosome shape and morphology are best studied during Metaphase!</em>
    3. <strong>Anaphase:</strong> Centromeres split; sister chromatids are pulled apart toward opposite poles. (Shortest phase).
    4. <strong>Telophase:</strong> Chromosomes decondense; nuclear envelope and nucleoli re-form at both poles.</p>
  </div>
</div>
<div class="lang-hi">
  <div class="lang-card-hi">
    <p>यह <strong>कायिक कोशिकाओं (Somatic Cells)</strong> में शारीरिक वृद्धि, ऊतक मरम्मत तथा घाव भरने हेतु होता है। इसमें एक मातृ कोशिका से <strong>दो समान द्विगुणित ($2n$) संतति कोशिकाएं</strong> बनती हैं। इसके 4 चरण होते हैं:
    1. <strong>पूर्वावस्था (Prophase):</strong> क्रोमैटिन संघनित होकर स्पष्ट गुणसूत्र बनते हैं; केंद्रक झिल्ली व केंद्रिका लुप्त हो जाती है।
    2. <strong>मध्यावस्था (Metaphase):</strong> सभी गुणसूत्र विषुवत रेखा (मध्य पट्टिका) पर पंक्तिबद्ध हो जाते हैं। <em>गुणसूत्रों के आकार और आकृति का अध्ययन मध्यावस्था में ही सर्वोत्तम होता है!</em>
    3. <strong>पश्चावस्था (Anaphase):</strong> सेंट्रोमियर टूटते हैं और अर्धगुणसूत्र विपरीत ध्रुवों की ओर खिंचते हैं (सबसे छोटा चरण)।
    4. <strong>अंत्यावस्था (Telophase):</strong> विपरीत ध्रुवों पर दोनों संतति केंद्रकों का पुनः निर्माण होता है।</p>
  </div>
</div>

<h3><span class="lang-en">C. Meiosis (अर्धसूत्री विभाजन) — Reductional Division</span><span class="lang-hi">C. अर्धसूत्री विभाजन (Meiosis) — जनन विभाजन</span></h3>
<div class="lang-en">
  <div class="lang-card-en">
    <p>Occurs specifically in <strong>germ / reproductive cells</strong> during gametogenesis (sperm & egg formation). One diploid ($2n$) parent cell undergoes two nuclear divisions to yield <strong>four genetically diverse haploid ($n$) gamete cells</strong>.
    <br/>
    <strong>Prophase-I of Meiosis-I is exceptionally important:</strong>
    <ul>
      <li><strong>Leptotene:</strong> Chromatin condenses into thin threads like a bouquet.</li>
      <li><strong>Zygotene:</strong> Homologous chromosomes pair up side-by-side (process called <strong>Synapsis</strong>), forming bivalents.</li>
      <li><strong>Pachytene:</strong> <strong>Crossing Over</strong> takes place between non-sister chromatids of homologous chromosomes, catalyzed by <strong>Recombinase enzyme</strong>. This creates genetic recombination and evolutionary diversity!</li>
      <li><strong>Diplotene:</strong> Synaptonemal complex dissolves; X-shaped crossing points called <strong>Chiasmata</strong> become visible.</li>
      <li><strong>Diakinesis:</strong> Terminalization of chiasmata; nuclear envelope breaks down.</li>
    </ul></p>
  </div>
</div>
<div class="lang-hi">
  <div class="lang-card-hi">
    <p>यह जनन कोशिकाओं में युग्मक (शुक्राणु व अंडाणु) निर्माण के समय होता है। एक द्विगुणित ($2n$) कोशिका से <strong>चार अगुणित ($n$) संतति कोशिकाएं</strong> बनती हैं। इसमें गुणसूत्रों की संख्या आधी हो जाती है।
    <br/>
    <strong>पूर्वावस्था-I (Prophase-I) के 5 महत्वपूर्ण उप-चरण:</strong>
    <ul>
      <li><strong>लेप्टोटीन (Leptotene):</strong> गुणसूत्र पतले धागेनुमा दिखाई देते हैं।</li>
      <li><strong>जाइगोटीन (Zygotene):</strong> समजात गुणसूत्र आपस में जोड़े बनाते हैं; इस प्रक्रिया को <strong>सूत्रयुग्मन (Synapsis)</strong> कहते हैं।</li>
      <li><strong>पैकिटीन (Pachytene):</strong> समजात गुणसूत्रों के बीच जीन विनिमय अर्थात <strong>Crossing Over</strong> होता है (एंजाइम: रीकॉम्बिनेज)। इसी से संतानों में आनुवंशिक विभिन्नताएं उत्पन्न होती हैं!</li>
      <li><strong>डिप्लोटीन (Diplotene):</strong> X-आकार के क्रॉस बिंदु जिन्हें <strong>काएज्मेटा (Chiasmata)</strong> कहते हैं, स्पष्ट दिखाई देते हैं।</li>
      <li><strong>डायकाइनेसिस (Diakinesis):</strong> काएज्मेटा का उपांतीभवन होता है तथा केंद्रक झिल्ली लुप्त हो जाती है।</li>
    </ul></p>
  </div>
</div>""")

    # 11. Section 8 & Table 5
    html.append("""<h2><span class="lang-en">8. Non-Cellular Entities: Viruses, Viroids & Prions</span><span class="lang-hi">8. अकोशिकीय जैविक कण: विषाणु, वाइरोइड्स एवं प्रायोन्स</span></h2>

<table class="notes-table">
  <thead>
    <tr>
      <th>
        <span class="lang-en">Entity</span>
        <span class="lang-hi">जैविक कण</span>
      </th>
      <th>
        <span class="lang-en">Chemical Composition</span>
        <span class="lang-hi">रासायनिक संघटन</span>
      </th>
      <th>
        <span class="lang-en">Discoverer / Milestone</span>
        <span class="lang-hi">खोजकर्ता वैज्ञानिक</span>
      </th>
      <th>
        <span class="lang-en">Core Biological Facts</span>
        <span class="lang-hi">मुख्य जैविक तथ्य</span>
      </th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td>
        <div class="lang-en"><strong>Virus (विषाणु)</strong></div>
        <div class="lang-hi"><strong>विषाणु (Virus)</strong></div>
      </td>
      <td>
        <div class="lang-en"><strong>Genetic Core (DNA or RNA, never both) + Protein Coat (Capsid).</strong></div>
        <div class="lang-hi"><strong>आनुवंशिक पदार्थ (DNA या RNA, कभी दोनों नहीं) + प्रोटीन आवरण (Capsid)।</strong></div>
      </td>
      <td>
        <div class="lang-en">Dmitri Ivanovsky (1892); Crystallized by W. M. Stanley (1935).</div>
        <div class="lang-hi">दिमित्री इवानोव्स्की (1892); क्रिस्टलीकरण: डब्ल्यू. एम. स्टेनली (1935)।</div>
      </td>
      <td>
        <div class="lang-en">Borderline of living and non-living. Obligate intracellular parasites; completely inert outside host.</div>
        <div class="lang-hi">सजीव और निर्जीव के बीच की योजक कड़ी। पोषक शरीर के बाहर पूर्णतः निष्क्रिय क्रिस्टल समान।</div>
      </td>
    </tr>
    <tr>
      <td>
        <div class="lang-en"><strong>Viroid (वाइरोइड)</strong></div>
        <div class="lang-hi"><strong>वाइरोइड (Viroid)</strong></div>
      </td>
      <td>
        <div class="lang-en"><strong>Free infectious RNA only</strong> (completely lacks a protein coat).</div>
        <div class="lang-hi"><strong>केवल स्वतंत्र संक्रामक RNA</strong> (इसमें प्रोटीन का आवरण नहीं होता)।</div>
      </td>
      <td>
        <div class="lang-en">T. O. Diener (1971).</div>
        <div class="lang-hi">टी. ओ. डाइनर (1971)।</div>
      </td>
      <td>
        <div class="lang-en">Smaller than viruses. Low molecular weight RNA causing <em>Potato Spindle Tuber Disease</em>.</div>
        <div class="lang-hi">विषाणु से भी छोटे। आलू में <em>पोटैटो स्पिंडल ट्यूबर रोग</em> उत्पन्न करते हैं।</div>
      </td>
    </tr>
    <tr>
      <td>
        <div class="lang-en"><strong>Prion (प्रायोन)</strong></div>
        <div class="lang-hi"><strong>प्रायोन (Prion)</strong></div>
      </td>
      <td>
        <div class="lang-en"><strong>Abnormally folded infectious protein only</strong> (completely lacks nucleic acids).</div>
        <div class="lang-hi"><strong>केवल असामान्य रूप से मुड़ा हुआ संक्रामक प्रोटीन</strong> (DNA या RNA नहीं होता)।</div>
      </td>
      <td>
        <div class="lang-en">Stanley B. Prusiner (Nobel Prize 1997).</div>
        <div class="lang-hi">स्टैनली बी. प्रूसिनर (नोबेल पुरस्कार 1997)।</div>
      </td>
      <td>
        <div class="lang-en">Causes neurodegenerative diseases: <em>Mad Cow Disease (BSE)</em> and <em>Kuru / CJD</em> in humans.</div>
        <div class="lang-hi">घातक न्यूरोलॉजिकल रोग उत्पन्न करते हैं: मवेशियों में <em>मैड काउ रोग (BSE)</em> तथा मानव में <em>कुरु / CJD रोग</em>।</div>
      </td>
    </tr>
  </tbody>
</table>""")

    # 12. Section 9: 10 Core Highlights (No exam traps label)
    html.append("""<h2><span class="lang-en">9. 🔥 Key High-Yield Chapter Highlights</span><span class="lang-hi">9. 🔥 अध्याय के 10 सर्वाधिक महत्वपूर्ण मुख्य बिंदु</span></h2>

<div class="callout-box alert">
  <ol>
    <li>
      <div class="lang-en"><strong>Point 1: Which cell organelles possess their own circular DNA and 70S ribosomes?</strong><br/>
      👉 <strong>Answer:</strong> <em>Mitochondria</em> and <em>Chloroplasts</em> (termed Semi-autonomous organelles).</div>
      <div class="lang-hi"><strong>बिंदु 1: किन कोशिकांगों के पास अपना स्वयं का DNA और 70S राइबोसोम होता है?</strong><br/>
      👉 <strong>उत्तर:</strong> <strong>माइटोकॉन्ड्रिया</strong> एवं <strong>हरितलवक (Chloroplast)</strong> (इन्हें अर्ध-स्वायत्त कोशिकांग कहते हैं)।</div>
    </li>
    
    <li>
      <div class="lang-en"><strong>Point 2: Which metal ion is present at the molecular center of Chlorophyll pigment?</strong><br/>
      👉 <strong>Answer:</strong> <strong>Magnesium (Mg²⁺)</strong> (analogous to Iron Fe²⁺ in human Hemoglobin).</div>
      <div class="lang-hi"><strong>बिंदु 2: क्लोरोफिल (पर्णहरित) वर्णक के केंद्र में कौन सा धातु आयन पाया जाता है?</strong><br/>
      👉 <strong>उत्तर:</strong> <strong>मैग्नीशियम (Mg²⁺)</strong> (जिस प्रकार रक्त हीमोग्लोबिन के केंद्र में आयरन Fe²⁺ होता है)।</div>
    </li>
    
    <li>
      <div class="lang-en"><strong>Point 3: In which specific phase of the cell cycle does DNA replication take place?</strong><br/>
      👉 <strong>Answer:</strong> <strong>S Phase (Synthesis Phase)</strong> of Interphase.</div>
      <div class="lang-hi"><strong>बिंदु 3: कोशिका चक्र के किस विशिष्ट चरण में DNA का प्रतिकृतिकरण (Replication) होता है?</strong><br/>
      👉 <strong>उत्तर:</strong> अंतरावस्था की <strong>S प्रावस्था (संश्लेषण चरण)</strong> में।</div>
    </li>
    
    <li>
      <div class="lang-en"><strong>Point 4: During which stage of Mitosis is chromosome shape and morphology best studied?</strong><br/>
      👉 <strong>Answer:</strong> <strong>Metaphase</strong> (when chromosomes align along the equatorial plate).</div>
      <div class="lang-hi"><strong>बिंदु 4: समसूत्री विभाजन के किस चरण में गुणसूत्रों की आकृति का अध्ययन सर्वोत्तम होता है?</strong><br/>
      👉 <strong>उत्तर:</strong> <strong>मध्यावस्था (Metaphase)</strong> में (जब सभी गुणसूत्र मध्य रेखा पर सुव्यवस्थित होते हैं)।</div>
    </li>
    
    <li>
      <div class="lang-en"><strong>Point 5: In which sub-stage of Meiosis does Crossing Over (genetic recombination) occur?</strong><br/>
      👉 <strong>Answer:</strong> <strong>Pachytene stage</strong> of Prophase-I (catalyzed by Recombinase enzyme).</div>
      <div class="lang-hi"><strong>बिंदु 5: अर्धसूत्री विभाजन के किस उप-चरण में 'जीन विनिमय' (Crossing Over) होता है?</strong><br/>
      👉 <strong>उत्तर:</strong> पूर्वावस्था-I की <strong>पैकिटीन (Pachytene)</strong> अवस्था में (रीकॉम्बिनेज एंजाइम द्वारा)।</div>
    </li>
    
    <li>
      <div class="lang-en"><strong>Point 6: Which organelle is famously designated as the "Post Office / Packaging Center" of the cell?</strong><br/>
      👉 <strong>Answer:</strong> <strong>Golgi Apparatus (Golgi Body)</strong>.</div>
      <div class="lang-hi"><strong>बिंदु 6: कोशिका का 'डाकघर' या 'पैकेजिंग केंद्र' किस कोशिकांग को कहा जाता है?</strong><br/>
      👉 <strong>उत्तर:</strong> <strong>गॉल्जीकाय (Golgi Apparatus)</strong> को।</div>
    </li>
    
    <li>
      <div class="lang-en"><strong>Point 7: Why do lysosomes fail to digest themselves under normal healthy conditions?</strong><br/>
      👉 <strong>Answer:</strong> Their hydrolytic enzymes are safely sequestered behind a resilient single lipid membrane and operate strictly at an acidic pH (~5.0).</div>
      <div class="lang-hi"><strong>बिंदु 7: सामान्य परिस्थितियों में लाइसोसोम स्वयं की कोशिका का पाचन क्यों नहीं करते?</strong><br/>
      👉 <strong>उत्तर:</strong> इनके पाचक एंजाइम एकल झिल्ली में सुरक्षित बंद रहते हैं और केवल अम्लीय pH (~5.0) पर ही सक्रिय होते हैं।</div>
    </li>
    
    <li>
      <div class="lang-en"><strong>Point 8: The cell wall of fungi is composed of which unique chemical polymer?</strong><br/>
      👉 <strong>Answer:</strong> <strong>Chitin</strong> (a nitrogen-containing polysaccharide).</div>
      <div class="lang-hi"><strong>बिंदु 8: कवकों (Fungi) की कोशिका भित्ति किस रासायनिक पदार्थ की बनी होती है?</strong><br/>
      👉 <strong>उत्तर:</strong> <strong>काइटिन (Chitin)</strong> की।</div>
    </li>
    
    <li>
      <div class="lang-en"><strong>Point 9: What is the primary chemical difference between plant and bacterial cell walls?</strong><br/>
      👉 <strong>Answer:</strong> Plant cell walls are made of <strong>Cellulose</strong>, whereas bacterial cell walls are made of <strong>Peptidoglycan (Murein)</strong>.</div>
      <div class="lang-hi"><strong>बिंदु 9: पादप कोशिका भित्ति तथा जीवाणु कोशिका भित्ति में मुख्य रासायनिक अंतर क्या है?</strong><br/>
      👉 <strong>उत्तर:</strong> पादप भित्ति <strong>सेलूलोज़</strong> से तथा जीवाणु भित्ति <strong>पेप्टिडोग्लाइकन (म्यूरीन)</strong> से निर्मित होती है।</div>
    </li>
    
    <li>
      <div class="lang-en"><strong>Point 10: Which cellular substance was termed the "Physical Basis of Life"?</strong><br/>
      👉 <strong>Answer:</strong> <strong>Protoplasm (जीवद्रव्य)</strong> (coined by Purkinje; termed by T. H. Huxley).</div>
      <div class="lang-hi"><strong>बिंदु 10: 'जीवन का भौतिक आधार' (Physical Basis of Life) किसे कहा गया है?</strong><br/>
      👉 <strong>उत्तर:</strong> <strong>जीवद्रव्य (Protoplasm)</strong> को (वैज्ञानिक हक्सले द्वारा)।</div>
    </li>
  </ol>
</div>""")

    # 13. Section 10: 15 Master MCQs (Strictly based on this chapter, No exam tags)
    html.append("""<h2><span class="lang-en">10. Chapter Self-Assessment Quiz (15 Master MCQs)</span><span class="lang-hi">10. अध्याय स्व-मूल्यांकन प्रश्नोत्तरी (15 महत्वपूर्ण वस्तुनिष्ठ प्रश्न)</span></h2>

<!-- MCQ 1 -->
<div class="quiz-card">
  <span class="quiz-badge">Question 1 / 15</span>
  <div class="quiz-question">
    <div class="lang-en">Q1. Who first observed dead cork cells under a compound microscope and coined the scientific term "Cell"?</div>
    <div class="lang-hi">प्रश्न 1. कॉर्क के टुकड़े में सर्वप्रथम मृत कोशिकाओं को देखकर "Cell" (कोशिका) शब्द का प्रतिपादन किसने किया था?</div>
  </div>
  <div class="quiz-options">
    <div class="quiz-option" data-opt="A" data-is-correct="false"><span class="quiz-option-key">A</span> <span class="lang-en">Antonie van Leeuwenhoek</span><span class="lang-hi">एंटनी वॉन ल्यूवेनहॉक</span></div>
    <div class="quiz-option" data-opt="B" data-is-correct="true"><span class="quiz-option-key">B</span> <span class="lang-en">Robert Hooke</span><span class="lang-hi">रॉबर्ट हुक</span></div>
    <div class="quiz-option" data-opt="C" data-is-correct="false"><span class="quiz-option-key">C</span> <span class="lang-en">Robert Brown</span><span class="lang-hi">रॉबर्ट ब्राउन</span></div>
    <div class="quiz-option" data-opt="D" data-is-correct="false"><span class="quiz-option-key">D</span> <span class="lang-en">Theodor Schwann</span><span class="lang-hi">थियोडोर श्वान</span></div>
  </div>
  <details class="quiz-reveal">
    <summary>💡 Reveal Answer & Detailed Solution (उत्तर एवं विस्तृत व्याख्या)</summary>
    <div class="quiz-explanation">
      <div class="lang-en">
        <strong>✅ Correct Answer: B) Robert Hooke</strong><br/>
        <strong>Explanation:</strong> In 1665, Robert Hooke observed honeycomb-like compartments in dead cork tissue and coined the term "Cell" (from Latin <em>cellula</em>). He published his findings in the book <em>Micrographia</em>.
      </div>
      <div class="lang-hi">
        <strong>✅ सही उत्तर: B) रॉबर्ट हुक</strong><br/>
        <strong>व्याख्या:</strong> 1665 में रॉबर्ट हुक ने कॉर्क की पतली काट में मधुमक्खी के छत्ते जैसी संरचनाएं देखीं और उन्हें "Cell" नाम दिया। इन्होंने अपनी खोज को प्रसिद्ध पुस्तक <em>Micrographia</em> में प्रकाशित किया था।
      </div>
    </div>
  </details>
</div>

<!-- MCQ 2 -->
<div class="quiz-card">
  <span class="quiz-badge">Question 2 / 15</span>
  <div class="quiz-question">
    <div class="lang-en">Q2. Which scientist was the first to observe and describe free-living cells (bacteria, protozoa, and RBCs) under a microscope?</div>
    <div class="lang-hi">प्रश्न 2. सर्वप्रथम जीवित कोशिकाओं (जीवाणु, प्रोटोजोआ एवं RBC) को सूक्ष्मदर्शी से देखने और उनका वर्णन करने वाले वैज्ञानिक कौन थे?</div>
  </div>
  <div class="quiz-options">
    <div class="quiz-option" data-opt="A" data-is-correct="false"><span class="quiz-option-key">A</span> <span class="lang-en">Robert Hooke</span><span class="lang-hi">रॉबर्ट हुक</span></div>
    <div class="quiz-option" data-opt="B" data-is-correct="true"><span class="quiz-option-key">B</span> <span class="lang-en">Antonie van Leeuwenhoek</span><span class="lang-hi">एंटनी वॉन ल्यूवेनहॉक</span></div>
    <div class="quiz-option" data-opt="C" data-is-correct="false"><span class="quiz-option-key">C</span> <span class="lang-en">Rudolf Virchow</span><span class="lang-hi">रुडोल्फ विरचो</span></div>
    <div class="quiz-option" data-opt="D" data-is-correct="false"><span class="quiz-option-key">D</span> <span class="lang-en">J. E. Purkinje</span><span class="lang-hi">जे. ई. पुरकिंजे</span></div>
  </div>
  <details class="quiz-reveal">
    <summary>💡 Reveal Answer & Detailed Solution (उत्तर एवं विस्तृत व्याख्या)</summary>
    <div class="quiz-explanation">
      <div class="lang-en">
        <strong>✅ Correct Answer: B) Antonie van Leeuwenhoek</strong><br/>
        <strong>Explanation:</strong> In 1674, Antonie van Leeuwenhoek observed living microbes and spermatozoa with improved high-magnification handcrafted lenses, earning him the title 'Father of Microbiology'.
      </div>
      <div class="lang-hi">
        <strong>✅ सही उत्तर: B) एंटनी वॉन ल्यूवेनहॉक</strong><br/>
        <strong>व्याख्या:</strong> 1674 में एंटनी वॉन ल्यूवेनहॉक ने स्वनिर्मित सूक्ष्मदर्शी से पहली बार स्वतंत्र जीवित कोशिकाओं को देखा। इन्हें 'सूक्ष्म जीव विज्ञान का पिता' कहा जाता है।
      </div>
    </div>
  </details>
</div>

<!-- MCQ 3 -->
<div class="quiz-card">
  <span class="quiz-badge">Question 3 / 15</span>
  <div class="quiz-question">
    <div class="lang-en">Q3. The living fluid substance inside the cell was designated as "Protoplasm" by which scientist?</div>
    <div class="lang-hi">प्रश्न 3. कोशिका के भीतर उपस्थित तरल सजीव पदार्थ को 'जीवद्रव्य' (Protoplasm) नाम किस वैज्ञानिक ने दिया था?</div>
  </div>
  <div class="quiz-options">
    <div class="quiz-option" data-opt="A" data-is-correct="false"><span class="quiz-option-key">A</span> <span class="lang-en">Robert Brown</span><span class="lang-hi">रॉबर्ट ब्राउन</span></div>
    <div class="quiz-option" data-opt="B" data-is-correct="true"><span class="quiz-option-key">B</span> <span class="lang-en">J. E. Purkinje</span><span class="lang-hi">जे. ई. पुरकिंजे</span></div>
    <div class="quiz-option" data-opt="C" data-is-correct="false"><span class="quiz-option-key">C</span> <span class="lang-en">Matthias Schleiden</span><span class="lang-hi">मथायस श्लीडेन</span></div>
    <div class="quiz-option" data-opt="D" data-is-correct="false"><span class="quiz-option-key">D</span> <span class="lang-en">Camillo Golgi</span><span class="lang-hi">कैमिलो गॉल्जी</span></div>
  </div>
  <details class="quiz-reveal">
    <summary>💡 Reveal Answer & Detailed Solution (उत्तर एवं विस्तृत व्याख्या)</summary>
    <div class="quiz-explanation">
      <div class="lang-en">
        <strong>✅ Correct Answer: B) J. E. Purkinje</strong><br/>
        <strong>Explanation:</strong> J. E. Purkinje coined the term "Protoplasm" in 1839 for the living jelly-like substance of the cell. Later, T. H. Huxley termed it the "Physical Basis of Life".
      </div>
      <div class="lang-hi">
        <strong>✅ सही उत्तर: B) जे. ई. पुरकिंजे</strong><br/>
        <strong>व्याख्या:</strong> 1839 में जे. ई. पुरकिंजे ने कोशिका के जीवित तरल द्रव्य को 'जीवद्रव्य' (Protoplasm) नाम दिया। वैज्ञानिक हक्सले ने इसे 'जीवन का भौतिक आधार' कहा था।
      </div>
    </div>
  </details>
</div>

<!-- MCQ 4 -->
<div class="quiz-card">
  <span class="quiz-badge">Question 4 / 15</span>
  <div class="quiz-question">
    <div class="lang-en">Q4. The famous aphorism "Omnis cellula-e-cellula" (all cells arise only from pre-existing cells) was formulated by:</div>
    <div class="lang-hi">प्रश्न 4. "Omnis cellula-e-cellula" (सभी नई कोशिकाएं पूर्ववर्ती कोशिकाओं से ही बनती हैं) का प्रसिद्ध सिद्धांत किसने प्रतिपादित किया?</div>
  </div>
  <div class="quiz-options">
    <div class="quiz-option" data-opt="A" data-is-correct="false"><span class="quiz-option-key">A</span> <span class="lang-en">Theodor Schwann</span><span class="lang-hi">थियोडोर श्वान</span></div>
    <div class="quiz-option" data-opt="B" data-is-correct="false"><span class="quiz-option-key">B</span> <span class="lang-en">Matthias Schleiden</span><span class="lang-hi">मथायस श्लीडेन</span></div>
    <div class="quiz-option" data-opt="C" data-is-correct="true"><span class="quiz-option-key">C</span> <span class="lang-en">Rudolf Virchow</span><span class="lang-hi">रुडोल्फ विरचो</span></div>
    <div class="quiz-option" data-opt="D" data-is-correct="false"><span class="quiz-option-key">D</span> <span class="lang-en">Carl Benda</span><span class="lang-hi">कार्ल बेंडा</span></div>
  </div>
  <details class="quiz-reveal">
    <summary>💡 Reveal Answer & Detailed Solution (उत्तर एवं विस्तृत व्याख्या)</summary>
    <div class="quiz-explanation">
      <div class="lang-en">
        <strong>✅ Correct Answer: C) Rudolf Virchow</strong><br/>
        <strong>Explanation:</strong> In 1855, Rudolf Virchow modified the Cell Theory of Schleiden and Schwann by establishing that new cells originate solely from the division of previously existing cells.
      </div>
      <div class="lang-hi">
        <strong>✅ सही उत्तर: C) रुडोल्फ विरचो</strong><br/>
        <strong>व्याख्या:</strong> 1855 में रुडोल्फ विरचो ने कोशिका सिद्धांत को पूर्ण करते हुए बताया कि नई कोशिकाएं केवल पहले से मौजूद कोशिकाओं के विभाजन से ही पैदा होती हैं।
      </div>
    </div>
  </details>
</div>

<!-- MCQ 5 -->
<div class="quiz-card">
  <span class="quiz-badge">Question 5 / 15</span>
  <div class="quiz-question">
    <div class="lang-en">Q5. Which of the following biological entities is universally regarded as an exception to the classical Cell Theory?</div>
    <div class="lang-hi">प्रश्न 5. निम्नलिखित में से किसे शास्त्रीय कोशिका सिद्धांत (Cell Theory) का सबसे प्रमुख अपवाद माना जाता है?</div>
  </div>
  <div class="quiz-options">
    <div class="quiz-option" data-opt="A" data-is-correct="false"><span class="quiz-option-key">A</span> <span class="lang-en">Bacteria</span><span class="lang-hi">जीवाणु (Bacteria)</span></div>
    <div class="quiz-option" data-opt="B" data-is-correct="false"><span class="quiz-option-key">B</span> <span class="lang-en">Fungi</span><span class="lang-hi">कवक (Fungi)</span></div>
    <div class="quiz-option" data-opt="C" data-is-correct="true"><span class="quiz-option-key">C</span> <span class="lang-en">Viruses</span><span class="lang-hi">विषाणु (Viruses)</span></div>
    <div class="quiz-option" data-opt="D" data-is-correct="false"><span class="quiz-option-key">D</span> <span class="lang-en">Cyanobacteria</span><span class="lang-hi">नील-हरित शैवाल (Cyanobacteria)</span></div>
  </div>
  <details class="quiz-reveal">
    <summary>💡 Reveal Answer & Detailed Solution (उत्तर एवं विस्तृत व्याख्या)</summary>
    <div class="quiz-explanation">
      <div class="lang-en">
        <strong>✅ Correct Answer: C) Viruses</strong><br/>
        <strong>Explanation:</strong> Viruses (along with Viroids and Prions) lack cellular organization, cytoplasm, and autonomous metabolic machinery outside a host cell, making them non-cellular exceptions to the Cell Theory.
      </div>
      <div class="lang-hi">
        <strong>✅ सही उत्तर: C) विषाणु (Viruses)</strong><br/>
        <strong>व्याख्या:</strong> विषाणुओं में कोई कोशिकीय संरचना, कोशिकाद्रव्य या उपापचयी तंत्र नहीं होता। ये सजीव शरीर के बाहर निर्जीव क्रिस्टल की भांति रहते हैं, अतः कोशिका सिद्धांत के अपवाद हैं।
      </div>
    </div>
  </details>
</div>

<!-- MCQ 6 -->
<div class="quiz-card">
  <span class="quiz-badge">Question 6 / 15</span>
  <div class="quiz-question">
    <div class="lang-en">Q6. What is the smallest known living cell capable of autonomous existence on Earth?</div>
    <div class="lang-hi">प्रश्न 6. पृथ्वी पर स्वतंत्र अस्तित्व में सक्षम सबसे छोटी जीवित कोशिका कौन सी है?</div>
  </div>
  <div class="quiz-options">
    <div class="quiz-option" data-opt="A" data-is-correct="true"><span class="quiz-option-key">A</span> <span class="lang-en"><em>Mycoplasma gallisepticum</em> (PPLO)</span><span class="lang-hi"><em>माइकोप्लाज्मा गैलीसेप्टिकम</em> (PPLO)</span></div>
    <div class="quiz-option" data-opt="B" data-is-correct="false"><span class="quiz-option-key">B</span> <span class="lang-en">Amoeba proteus</span><span class="lang-hi">अमीबा प्रोटियस</span></div>
    <div class="quiz-option" data-opt="C" data-is-correct="false"><span class="quiz-option-key">C</span> <span class="lang-en">Human Red Blood Cell (RBC)</span><span class="lang-hi">मानव लाल रक्त कणिका (RBC)</span></div>
    <div class="quiz-option" data-opt="D" data-is-correct="false"><span class="quiz-option-key">D</span> <span class="lang-en">Acetabularia</span><span class="lang-hi">एसिटाबुलेरिया</span></div>
  </div>
  <details class="quiz-reveal">
    <summary>💡 Reveal Answer & Detailed Solution (उत्तर एवं विस्तृत व्याख्या)</summary>
    <div class="quiz-explanation">
      <div class="lang-en">
        <strong>✅ Correct Answer: A) <em>Mycoplasma gallisepticum</em> (PPLO)</strong><br/>
        <strong>Explanation:</strong> Mycoplasma (PPLO - Pleuropneumonia-like organisms) measures just 0.1 to 0.3 μm in diameter. It naturally lacks a rigid cell wall, making it naturally immune to penicillin antibiotics.
      </div>
      <div class="lang-hi">
        <strong>✅ सही उत्तर: A) <em>माइकोप्लाज्मा गैलीसेप्टिकम</em> (PPLO)</strong><br/>
        <strong>व्याख्या:</strong> माइकोप्लाज्मा का व्यास मात्र 0.1 से 0.3 माइक्रोमीटर होता है। इसमें कोशिका भित्ति नहीं पाई जाती, इसलिए पेनिसिलिन जैसे एंटीबायोटिक का इस पर कोई प्रभाव नहीं पड़ता।
      </div>
    </div>
  </details>
</div>

<!-- MCQ 7 -->
<div class="quiz-card">
  <span class="quiz-badge">Question 7 / 15</span>
  <div class="quiz-question">
    <div class="lang-en">Q7. The universally accepted "Fluid Mosaic Model" explaining plasma membrane structure was proposed in 1972 by:</div>
    <div class="lang-hi">प्रश्न 7. प्लाज्मा झिल्ली की संरचना को समझाने वाला सर्वमान्य "तरल मोज़ेक मॉडल" (Fluid Mosaic Model) 1972 में किसने प्रस्तुत किया था?</div>
  </div>
  <div class="quiz-options">
    <div class="quiz-option" data-opt="A" data-is-correct="false"><span class="quiz-option-key">A</span> <span class="lang-en">Watson and Crick</span><span class="lang-hi">वाटसन एवं क्रिक</span></div>
    <div class="quiz-option" data-opt="B" data-is-correct="true"><span class="quiz-option-key">B</span> <span class="lang-en">S. J. Singer and G. L. Nicolson</span><span class="lang-hi">एस. जे. सिंगर एवं जी. एल. निकोलसन</span></div>
    <div class="quiz-option" data-opt="C" data-is-correct="false"><span class="quiz-option-key">C</span> <span class="lang-en">Schleiden and Schwann</span><span class="lang-hi">श्लीडेन एवं श्वान</span></div>
    <div class="quiz-option" data-opt="D" data-is-correct="false"><span class="quiz-option-key">D</span> <span class="lang-en">Theodor Boveri</span><span class="lang-hi">थियोडोर बोवेरी</span></div>
  </div>
  <details class="quiz-reveal">
    <summary>💡 Reveal Answer & Detailed Solution (उत्तर एवं विस्तृत व्याख्या)</summary>
    <div class="quiz-explanation">
      <div class="lang-en">
        <strong>✅ Correct Answer: B) S. J. Singer and G. L. Nicolson</strong><br/>
        <strong>Explanation:</strong> In 1972, Singer and Nicolson described the plasma membrane as a quasi-fluid lipid bilayer in which globular proteins float like icebergs in a lipid sea.
      </div>
      <div class="lang-hi">
        <strong>✅ सही उत्तर: B) एस. जे. सिंगर एवं जी. एल. निकोलसन</strong><br/>
        <strong>व्याख्या:</strong> सिंगर और निकोलसन ने बताया कि कोशिका झिल्ली फॉस्फोलिपिड की अर्ध-तरल दोहरी परत होती है जिसमें प्रोटीन के अणु समुद्र में तैरते हुए हिमखंडों (Icebergs) की तरह व्यवस्थित रहते हैं।
      </div>
    </div>
  </details>
</div>

<!-- MCQ 8 -->
<div class="quiz-card">
  <span class="quiz-badge">Question 8 / 15</span>
  <div class="quiz-question">
    <div class="lang-en">Q8. The middle lamella that cements adjacent plant cell walls together is chemically composed primarily of:</div>
    <div class="lang-hi">प्रश्न 8. दो समीपवर्ती पादप कोशिकाओं को आपस में जोड़ने वाली 'मध्य पटलिका' (Middle Lamella) मुख्य रूप से किसकी बनी होती है?</div>
  </div>
  <div class="quiz-options">
    <div class="quiz-option" data-opt="A" data-is-correct="true"><span class="quiz-option-key">A</span> <span class="lang-en">Calcium and Magnesium Pectate</span><span class="lang-hi">कैल्शियम एवं मैग्नीशियम पेक्टेट</span></div>
    <div class="quiz-option" data-opt="B" data-is-correct="false"><span class="quiz-option-key">B</span> <span class="lang-en">Pure Cellulose</span><span class="lang-hi">शुद्ध सेलूलोज़</span></div>
    <div class="quiz-option" data-opt="C" data-is-correct="false"><span class="quiz-option-key">C</span> <span class="lang-en">Lignin & Chitin</span><span class="lang-hi">लिग्निन एवं काइटिन</span></div>
    <div class="quiz-option" data-opt="D" data-is-correct="false"><span class="quiz-option-key">D</span> <span class="lang-en">Peptidoglycan</span><span class="lang-hi">पेप्टिडोग्लाइकन</span></div>
  </div>
  <details class="quiz-reveal">
    <summary>💡 Reveal Answer & Detailed Solution (उत्तर एवं विस्तृत व्याख्या)</summary>
    <div class="quiz-explanation">
      <div class="lang-en">
        <strong>✅ Correct Answer: A) Calcium and Magnesium Pectate</strong><br/>
        <strong>Explanation:</strong> The middle lamella acts as plant cement. During fruit ripening, pectinase enzymes dissolve this pectate layer, causing fruits to turn soft and palatable.
      </div>
      <div class="lang-hi">
        <strong>✅ सही उत्तर: A) कैल्शियम एवं मैग्नीशियम पेक्टेट</strong><br/>
        <strong>व्याख्या:</strong> मध्य पटलिका पादप कोशिकाओं के बीच प्राकृतिक सीमेंट का कार्य करती है। फल पकने पर पेक्टिनेज एंजाइम इसे घुला देता है जिससे फल मुलायम हो जाते हैं।
      </div>
    </div>
  </details>
</div>

<!-- MCQ 9 -->
<div class="quiz-card">
  <span class="quiz-badge">Question 9 / 15</span>
  <div class="quiz-question">
    <div class="lang-en">Q9. Which cellular organelle is designated as the "Powerhouse of the Cell" due to its generation of ATP?</div>
    <div class="lang-hi">प्रश्न 9. कोशिकीय श्वसन द्वारा ऊर्जा (ATP) का निर्माण करने के कारण किस कोशिकांग को कोशिका का "पावरहाउस" कहा जाता है?</div>
  </div>
  <div class="quiz-options">
    <div class="quiz-option" data-opt="A" data-is-correct="false"><span class="quiz-option-key">A</span> <span class="lang-en">Golgi Apparatus</span><span class="lang-hi">गॉल्जीकाय</span></div>
    <div class="quiz-option" data-opt="B" data-is-correct="true"><span class="quiz-option-key">B</span> <span class="lang-en">Mitochondria</span><span class="lang-hi">माइटोकॉन्ड्रिया</span></div>
    <div class="quiz-option" data-opt="C" data-is-correct="false"><span class="quiz-option-key">C</span> <span class="lang-en">Lysosome</span><span class="lang-hi">लाइसोसोम</span></div>
    <div class="quiz-option" data-opt="D" data-is-correct="false"><span class="quiz-option-key">D</span> <span class="lang-en">Ribosome</span><span class="lang-hi">राइबोसोम</span></div>
  </div>
  <details class="quiz-reveal">
    <summary>💡 Reveal Answer & Detailed Solution (उत्तर एवं विस्तृत व्याख्या)</summary>
    <div class="quiz-explanation">
      <div class="lang-en">
        <strong>✅ Correct Answer: B) Mitochondria</strong><br/>
        <strong>Explanation:</strong> Mitochondria carry out the Krebs cycle and oxidative phosphorylation on their inner membrane Cristae, generating ATP (the energy currency of the cell).
      </div>
      <div class="lang-hi">
        <strong>✅ सही उत्तर: B) माइटोकॉन्ड्रिया</strong><br/>
        <strong>व्याख्या:</strong> माइटोकॉन्ड्रिया की आंतरिक झिल्ली के क्रिस्टी (Cristae) पर कोशिकीय श्वसन द्वारा ATP (ऊर्जा की मुद्रा) बनती है, इसलिए इसे कोशिका का ऊर्जा घर कहते हैं।
      </div>
    </div>
  </details>
</div>

<!-- MCQ 10 -->
<div class="quiz-card">
  <span class="quiz-badge">Question 10 / 15</span>
  <div class="quiz-question">
    <div class="lang-en">Q10. Which organelle synthesizes lipids/steroids and performs vital detoxification of poisons and drugs in liver cells?</div>
    <div class="lang-hi">प्रश्न 10. यकृत कोशिकाओं में दवाओं तथा विषैले पदार्थों के विषहरण (Detoxification) एवं लिपिड संश्लेषण का कार्य कौन सा कोशिकांग करता है?</div>
  </div>
  <div class="quiz-options">
    <div class="quiz-option" data-opt="A" data-is-correct="false"><span class="quiz-option-key">A</span> <span class="lang-en">Rough Endoplasmic Reticulum (RER)</span><span class="lang-hi">खुरदरी अंतःप्रद्रव्यी जालिका (RER)</span></div>
    <div class="quiz-option" data-opt="B" data-is-correct="true"><span class="quiz-option-key">B</span> <span class="lang-en">Smooth Endoplasmic Reticulum (SER)</span><span class="lang-hi">चिकनी अंतःप्रद्रव्यी जालिका (SER)</span></div>
    <div class="quiz-option" data-opt="C" data-is-correct="false"><span class="quiz-option-key">C</span> <span class="lang-en">Centrosome</span><span class="lang-hi">तारककाय (Centrosome)</span></div>
    <div class="quiz-option" data-opt="D" data-is-correct="false"><span class="quiz-option-key">D</span> <span class="lang-en">Nucleolus</span><span class="lang-hi">केंद्रिका (Nucleolus)</span></div>
  </div>
  <details class="quiz-reveal">
    <summary>💡 Reveal Answer & Detailed Solution (उत्तर एवं विस्तृत व्याख्या)</summary>
    <div class="quiz-explanation">
      <div class="lang-en">
        <strong>✅ Correct Answer: B) Smooth Endoplasmic Reticulum (SER)</strong><br/>
        <strong>Explanation:</strong> The Smooth ER lacks attached ribosomes. It specializes in lipid/steroid hormone synthesis and metabolizes harmful drugs and toxins in mammalian hepatocytes (liver cells).
      </div>
      <div class="lang-hi">
        <strong>✅ सही उत्तर: B) चिकनी अंतःप्रद्रव्यी जालिका (SER)</strong><br/>
        <strong>व्याख्या:</strong> चिकनी ER (SER) पर राइबोसोम नहीं होते। यह वसा/लिपिड का निर्माण करती है तथा यकृत की कोशिकाओं में हानिकारक दवाओं और विषैले पदार्थों का विषहरण (Detoxification) करती है।
      </div>
    </div>
  </details>
</div>

<!-- MCQ 11 -->
<div class="quiz-card">
  <span class="quiz-badge">Question 11 / 15</span>
  <div class="quiz-question">
    <div class="lang-en">Q11. Which cellular organelle is completely non-membranous and functions as the "Protein Factory" of the cell?</div>
    <div class="lang-hi">प्रश्न 11. कौन सा कोशिकांग पूर्णतः झिल्ली-रहित (Non-membranous) होता है और कोशिका की "प्रोटीन फैक्ट्री" कहलाता है?</div>
  </div>
  <div class="quiz-options">
    <div class="quiz-option" data-opt="A" data-is-correct="false"><span class="quiz-option-key">A</span> <span class="lang-en">Lysosome</span><span class="lang-hi">लाइसोसोम</span></div>
    <div class="quiz-option" data-opt="B" data-is-correct="false"><span class="quiz-option-key">B</span> <span class="lang-en">Golgi Apparatus</span><span class="lang-hi">गॉल्जीकाय</span></div>
    <div class="quiz-option" data-opt="C" data-is-correct="true"><span class="quiz-option-key">C</span> <span class="lang-en">Ribosome</span><span class="lang-hi">राइबोसोम</span></div>
    <div class="quiz-option" data-opt="D" data-is-correct="false"><span class="quiz-option-key">D</span> <span class="lang-en">Vacuole</span><span class="lang-hi">रसधानी</span></div>
  </div>
  <details class="quiz-reveal">
    <summary>💡 Reveal Answer & Detailed Solution (उत्तर एवं विस्तृत व्याख्या)</summary>
    <div class="quiz-explanation">
      <div class="lang-en">
        <strong>✅ Correct Answer: C) Ribosome</strong><br/>
        <strong>Explanation:</strong> Discovered by George Palade (1955), ribosomes consist purely of rRNA and proteins with no surrounding membrane. They translate genetic messages into proteins.
      </div>
      <div class="lang-hi">
        <strong>✅ सही उत्तर: C) राइबोसोम</strong><br/>
        <strong>व्याख्या:</strong> जॉर्ज पैलेड (1955) द्वारा खोजे गए राइबोसोम सबसे छोटे और झिल्ली-रहित अंगक हैं जो rRNA तथा प्रोटीन से बने होते हैं। ये प्रोटीन संश्लेषण का केंद्र हैं।
      </div>
    </div>
  </details>
</div>

<!-- MCQ 12 -->
<div class="quiz-card">
  <span class="quiz-badge">Question 12 / 15</span>
  <div class="quiz-question">
    <div class="lang-en">Q12. Which organelle chemically modifies, packages, and dispatches cellular proteins and is termed the "Post Office of the Cell"?</div>
    <div class="lang-hi">प्रश्न 12. प्रोटीनों के संशोधन, पैकेजिंग एवं लक्ष्य तक स्रावण का कार्य करने वाले कोशिकांग को कोशिका का "डाकघर / ट्रैफिक पुलिस" कहा जाता है:</div>
  </div>
  <div class="quiz-options">
    <div class="quiz-option" data-opt="A" data-is-correct="true"><span class="quiz-option-key">A</span> <span class="lang-en">Golgi Apparatus</span><span class="lang-hi">गॉल्जीकाय (Golgi Apparatus)</span></div>
    <div class="quiz-option" data-opt="B" data-is-correct="false"><span class="quiz-option-key">B</span> <span class="lang-en">Peroxisome</span><span class="lang-hi">परऑक्सीसोम</span></div>
    <div class="quiz-option" data-opt="C" data-is-correct="false"><span class="quiz-option-key">C</span> <span class="lang-en">Centriole</span><span class="lang-hi">तारककेंद्र (Centriole)</span></div>
    <div class="quiz-option" data-opt="D" data-is-correct="false"><span class="quiz-option-key">D</span> <span class="lang-en">Lysosome</span><span class="lang-hi">लाइसोसोम</span></div>
  </div>
  <details class="quiz-reveal">
    <summary>💡 Reveal Answer & Detailed Solution (उत्तर एवं विस्तृत व्याख्या)</summary>
    <div class="quiz-explanation">
      <div class="lang-en">
        <strong>✅ Correct Answer: A) Golgi Apparatus</strong><br/>
        <strong>Explanation:</strong> Discovered by Camillo Golgi in 1898, the Golgi apparatus consists of flattened cisternae that package and tag vesicles for transport, acting as the cell's sorting and shipping center.
      </div>
      <div class="lang-hi">
        <strong>✅ सही उत्तर: A) गॉल्जीकाय (Golgi Apparatus)</strong><br/>
        <strong>व्याख्या:</strong> 1898 में कैमिलो गॉल्जी द्वारा खोजा गया यह अंगक ER से प्राप्त प्रोटीनों को पैक और लेबल करके कोशिका के भीतर या बाहर भेजता है, इसलिए इसे 'डाकघर' या 'ट्रैफिक पुलिस' कहते हैं।
      </div>
    </div>
  </details>
</div>

<!-- MCQ 13 -->
<div class="quiz-card">
  <span class="quiz-badge">Question 13 / 15</span>
  <div class="quiz-question">
    <div class="lang-en">Q13. Why are lysosomes designated as the "Suicidal Bags" of the cell?</div>
    <div class="lang-hi">प्रश्न 13. लाइसोसोम को कोशिका की "आत्मघाती थैली" (Suicide Bag) क्यों कहा जाता है?</div>
  </div>
  <div class="quiz-options">
    <div class="quiz-option" data-opt="A" data-is-correct="false"><span class="quiz-option-key">A</span> <span class="lang-en">They produce toxic free radicals</span><span class="lang-hi">ये विषैले फ्री रेडिकल्स बनाते हैं</span></div>
    <div class="quiz-option" data-opt="B" data-is-correct="true"><span class="quiz-option-key">B</span> <span class="lang-en">Their acid hydrolases digest the host cell if the membrane ruptures</span><span class="lang-hi">इनके पाचक एंजाइम थैली फटने पर पूरी कोशिका को ही पचा डालते हैं</span></div>
    <div class="quiz-option" data-opt="C" data-is-correct="false"><span class="quiz-option-key">C</span> <span class="lang-en">They arrest cellular respiration</span><span class="lang-hi">ये कोशिकीय श्वसन को रोक देते हैं</span></div>
    <div class="quiz-option" data-opt="D" data-is-correct="false"><span class="quiz-option-key">D</span> <span class="lang-en">They induce sudden genetic mutations</span><span class="lang-hi">ये आनुवंशिक उत्परिवर्तन पैदा करते हैं</span></div>
  </div>
  <details class="quiz-reveal">
    <summary>💡 Reveal Answer & Detailed Solution (उत्तर एवं विस्तृत व्याख्या)</summary>
    <div class="quiz-explanation">
      <div class="lang-en">
        <strong>✅ Correct Answer: B) Their acid hydrolases digest the host cell if the membrane ruptures</strong><br/>
        <strong>Explanation:</strong> Discovered by Christian de Duve (1955), lysosomes contain over 50 potent acid hydrolytic enzymes. Under severe damage or starvation, they burst and autodigest the entire cell.
      </div>
      <div class="lang-hi">
        <strong>✅ सही उत्तर: B) इनके पाचक एंजाइम थैली फटने पर पूरी कोशिका को ही पचा डालते हैं</strong><br/>
        <strong>व्याख्या:</strong> क्रिश्चियन डी डुवे द्वारा खोजे गए लाइसोसोम में 50 प्रकार के शक्तिशाली जल-अपघटकीय एंजाइम होते हैं। कोशिका के गंभीर रूप से क्षतिग्रस्त होने पर ये फट जाते हैं और अपनी ही कोशिका को नष्ट कर देते हैं।
      </div>
    </div>
  </details>
</div>

<!-- MCQ 14 -->
<div class="quiz-card">
  <span class="quiz-badge">Question 14 / 15</span>
  <div class="quiz-question">
    <div class="lang-en">Q14. The semi-permeable membrane enclosing the large central vacuole in plant cells is termed:</div>
    <div class="lang-hi">प्रश्न 14. पादप कोशिकाओं में विशाल केंद्रीय रसधानी (Vacuole) को घेरने वाली विशिष्ट अर्ध-पारगम्य झिल्ली क्या कहलाती है?</div>
  </div>
  <div class="quiz-options">
    <div class="quiz-option" data-opt="A" data-is-correct="true"><span class="quiz-option-key">A</span> <span class="lang-en">Tonoplast</span><span class="lang-hi">टोनोप्लास्ट (Tonoplast)</span></div>
    <div class="quiz-option" data-opt="B" data-is-correct="false"><span class="quiz-option-key">B</span> <span class="lang-en">Cristae</span><span class="lang-hi">क्रिस्टी (Cristae)</span></div>
    <div class="quiz-option" data-opt="C" data-is-correct="false"><span class="quiz-option-key">C</span> <span class="lang-en">Pellicle</span><span class="lang-hi">पेलीकल (Pellicle)</span></div>
    <div class="quiz-option" data-opt="D" data-is-correct="false"><span class="quiz-option-key">D</span> <span class="lang-en">Thylakoid</span><span class="lang-hi">थाइलेकोइड (Thylakoid)</span></div>
  </div>
  <details class="quiz-reveal">
    <summary>💡 Reveal Answer & Detailed Solution (उत्तर एवं विस्तृत व्याख्या)</summary>
    <div class="quiz-explanation">
      <div class="lang-en">
        <strong>✅ Correct Answer: A) Tonoplast</strong><br/>
        <strong>Explanation:</strong> The tonoplast actively facilitates ion transport against concentration gradients into the vacuole, maintaining the crucial hydrostatic turgor pressure that keeps plant tissues upright.
      </div>
      <div class="lang-hi">
        <strong>✅ सही उत्तर: A) टोनोप्लास्ट (Tonoplast)</strong><br/>
        <strong>व्याख्या:</strong> टोनोप्लास्ट पादप रसधानी की झिल्ली है जो सक्रिय रूप से आयनों का परिवहन करके कोशिका के भीतर स्फीति दबाव (Turgor Pressure) बनाए रखती है।
      </div>
    </div>
  </details>
</div>

<!-- MCQ 15 -->
<div class="quiz-card">
  <span class="quiz-badge">Question 15 / 15</span>
  <div class="quiz-question">
    <div class="lang-en">Q15. In which specific phase of the eukaryotic cell cycle does DNA Replication take place?</div>
    <div class="lang-hi">प्रश्न 15. यूकेरियोटिक कोशिका चक्र के किस विशिष्ट उप-चरण में DNA का प्रतिकृतिकरण (Replication) संपन्न होता है?</div>
  </div>
  <div class="quiz-options">
    <div class="quiz-option" data-opt="A" data-is-correct="false"><span class="quiz-option-key">A</span> <span class="lang-en">$G_1$ Phase (Gap 1)</span><span class="lang-hi">$G_1$ प्रावस्था</span></div>
    <div class="quiz-option" data-opt="B" data-is-correct="true"><span class="quiz-option-key">B</span> <span class="lang-en">S Phase (Synthesis Phase)</span><span class="lang-hi">S प्रावस्था (संश्लेषण चरण)</span></div>
    <div class="quiz-option" data-opt="C" data-is-correct="false"><span class="quiz-option-key">C</span> <span class="lang-en">$G_2$ Phase (Gap 2)</span><span class="lang-hi">$G_2$ प्रावस्था</span></div>
    <div class="quiz-option" data-opt="D" data-is-correct="false"><span class="quiz-option-key">D</span> <span class="lang-en">M Phase (Mitosis)</span><span class="lang-hi">M प्रावस्था (समसूत्री विभाजन)</span></div>
  </div>
  <details class="quiz-reveal">
    <summary>💡 Reveal Answer & Detailed Solution (उत्तर एवं विस्तृत व्याख्या)</summary>
    <div class="quiz-explanation">
      <div class="lang-en">
        <strong>✅ Correct Answer: B) S Phase (Synthesis Phase)</strong><br/>
        <strong>Explanation:</strong> During the S phase of Interphase, DNA synthesis/replication occurs, doubling the total DNA amount from $2C$ to $4C$, while the chromosome number ($2n$) remains unchanged.
      </div>
      <div class="lang-hi">
        <strong>✅ सही उत्तर: B) S प्रावस्था (संश्लेषण चरण)</strong><br/>
        <strong>व्याख्या:</strong> अंतरावस्था की S (Synthesis) प्रावस्था में DNA का द्विगुणन होता है, जिससे DNA की मात्रा $2C$ से बढ़कर $4C$ हो जाती है, परंतु गुणसूत्रों की संख्या समान ($2n$) रहती है।
      </div>
    </div>
  </details>
</div>""")

    return "\n\n".join(html)

def main():
    with open(NOTES_FILE, "r", encoding="utf-8") as f:
        notes = json.load(f)

    content = generate_note_html()

    updated = False
    for note in notes:
        if note["id"] == "cn_bio_01":
            note["content"] = content
            note["is_active"] = True
            note["exam_tag"] = ""  # Cleared exam tag as requested
            note["updated_at"] = "2026-11-14T10:55:00+05:30"
            updated = True
            break

    if updated:
        with open(NOTES_FILE, "w", encoding="utf-8") as f:
            json.dump(notes, f, ensure_ascii=False, indent=2)
        print("SUCCESS: cn_bio_01 rebuilt with 15 Chapter-Based MCQs and NO exam tags!")
    else:
        print("ERROR: cn_bio_01 note not found in chapter_notes.json")

if __name__ == "__main__":
    main()
