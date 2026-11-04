export interface PracticeMcq {
  question: string;
  questionHi?: string;
  options: string[];
  correctIndex: number;
  explanation: string;
}

export interface NoteTable {
  title: string;
  headers: string[];
  rows: string[][];
}

export interface KeyPoint {
  label: string;
  detail: string;
}

export interface ChapterNote {
  id: string;
  subjectId: string;
  subjectName: string;
  title: string;
  hindiTitle: string;
  slug: string;
  readTime: string;
  subtopics: string[];
  overview: string;
  keyPoints: KeyPoint[];
  table?: NoteTable;
  tcsTrap?: string;
  practiceMcq?: PracticeMcq;
  sortOrder?: number;
  isActive?: boolean;
}

export interface SubjectWithChapters {
  id: string;
  name: string;
  iconName: string;
  color: string;
  chapters: ChapterNote[];
}

export const DEFAULT_SUBJECTS_DATA: SubjectWithChapters[] = [
  {
    id: "physics",
    name: "General Science - Physics (भौतिक विज्ञान)",
    iconName: "Atom",
    color: "blue",
    chapters: [
      {
        id: "phy-units",
        subjectId: "physics",
        subjectName: "General Science - Physics",
        title: "1. Units & Dimensions (मात्रक एवं विमाएं)",
        hindiTitle: "मात्रक और मापन पद्धतियाँ",
        slug: "physics-units-dimensions",
        readTime: "5 min read",
        subtopics: ["SI Base Units", "Derived Units", "Important Astronomical Units", "Measuring Instruments"],
        overview: "In SSC CGL, CHSL & CPO exams, 1 direct question is consistently asked on SI units, dimensional formulas, or scientific measuring instruments (e.g., Pyrometer, Hydrometer).",
        keyPoints: [
          { label: "Light Year (प्रकाश वर्ष)", detail: "Unit of Distance (9.46 × 10¹⁵ meters), NOT time." },
          { label: "Parsec (पारसेक)", detail: "Largest astronomical unit of distance (1 Parsec = 3.26 Light Years = 3.08 × 10¹⁶ m)." },
          { label: "Luminous Intensity (ज्योति तीव्रता)", detail: "SI Unit: Candela (cd)." },
          { label: "Amount of Substance (पदार्थ की मात्रा)", detail: "SI Unit: Mole (mol)." },
          { label: "Solid Angle (ठोस कोण)", detail: "SI Unit: Steradian (sr)." },
        ],
        table: {
          title: "Top High-Yield Scientific Instruments Asked by TCS",
          headers: ["Instrument", "Measures / Uses", "Exam Frequency"],
          rows: [
            ["Pyrometer", "Very High Temperatures (e.g. Sun/Furnace)", "Repeated 6+ times"],
            ["Hygrometer", "Atmospheric Humidity (आर्द्रता)", "Repeated 8+ times"],
            ["Hydrometer", "Relative Density of liquids", "High Yield"],
            ["Barometer", "Atmospheric Pressure (Sudden drop indicates storm)", "SSC CHSL 2023"],
            ["Anemometer", "Wind speed and direction", "SSC CPO 2023"],
          ],
        },
        tcsTrap: "TCS Trap Alert: Students confuse 'Hygrometer' (measures Humidity) with 'Hydrometer' (measures Liquid Density). Remember: G = Gas/Air humidity, D = Density of liquid.",
        practiceMcq: {
          question: "Which of the following scientific instruments is used for measuring very high temperatures without physical contact?",
          questionHi: "निम्नलिखित में से किस वैज्ञानिक उपकरण का उपयोग बिना संपर्क के बहुत उच्च तापमान मापने के लिए किया जाता है?",
          options: ["Pyrometer", "Hygrometer", "Hydrometer", "Bolometer"],
          correctIndex: 0,
          explanation: "A Pyrometer is a type of remote-sensing radiation thermometer used to measure high temperatures (above 1500°C).",
        },
      },
      {
        id: "phy-motion",
        subjectId: "physics",
        subjectName: "General Science - Physics",
        title: "2. Motion & Newton's Laws (गति एवं बल)",
        hindiTitle: "न्यूटन के गति के नियम और घर्षण",
        slug: "physics-motion-newtons-laws",
        readTime: "7 min read",
        subtopics: ["Scalar vs Vector", "Newton's 3 Laws", "Inertia Examples", "Linear Momentum"],
        overview: "Newton's Laws of Motion and their real-life applications are standard questions in Tier-1 General Awareness sections.",
        keyPoints: [
          { label: "Newton's 1st Law (Law of Inertia)", detail: "A passenger falls backwards when a bus starts suddenly due to inertia of rest." },
          { label: "Newton's 2nd Law (F = ma)", detail: "Defines measurement of force. A cricket fielder pulls hands backwards to increase time of impact and reduce force." },
          { label: "Newton's 3rd Law (Action = Reaction)", detail: "Rocket propulsion, recoil of a gun, swimming, rowing a boat." },
          { label: "Conservation of Momentum", detail: "Total momentum remains constant if no external force acts (M₁V₁ = - M₂V₂ for gun recoil)." },
        ],
        table: {
          title: "Scalar (अदिश) vs Vector (सदिश) Quantities",
          headers: ["Quantity Type", "Definition", "Standard Examples Asked in SSC"],
          rows: [
            ["Scalar Quantity (अदिश)", "Only Magnitude, No Direction", "Mass, Speed, Distance, Work, Energy, Power, Pressure, Electric Current"],
            ["Vector Quantity (सदिश)", "Both Magnitude and Direction", "Displacement, Velocity, Acceleration, Force, Momentum, Weight, Torque"],
          ],
        },
        tcsTrap: "Electric Current and Pressure have direction, but they follow scalar algebraic addition, so both are SCALAR quantities in SSC physics questions.",
        practiceMcq: {
          question: "Why does a cricket fielder pull his hands backwards while catching a fast-moving ball?",
          questionHi: "एक क्रिकेट क्षेत्ररक्षक तेजी से आती गेंद को पकड़ते समय अपने हाथों को पीछे की ओर क्यों खींचता है?",
          options: ["To reduce impulse time", "To increase time of impact to reduce force", "To increase kinetic energy", "Due to inertia of motion"],
          correctIndex: 1,
          explanation: "According to Newton's 2nd Law (F = dp/dt), increasing collision time decreases the impulsive force experienced by the hands.",
        },
      },
      {
        id: "phy-optics",
        subjectId: "physics",
        subjectName: "General Science - Physics",
        title: "3. Optics & Light (प्रकाशिकी)",
        hindiTitle: "परावर्तन, अपवर्तन और पूर्ण आंतरिक परावर्तन",
        slug: "physics-optics-light",
        readTime: "8 min read",
        subtopics: ["Reflection & Mirrors", "Refraction & Lenses", "Total Internal Reflection (TIR)", "Human Eye Defects"],
        overview: "Light phenomena like TIR, dispersion, scattering (why sky is blue), and lens corrections for Myopia/Hypermetropia are 100% must-know topics.",
        keyPoints: [
          { label: "Total Internal Reflection (TIR)", detail: "Examples: Sparkling of Diamond, Mirage in deserts (मरीचिका), Optical Fibre cables, Endoscopy." },
          { label: "Scattering of Light (Rayleigh Law)", detail: "Blue colour of sky, Red colour of sunrise/sunset (Scattering ∝ 1/λ⁴)." },
          { label: "Myopia (निकट दृष्टि दोष)", detail: "Can't see distant objects clearly. Corrected using Concave Lens (अवतल लेंस)." },
          { label: "Hypermetropia (दूर दृष्टि दोष)", detail: "Can't see nearby objects clearly. Corrected using Convex Lens (उत्तल लेंस)." },
        ],
        table: {
          title: "Mirrors and Their Practical Applications",
          headers: ["Mirror Type", "Image Formed", "Standard Practical Uses"],
          rows: [
            ["Concave Mirror (अवतल दर्पण)", "Real & Inverted (Virtual when very close)", "Dentist's mirror, Headlights of vehicles, Shaving mirror, Solar cookers"],
            ["Convex Mirror (उत्तल दर्पण)", "Always Virtual, Erect & Diminished", "Rear-view side mirror in vehicles, Street light reflectors, ATM security mirrors"],
            ["Plane Mirror (समतल दर्पण)", "Virtual, Erect, Same size", "Periscope (at 45° angle), Kaleidoscopes"],
          ],
        },
        tcsTrap: "Rear-view side mirror of vehicles is CONVEX because it provides a wide field of view with diminished erect images.",
        practiceMcq: {
          question: "The sparkling of diamonds and transmission of data in optical fibres are based on which optical principle?",
          questionHi: "हीरे की चमक और ऑप्टिकल फाइबर में डेटा संचरण किस प्रकाशीय सिद्धांत पर आधारित है?",
          options: ["Refraction of Light", "Total Internal Reflection", "Diffraction of Light", "Polarisation"],
          correctIndex: 1,
          explanation: "Both phenomena occur due to Total Internal Reflection (TIR) when light travels from denser to rarer medium exceeding the critical angle.",
        },
      },
    ],
  },
  {
    id: "chemistry",
    name: "General Science - Chemistry (रसायन विज्ञान)",
    iconName: "TestTube",
    color: "amber",
    chapters: [
      {
        id: "chem-acids",
        subjectId: "chemistry",
        subjectName: "General Science - Chemistry",
        title: "1. Acids, Bases & Salts (अम्ल, क्षार एवं लवण)",
        hindiTitle: "प्राकृतिक अम्ल और pH मान",
        slug: "chemistry-acids-bases-salts",
        readTime: "6 min read",
        subtopics: ["Natural Organic Acids", "pH Scale Values", "Common Chemical Compounds", "Bleaching Powder & POP"],
        overview: "Natural sources of acids (e.g. Tomato, Tamarind, Ant sting) and chemical formulas of standard domestic salts are asked every year.",
        keyPoints: [
          { label: "Vinegar (सिरका)", detail: "Acetic Acid (Ethanoic acid, CH₃COOH 5-8%)." },
          { label: "Tamarind & Grapes (इमली)", detail: "Tartaric Acid." },
          { label: "Tomato (टमाटर)", detail: "Oxalic Acid." },
          { label: "Ant & Nettle Sting (चींटी का डंक)", detail: "Formic Acid / Methanoic Acid (HCOOH)." },
          { label: "Curd / Sour Milk (दही)", detail: "Lactic Acid." },
        ],
        table: {
          title: "Common Chemical Names & Formulas for SSC",
          headers: ["Common Name", "Chemical Name", "Chemical Formula"],
          rows: [
            ["Baking Soda", "Sodium Hydrogen Carbonate", "NaHCO₃"],
            ["Washing Soda", "Sodium Carbonate Decahydrate", "Na₂CO₃·10H₂O"],
            ["Plaster of Paris (POP)", "Calcium Sulphate Hemihydrate", "CaSO₄·½H₂O"],
            ["Gypsum", "Calcium Sulphate Dihydrate", "CaSO₄·2H₂O"],
            ["Bleaching Powder", "Calcium Hypochlorite", "CaOCl₂"],
            ["Quick Lime", "Calcium Oxide", "CaO"],
            ["Slaked Lime", "Calcium Hydroxide", "Ca(OH)₂"],
          ],
        },
        tcsTrap: "Heating Gypsum (CaSO₄·2H₂O) at 373 K yields Plaster of Paris (CaSO₄·½H₂O).",
        practiceMcq: {
          question: "What is the chemical formula of Plaster of Paris (POP)?",
          questionHi: "प्लास्टर ऑफ पेरिस (POP) का रासायनिक सूत्र क्या है?",
          options: ["CaSO₄·2H₂O", "CaSO₄·½H₂O", "Na₂CO₃·10H₂O", "CaOCl₂"],
          correctIndex: 1,
          explanation: "Plaster of Paris is Calcium Sulphate Hemihydrate (CaSO₄·½H₂O).",
        },
      },
    ],
  },
  {
    id: "polity",
    name: "Indian Polity (भारतीय राजव्यवस्था)",
    iconName: "Landmark",
    color: "emerald",
    chapters: [
      {
        id: "pol-fundamental-rights",
        subjectId: "polity",
        subjectName: "Indian Polity",
        title: "1. Fundamental Rights (मौलिक अधिकार: Art 12-35)",
        hindiTitle: "मौलिक अधिकार और 5 रिट (Writs)",
        slug: "polity-fundamental-rights-writs",
        readTime: "7 min read",
        subtopics: ["Part III of Constitution", "6 Fundamental Rights", "Article 21 & 32", "5 Writs of Supreme Court"],
        overview: "Part III of the Indian Constitution is termed the 'Magna Carta of India'. Questions on Article 14, 19, 21, and Article 32 are guaranteed in SSC exams.",
        keyPoints: [
          { label: "Article 14", detail: "Equality before law and Equal protection of laws." },
          { label: "Article 17", detail: "Abolition of Untouchability (अस्पृश्यता का अंत)." },
          { label: "Article 21", detail: "Protection of Life and Personal Liberty (Right to Privacy is part of Art 21)." },
          { label: "Article 21A", detail: "Right to Free and Compulsory Education for 6-14 years (86th Amendment, 2002)." },
          { label: "Article 32", detail: "Right to Constitutional Remedies. Dr. B.R. Ambedkar called it 'The Heart and Soul of the Constitution'." },
        ],
        table: {
          title: "5 Writs Issued by Supreme Court (Art 32) & High Court (Art 226)",
          headers: ["Writ Name", "Literal Meaning", "When Issued"],
          rows: [
            ["Habeas Corpus", "To have the body of", "Against illegal detention of a person"],
            ["Mandamus", "We Command", "To compel a public official to perform statutory duty"],
            ["Prohibition", "To forbid", "By higher court to prevent lower court from exceeding jurisdiction"],
            ["Certiorari", "To be certified / informed", "To quash an illegal order of a lower court/tribunal"],
            ["Quo-Warranto", "By what authority / warrant", "To prevent illegal usurpation of a public office"],
          ],
        },
        tcsTrap: "Right to Property was removed from Fundamental Rights by the 44th Constitutional Amendment Act (1978) and made a Legal Right under Article 300A.",
        practiceMcq: {
          question: "Which Article of the Indian Constitution was described by Dr. B.R. Ambedkar as the 'Heart and Soul of the Constitution'?",
          questionHi: "डॉ. बी.आर. अम्बेडकर ने भारतीय संविधान के किस अनुच्छेद को 'संविधान का हृदय और आत्मा' कहा था?",
          options: ["Article 14", "Article 19", "Article 21", "Article 32"],
          correctIndex: 3,
          explanation: "Article 32 (Right to Constitutional Remedies) empowers citizens to move the Supreme Court directly for the enforcement of fundamental rights.",
        },
      },
    ],
  },
  {
    id: "history",
    name: "Indian History (भारतीय इतिहास)",
    iconName: "History",
    color: "purple",
    chapters: [
      {
        id: "hist-indus-valley",
        subjectId: "history",
        subjectName: "Indian History",
        title: "1. Indus Valley Civilization (सिंधु घाटी सभ्यता)",
        hindiTitle: "हड़प्पा सभ्यता के प्रमुख स्थल और खोजकर्ता",
        slug: "history-indus-valley-civilization",
        readTime: "6 min read",
        subtopics: ["Major Sites & Discoverers", "Great Bath & Granary", "Town Planning", "Seals & Scripts"],
        overview: "IVC is a Bronze Age civilization known for advanced grid town planning, covered drainage, and terracotta seals.",
        keyPoints: [
          { label: "Harappa (1921)", detail: "Discovered by Daya Ram Sahni on bank of Ravi river in Montgomery, Punjab (Pakistan)." },
          { label: "Mohenjo-daro (1922)", detail: "Discovered by R.D. Banerjee on Indus river. Features Great Bath and Bronze Dancing Girl." },
          { label: "Lothal (Gujarat)", detail: "Artificial tidal dockyard on Bhogava river; evidence of rice husk and chess." },
          { label: "Kalibangan (Rajasthan)", detail: "Ploughed agricultural fields and fire altars on Ghaggar river." },
        ],
        table: {
          title: "Major Harappan Sites & Findings Asked in SSC",
          headers: ["Site", "River", "Key Excavated Finding"],
          rows: [
            ["Harappa", "Ravi", "6 Granaries in a row, Stone symbols of Lingam & Yoni"],
            ["Mohenjo-daro", "Indus", "Great Bath, Great Granary, Pashupati Seal, Bronze Dancing Girl"],
            ["Lothal", "Bhogava", "Tidal Dockyard, Terracotta model of ship, Double burial"],
            ["Dholavira", "Luni (Gujarat)", "Unique Water Reservoir & 3-part city division, UNESCO World Heritage site"],
          ],
        },
        tcsTrap: "Iron was NOT known to the Harappan people. They belonged to the Bronze Age (Copper + Tin).",
        practiceMcq: {
          question: "Which of the following Indus Valley Civilization sites had an ancient tidal dockyard?",
          questionHi: "सिंधु घाटी सभ्यता के निम्नलिखित में से किस स्थल पर एक प्राचीन ज्वारीय गोदी (डॉकार्ड) था?",
          options: ["Harappa", "Kalibangan", "Lothal", "Rakhigarhi"],
          correctIndex: 2,
          explanation: "Lothal (in modern Gujarat on the Bhogava river) was the world's earliest known port city and dockyard of the Indus Valley Civilization.",
        },
      },
    ],
  },
  {
    id: "geography",
    name: "Geography of India (भारत का भूगोल)",
    iconName: "Globe2",
    color: "teal",
    chapters: [
      {
        id: "geo-rivers",
        subjectId: "geography",
        subjectName: "Geography of India",
        title: "1. Major River Systems & Tributaries (भारत की नदियाँ)",
        hindiTitle: "हिमालयी और प्रायद्वीपीय नदियाँ",
        slug: "geography-major-rivers-tributaries",
        readTime: "7 min read",
        subtopics: ["Himalayan Rivers (Indus, Ganga, Brahmaputra)", "Peninsular Rivers", "East vs West Flowing Rivers", "River Origin & Deltas"],
        overview: "River origins, major left/right bank tributaries, and multi-purpose dam projects are frequently asked in SSC GS.",
        keyPoints: [
          { label: "Ganga Origin", detail: "Originates as Bhagirathi from Gangotri glacier (Gaumukh). Becomes Ganga after meeting Alaknanda at Devprayag." },
          { label: "Brahmaputra", detail: "Called Tsangpo in Tibet, Dihang in Arunachal Pradesh, and Jamuna in Bangladesh. Forms Majuli (largest river island)." },
          { label: "Narmada & Tapi", detail: "West-flowing rivers that flow through Rift Valleys and form Estuaries (NOT deltas)." },
        ],
        table: {
          title: "Panch Prayag (Confluence of Rivers in Uttarakhand)",
          headers: ["Prayag", "Confluence of Rivers"],
          rows: [
            ["Devprayag", "Bhagirathi + Alaknanda (Forms River Ganga)"],
            ["Rudraprayag", "Mandakini + Alaknanda"],
            ["Karnaprayag", "Pindar + Alaknanda"],
            ["Nandaprayag", "Nandakini + Alaknanda"],
            ["Vishnuprayag", "Dhauliganga + Alaknanda"],
          ],
        },
        tcsTrap: "Narmada and Tapi flow west into the Arabian Sea through rift valleys and do NOT form deltas; they form estuaries.",
        practiceMcq: {
          question: "At which confluence do the rivers Bhagirathi and Alaknanda join to become the river Ganga?",
          questionHi: "भागीरथी और अलकनंदा नदियाँ किस संगम पर मिलकर गंगा नदी कहलाती हैं?",
          options: ["Rudraprayag", "Devprayag", "Karnaprayag", "Vishnuprayag"],
          correctIndex: 1,
          explanation: "At Devprayag in Uttarakhand, Bhagirathi meets Alaknanda to form the Holy River Ganga.",
        },
      },
    ],
  },
];
