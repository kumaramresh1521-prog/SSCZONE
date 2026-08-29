"use client";

import { useState, useMemo, useEffect } from "react";
import Link from "next/link";
import {
  BookOpen,
  ChevronRight,
  Search,
  CheckCircle2,
  Bookmark,
  Sparkles,
  Flame,
  ArrowLeft,
  ArrowRight,
  Menu,
  X,
  Layers,
  Atom,
  TestTube,
  Dna,
  Landmark,
  Globe2,
  Clock,
  Share2
} from "lucide-react";
import toast from "react-hot-toast";

// SUBJECTS WITH CHAPTERS & RICH HIGH-YIELD CONTENT
const SUBJECTS_DATA = [
  {
    id: "physics",
    name: "Physics (भौतिक विज्ञान)",
    icon: Atom,
    color: "blue",
    chapters: [
      {
        id: "phy-units",
        title: "1. Units & Dimensions (मात्रक एवं विमाएं)",
        hindiTitle: "मात्रक और मापन पद्धतियाँ",
        readTime: "5 min read",
        subtopics: ["SI Base Units", "Derived Units", "Important Astronomical Units", "Measuring Instruments"],
        content: {
          overview: "In SSC CGL, CHSL & CPO exams, 1 direct question is consistently asked on SI units, dimensional formulas, or scientific measuring instruments (e.g., Pyrometer, Hydrometer).",
          keyPoints: [
            { label: "Light Year (प्रकाश वर्ष)", detail: "Unit of Distance (9.46 × 10¹⁵ meters), NOT time." },
            { label: "Parsec (पारसेक)", detail: "Largest astronomical unit of distance (1 Parsec = 3.26 Light Years = 3.08 × 10¹⁶ m)." },
            { label: "Luminous Intensity (ज्योति तीव्रता)", detail: "SI Unit: Candela (cd)." },
            { label: "Amount of Substance (पदार्थ की मात्रा)", detail: "SI Unit: Mole (mol)." },
            { label: "Solid Angle (ठोस कोण)", detail: "SI Unit: Steradian (sr)." }
          ],
          table: {
            title: "Top 10 High-Yield Scientific Instruments Asked by TCS",
            headers: ["Instrument", "Measures / Uses", "Exam Relevance"],
            rows: [
              ["Pyrometer", "Very High Temperatures (e.g. Sun/Furnace)", "SSC CGL 2023, 2024"],
              ["Hygrometer", "Atmospheric Humidity (आर्द्रता)", "Repeated 8+ times"],
              ["Hydrometer", "Relative Density of liquids", "High Yield"],
              ["Galvanometer", "Presence & direction of small electric current", "Repeated 5+ times"],
              ["Barometer", "Atmospheric Pressure (Mercury level drop indicates storm)", "SSC CHSL 2023"],
              ["Anemometer", "Wind speed and direction", "SSC CPO 2023"]
            ]
          },
          tcsTrap: "TCS Trap Alert: Students confuse 'Hygrometer' (measures Humidity) with 'Hydrometer' (measures Liquid Density). Remember: G = Gas/Air humidity, D = Density of liquid.",
          practiceMcq: {
            question: "Which of the following scientific instruments is used for measuring very high temperatures without physical contact?",
            questionHi: "निम्नलिखित में से किस वैज्ञानिक उपकरण का उपयोग बिना संपर्क के बहुत उच्च तापमान मापने के लिए किया जाता है?",
            options: ["Pyrometer", "Hygrometer", "Hydrometer", "Bolometer"],
            correctIndex: 0,
            explanation: "A Pyrometer is a type of remote-sensing radiation thermometer used to measure high temperatures (above 1500°C)."
          }
        }
      },
      {
        id: "phy-motion",
        title: "2. Motion, Force & Newton's Laws (गति एवं बल)",
        hindiTitle: "न्यूटन के गति के नियम और घर्षण",
        readTime: "7 min read",
        subtopics: ["Scalar vs Vector", "Newton's 3 Laws", "Inertia Examples", "Linear Momentum"],
        content: {
          overview: "Newton's Laws of Motion and their real-life applications are standard questions in Tier-1 General Awareness sections.",
          keyPoints: [
            { label: "Newton's 1st Law (Law of Inertia)", detail: "A passenger falls backwards when a bus starts suddenly due to inertia of rest." },
            { label: "Newton's 2nd Law (F = ma)", detail: "Defines the measurement of force. A cricket fielder pulls his hands backwards to increase time of impact and reduce force." },
            { label: "Newton's 3rd Law (Action = Reaction)", detail: "Rocket propulsion, recoil of a gun, swimming, rowing a boat." },
            { label: "Conservation of Momentum", detail: "Total momentum remains constant if no external force acts (M₁V₁ = - M₂V₂ for gun recoil)." }
          ],
          table: {
            title: "Scalar (अदिश) vs Vector (सदिश) Quantities",
            headers: ["Quantity Type", "Definition", "Standard Examples Asked in SSC"],
            rows: [
              ["Scalar Quantity (अदिश)", "Only Magnitude, No Direction", "Mass, Speed, Distance, Work, Energy, Power, Pressure, Electric Current"],
              ["Vector Quantity (सदिश)", "Both Magnitude and Direction", "Displacement, Velocity, Acceleration, Force, Momentum, Weight, Torque"]
            ]
          },
          tcsTrap: "Electric Current and Pressure have direction, but they follow scalar algebraic addition, so both are SCALAR quantities in SSC physics questions.",
          practiceMcq: {
            question: "Why does a cricket fielder pull his hands backwards while catching a fast-moving ball?",
            questionHi: "एक क्रिकेट क्षेत्ररक्षक तेजी से आती गेंद को पकड़ते समय अपने हाथों को पीछे की ओर क्यों खींचता है?",
            options: ["To reduce impulse time", "To increase time of impact to reduce force", "To increase kinetic energy", "Due to inertia of motion"],
            correctIndex: 1,
            explanation: "According to Newton's 2nd Law (F = dp/dt), increasing the time of collision decreases the force experienced by the hands."
          }
        }
      },
      {
        id: "phy-gravitation",
        title: "3. Gravitation & Satellites (गुरुत्वाकर्षण)",
        hindiTitle: "गुरुत्वाकर्षण, g का मान और उपग्रह",
        readTime: "6 min read",
        subtopics: ["Universal Law of Gravitation", "Value of 'g' variation", "Escape Velocity", "Kepler's Laws"],
        content: {
          overview: "Gravitation covers the Universal Constant G, acceleration due to gravity 'g' changes with height/depth/latitude, and escape velocities.",
          keyPoints: [
            { label: "Universal Gravitational Constant (G)", detail: "Value: 6.67 × 10⁻¹¹ N m²/kg² (discovered by Henry Cavendish)." },
            { label: "Acceleration due to gravity (g)", detail: "Average value at Earth's surface = 9.8 m/s²." },
            { label: "Variation of 'g' on Earth", detail: "Maximum at Poles, Minimum at Equator, Zero at the Centre of Earth." },
            { label: "Escape Velocity (पलायन वेग)", detail: "Earth: 11.2 km/s | Moon: 2.38 km/s (Why Moon has no atmosphere: gas molecules exceed escape velocity)." },
            { label: "Geostationary Satellite", detail: "Time period = 24 hours, Altitude = 36,000 km, revolves West to East above Equator." }
          ],
          table: {
            title: "Weight vs Mass in a Lift (Elevator)",
            headers: ["Lift State", "Apparent Weight (W)", "Feeling of Person"],
            rows: [
              ["Moving Upward with Acceleration (a)", "W = m(g + a)", "Feels heavier"],
              ["Moving Downward with Acceleration (a)", "W = m(g - a)", "Feels lighter"],
              ["Free Fall (Cable breaks)", "W = 0", "Complete Weightlessness"],
              ["Moving with Constant Velocity", "W = mg", "No change in weight"]
            ]
          },
          tcsTrap: "Mass of an object remains CONSTANT everywhere in the universe. Weight (W = mg) changes depending on local gravitational field.",
          practiceMcq: {
            question: "Where is the acceleration due to gravity (g) maximum on the Earth's surface?",
            questionHi: "पृथ्वी की सतह पर गुरुत्वाकर्षण त्वरण (g) का मान कहाँ अधिकतम होता है?",
            options: ["At the Equator", "At the Poles", "At the Tropic of Cancer", "At the Center of Earth"],
            correctIndex: 1,
            explanation: "Because Earth is flattened at the poles, radius R is minimum at the poles (g = GM/R²), making 'g' maximum at the Poles."
          }
        }
      },
      {
        id: "phy-optics",
        title: "4. Optics & Light (प्रकाशिकी)",
        hindiTitle: "परावर्तन, अपवर्तन और पूर्ण आंतरिक परावर्तन",
        readTime: "8 min read",
        subtopics: ["Reflection & Mirrors", "Refraction & Lenses", "Total Internal Reflection (TIR)", "Human Eye Defects"],
        content: {
          overview: "Light phenomena like TIR, dispersion, scattering (why sky is blue), and lens corrections for Myopia/Hypermetropia are 100% must-know topics.",
          keyPoints: [
            { label: "Total Internal Reflection (TIR)", detail: "Examples: Sparkling of Diamond, Mirage in deserts (मरीचिका), Optical Fibre cables, Endoscopy." },
            { label: "Scattering of Light (Rayleigh Law)", detail: "Blue colour of clear sky, Red colour of sunrise/sunset (Scattering ∝ 1/λ⁴)." },
            { label: "Myopia (निकट दृष्टि दोष)", detail: "Can't see distant objects clearly. Corrected using Concave Lens (अवतल लेंस)." },
            { label: "Hypermetropia (दूर दृष्टि दोष)", detail: "Can't see nearby objects clearly. Corrected using Convex Lens (उत्तल लेंस)." },
            { label: "Presbyopia (जरा दृष्टि दोष)", detail: "Age-related defect. Corrected using Bifocal Lens." }
          ],
          table: {
            title: "Mirrors and Their Practical Applications",
            headers: ["Mirror Type", "Image Formed", "Standard Practical Uses"],
            rows: [
              ["Concave Mirror (अवतल दर्पण)", "Real & Inverted (Virtual when very close)", "Dentist's mirror, Shaving mirror, Headlights of vehicles, Solar cookers"],
              ["Convex Mirror (उत्तल दर्पण)", "Always Virtual, Erect & Diminished", "Rear-view side mirror in vehicles, Street light reflectors, ATM security mirrors"],
              ["Plane Mirror (समतल दर्पण)", "Virtual, Erect, Same size, Laterally inverted", "Periscope (at 45° angle), Kaleidoscopes"]
            ]
          },
          tcsTrap: "Rear-view side mirror of cars is CONVEX because it provides a wide field of view with diminished erect images.",
          practiceMcq: {
            question: "The sparkling of diamonds and the transmission of data in optical fibres are based on which optical principle?",
            questionHi: "हीरे की चमक और ऑप्टिकल फाइबर में डेटा संचरण किस प्रकाशीय सिद्धांत पर आधारित है?",
            options: ["Refraction of Light", "Total Internal Reflection", "Diffraction of Light", "Polarisation"],
            correctIndex: 1,
            explanation: "Both phenomena occur due to Total Internal Reflection (TIR) when light travels from a denser medium to a rarer medium at an angle greater than the critical angle."
          }
        }
      }
    ]
  },
  {
    id: "chemistry",
    name: "Chemistry (रसायन विज्ञान)",
    icon: TestTube,
    color: "amber",
    chapters: [
      {
        id: "chem-acids",
        title: "1. Acids, Bases & Salts (अम्ल, क्षार एवं लवण)",
        hindiTitle: "प्राकृतिक अम्ल और pH मान",
        readTime: "6 min read",
        subtopics: ["Natural Organic Acids", "pH Scale Values", "Common Chemical Compounds", "Bleaching Powder & Plaster of Paris"],
        content: {
          overview: "Natural sources of acids (e.g., Tomato, Tamarind, Ant sting) and chemical formulas of standard domestic salts are asked every year.",
          keyPoints: [
            { label: "Vinegar (सिरका)", detail: "Acetic Acid (Ethanoic acid, CH₃COOH 5-8%)." },
            { label: "Tamarind & Grapes (इमली)", detail: "Tartaric Acid." },
            { label: "Tomato (टमाटर)", detail: "Oxalic Acid." },
            { label: "Ant & Nettle Sting (चींटी का डंक)", detail: "Formic Acid / Methanoic Acid (HCOOH)." },
            { label: "Curd / Sour Milk (दही)", detail: "Lactic Acid." }
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
              ["Slaked Lime", "Calcium Hydroxide", "Ca(OH)₂"]
            ]
          },
          tcsTrap: "Heating Gypsum (CaSO₄·2H₂O) at 373 K yields Plaster of Paris (CaSO₄·½H₂O).",
          practiceMcq: {
            question: "What is the chemical formula of Plaster of Paris (POP)?",
            questionHi: "प्लास्टर ऑफ पेरिस (POP) का रासायनिक सूत्र क्या है?",
            options: ["CaSO₄·2H₂O", "CaSO₄·½H₂O", "Na₂CO₃·10H₂O", "CaOCl₂"],
            correctIndex: 1,
            explanation: "Plaster of Paris is Calcium Sulphate Hemihydrate (CaSO₄·½H₂O)."
          }
        }
      }
    ]
  },
  {
    id: "polity",
    name: "Indian Polity (भारतीय राजव्यवस्था)",
    icon: Landmark,
    color: "emerald",
    chapters: [
      {
        id: "pol-fundamental-rights",
        title: "1. Fundamental Rights (मौलिक अधिकार: Art 12-35)",
        hindiTitle: "मौलिक अधिकार और 5 रिट (Writs)",
        readTime: "7 min read",
        subtopics: ["Part III of Constitution", "6 Fundamental Rights", "Article 21 & 32", "5 Writs of Supreme Court"],
        content: {
          overview: "Part III of the Indian Constitution is termed the 'Magna Carta of India'. Questions on Article 14, 19, 21, and Article 32 are guaranteed in SSC exams.",
          keyPoints: [
            { label: "Article 14", detail: "Equality before law and Equal protection of laws." },
            { label: "Article 17", detail: "Abolition of Untouchability (अस्पृश्यता का अंत)." },
            { label: "Article 18", detail: "Abolition of Titles (except military and academic)." },
            { label: "Article 21", detail: "Protection of Life and Personal Liberty (Right to Privacy is part of Art 21)." },
            { label: "Article 21A", detail: "Right to Free and Compulsory Education for 6-14 years (86th Amendment, 2002)." },
            { label: "Article 32", detail: "Right to Constitutional Remedies. Dr. B.R. Ambedkar called it 'The Heart and Soul of the Constitution'." }
          ],
          table: {
            title: "5 Writs Issued by Supreme Court (Art 32) & High Court (Art 226)",
            headers: ["Writ Name", "Literal Meaning", "When Issued"],
            rows: [
              ["Habeas Corpus", "To have the body of", "Against illegal detention of a person"],
              ["Mandamus", "We Command", "To compel a public official to perform their statutory duty"],
              ["Prohibition", "To forbid", "By higher court to prevent lower court from exceeding jurisdiction"],
              ["Certiorari", "To be certified / informed", "To quash an illegal order of a lower court/tribunal"],
              ["Quo-Warranto", "By what authority / warrant", "To prevent illegal usurpation of a public office"]
            ]
          },
          tcsTrap: "Right to Property was removed from Fundamental Rights by the 44th Constitutional Amendment Act (1978) and made a Legal Right under Article 300A.",
          practiceMcq: {
            question: "Which Article of the Indian Constitution was described by Dr. B.R. Ambedkar as the 'Heart and Soul of the Constitution'?",
            questionHi: "डॉ. बी.आर. अम्बेडकर ने भारतीय संविधान के किस अनुच्छेद को 'संविधान का हृदय और आत्मा' कहा था?",
            options: ["Article 14", "Article 19", "Article 21", "Article 32"],
            correctIndex: 3,
            explanation: "Article 32 (Right to Constitutional Remedies) empowers citizens to move the Supreme Court directly for the enforcement of fundamental rights."
          }
        }
      }
    ]
  }
];

export default function NotesPage() {
  const [selectedSubjectId, setSelectedSubjectId] = useState("physics");
  const [selectedChapterId, setSelectedChapterId] = useState("phy-units");
  const [searchQuery, setSearchQuery] = useState("");
  const [sidebarOpen, setSidebarOpen] = useState(false);
  
  // MCQ state in notes
  const [quizAnswer, setQuizAnswer] = useState<number | null>(null);
  const [bookmarkedChapters, setBookmarkedChapters] = useState<string[]>([]);

  useEffect(() => {
    try {
      const saved = localStorage.getItem("ssczone_bookmarked_notes");
      if (saved) setBookmarkedChapters(JSON.parse(saved));
    } catch (e) {}
  }, []);

  const activeSubject = SUBJECTS_DATA.find((s) => s.id === selectedSubjectId) || SUBJECTS_DATA[0];
  const activeChapter = activeSubject.chapters.find((c) => c.id === selectedChapterId) || activeSubject.chapters[0];

  // Filter chapters in sidebar by search
  const filteredChapters = useMemo(() => {
    return activeSubject.chapters.filter((ch) => {
      const matchSearch =
        searchQuery.trim() === "" ||
        ch.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        ch.hindiTitle.toLowerCase().includes(searchQuery.toLowerCase()) ||
        ch.subtopics.some((st) => st.toLowerCase().includes(searchQuery.toLowerCase()));

      return matchSearch;
    });
  }, [activeSubject, searchQuery]);

  const currentChapterIndex = activeSubject.chapters.findIndex((c) => c.id === activeChapter.id);
  const prevChapter = activeSubject.chapters[currentChapterIndex - 1];
  const nextChapter = activeSubject.chapters[currentChapterIndex + 1];

  const toggleBookmark = (chapId: string) => {
    let updated: string[];
    if (bookmarkedChapters.includes(chapId)) {
      updated = bookmarkedChapters.filter((id) => id !== chapId);
      toast.success("Removed from Saved Notes");
    } else {
      updated = [...bookmarkedChapters, chapId];
      toast.success("Saved to Quick Revision Notes! 📌");
    }
    setBookmarkedChapters(updated);
    localStorage.setItem("ssczone_bookmarked_notes", JSON.stringify(updated));
  };

  const isBookmarked = bookmarkedChapters.includes(activeChapter.id);

  return (
    <div className="min-h-screen bg-slate-50 text-gray-900 font-sans antialiased selection:bg-blue-100 selection:text-blue-900">
      
      {/* TOP SUBJECT BAR */}
      <header className="border-b border-gray-200/80 bg-white sticky top-[58px] z-30 shadow-2xs">
        <div className="max-w-7xl mx-auto px-4 py-2.5 flex items-center justify-between gap-3">
          
          {/* Mobile Sidebar Toggle Button */}
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="flex items-center gap-1.5 md:hidden rounded-xl border border-gray-200 bg-gray-50 px-3 py-1.5 text-xs font-bold text-gray-800"
          >
            <Menu className="h-4 w-4 text-blue-600" />
            <span>Chapters</span>
          </button>

          {/* Subject Pills */}
          <div className="flex items-center gap-1.5 overflow-x-auto scrollbar-none py-0.5 flex-1">
            {SUBJECTS_DATA.map((sub) => {
              const Icon = sub.icon;
              const isActive = sub.id === selectedSubjectId;
              return (
                <button
                  key={sub.id}
                  onClick={() => {
                    setSelectedSubjectId(sub.id);
                    setSelectedChapterId(sub.chapters[0].id);
                    setQuizAnswer(null);
                    setSearchQuery("");
                  }}
                  className={`flex items-center gap-1.5 rounded-xl px-3 py-1.5 text-xs font-extrabold transition-all whitespace-nowrap cursor-pointer ${
                    isActive
                      ? "bg-slate-900 text-white shadow-xs"
                      : "bg-gray-100 text-gray-700 hover:bg-gray-200 hover:text-gray-900"
                  }`}
                >
                  <Icon className="h-3.5 w-3.5 text-amber-400" />
                  <span>{sub.name.split(" ")[0]}</span>
                </button>
              );
            })}
          </div>

          {/* Quick Info Tag */}
          <div className="hidden sm:flex items-center gap-2 text-xs text-gray-500 font-semibold">
            <Sparkles className="h-3.5 w-3.5 text-blue-600" />
            <span>TCS High-Yield Theory</span>
          </div>

        </div>
      </header>

      {/* 2-PANEL BOOK READER CANVAS */}
      <div className="max-w-7xl mx-auto px-4 py-6 flex gap-6 items-start">
        
        {/* ========================================================= */}
        {/* LEFT PANEL: CHAPTERS & TOPICS SIDEBAR                     */}
        {/* ========================================================= */}
        <aside
          className={`fixed inset-y-0 left-0 z-40 w-72 bg-white border-r border-gray-200 p-4 transform transition-transform duration-200 ease-in-out md:relative md:translate-x-0 md:w-72 md:rounded-2xl md:border md:shadow-xs md:p-3.5 shrink-0 ${
            sidebarOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"
          }`}
        >
          {/* Mobile Close Button */}
          <div className="flex items-center justify-between pb-3 md:hidden border-b border-gray-100 mb-3">
            <span className="text-xs font-black uppercase text-gray-500">Table of Contents</span>
            <button onClick={() => setSidebarOpen(false)} className="p-1 rounded-lg text-gray-500">
              <X className="h-5 w-5" />
            </button>
          </div>

          {/* Search Box inside Sidebar */}
          <div className="relative mb-3">
            <Search className="absolute left-2.5 top-2.5 h-3.5 w-3.5 text-gray-400" />
            <input
              type="text"
              placeholder="Search chapters & topics..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full rounded-xl border border-gray-200 bg-gray-50/80 pl-8 pr-3 py-1.5 text-xs text-gray-900 placeholder-gray-400 focus:border-blue-500 focus:bg-white focus:outline-none"
            />
          </div>

          <div className="text-[11px] font-bold text-gray-400 uppercase tracking-wider px-2 mb-2">
            {activeSubject.name.split("(")[0]} Chapters ({filteredChapters.length})
          </div>

          {/* Chapter List */}
          <div className="space-y-1 max-h-[calc(100vh-220px)] overflow-y-auto custom-scrollbar pr-1">
            {filteredChapters.map((ch) => {
              const isCurrent = ch.id === activeChapter.id;
              const hasBookmark = bookmarkedChapters.includes(ch.id);

              return (
                <div
                  key={ch.id}
                  onClick={() => {
                    setSelectedChapterId(ch.id);
                    setQuizAnswer(null);
                    setSidebarOpen(false);
                  }}
                  className={`group rounded-xl p-2.5 text-left transition-all cursor-pointer border ${
                    isCurrent
                      ? "bg-blue-50/90 border-blue-200 text-blue-950 font-bold shadow-2xs"
                      : "border-transparent hover:bg-gray-50 text-gray-700 font-medium"
                  }`}
                >
                  <div className="flex items-center justify-between gap-1">
                    <p className={`text-xs leading-snug line-clamp-1 ${isCurrent ? "text-blue-900 font-bold" : "text-gray-800"}`}>
                      {ch.title}
                    </p>
                    {hasBookmark && (
                      <Bookmark className="h-3 w-3 text-amber-500 fill-amber-500 shrink-0" />
                    )}
                  </div>

                  <p className="text-[10px] text-gray-400 mt-0.5 line-clamp-1">{ch.hindiTitle}</p>

                  {/* Subtopics bullet previews */}
                  {isCurrent && (
                    <div className="mt-2 pt-2 border-t border-blue-200/60 pl-2 space-y-1 text-[10px] text-blue-800 font-normal">
                      {ch.subtopics.map((st, i) => (
                        <div key={i} className="flex items-center gap-1">
                          <span className="h-1 w-1 rounded-full bg-blue-500 shrink-0" />
                          <span className="truncate">{st}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {/* Bottom Quick Test link */}
          <div className="pt-3 mt-3 border-t border-gray-100">
            <Link
              href="/exams"
              className="flex items-center justify-between rounded-xl bg-slate-900 p-2.5 text-xs font-bold text-white hover:bg-slate-800 transition-all"
            >
              <span>Practice MCQs</span>
              <ChevronRight className="h-3.5 w-3.5 text-amber-400" />
            </Link>
          </div>
        </aside>

        {/* ========================================================= */}
        {/* RIGHT PANEL: RICH CHAPTER CONTENT CANVAS                  */}
        {/* ========================================================= */}
        <main className="flex-1 bg-white rounded-3xl border border-gray-200/90 p-6 sm:p-10 shadow-xs text-left space-y-8 min-w-0">
          
          {/* Chapter Top Header */}
          <div className="space-y-3 border-b border-gray-100 pb-6">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <span className="rounded-md bg-blue-50 border border-blue-200 px-2.5 py-0.5 text-xs font-bold text-blue-700">
                  {activeSubject.name.split(" ")[0]}
                </span>
                <span className="flex items-center gap-1 text-xs text-gray-400 font-medium">
                  <Clock className="h-3.5 w-3.5" />
                  {activeChapter.readTime}
                </span>
              </div>

              {/* Bookmark button */}
              <button
                onClick={() => toggleBookmark(activeChapter.id)}
                className={`flex items-center gap-1.5 rounded-xl border px-3 py-1.5 text-xs font-bold transition-all cursor-pointer ${
                  isBookmarked
                    ? "border-amber-300 bg-amber-50 text-amber-900 font-extrabold"
                    : "border-gray-200 bg-gray-50 text-gray-600 hover:bg-gray-100"
                }`}
              >
                <Bookmark className={`h-3.5 w-3.5 ${isBookmarked ? "fill-amber-500 text-amber-500" : ""}`} />
                <span>{isBookmarked ? "Saved for Revision" : "Save Notes"}</span>
              </button>
            </div>

            <h1 className="text-2xl sm:text-3xl font-black text-gray-900 tracking-tight leading-tight">
              {activeChapter.title}
            </h1>

            <p className="text-sm font-semibold text-blue-700">{activeChapter.hindiTitle}</p>
          </div>

          {/* Overview Callout Box */}
          <div className="rounded-2xl border border-blue-100 bg-blue-50/60 p-4 text-xs sm:text-sm text-blue-950 leading-relaxed space-y-1">
            <div className="flex items-center gap-1.5 font-bold text-blue-900">
              <Sparkles className="h-4 w-4 text-blue-600" />
              <span>Exam Weightage & Importance:</span>
            </div>
            <p>{activeChapter.content.overview}</p>
          </div>

          {/* Key Core Points */}
          <div className="space-y-4">
            <h3 className="text-base sm:text-lg font-extrabold text-gray-900 flex items-center gap-2">
              <Flame className="h-5 w-5 text-amber-500" />
              <span>High-Yield Concept Notes</span>
            </h3>

            <div className="grid grid-cols-1 gap-2.5">
              {activeChapter.content.keyPoints.map((pt, idx) => (
                <div key={idx} className="rounded-2xl border border-gray-100 bg-gray-50/70 p-4 text-xs sm:text-sm space-y-1">
                  <span className="font-bold text-gray-900 block text-blue-900">{pt.label}:</span>
                  <span className="text-gray-700 leading-relaxed">{pt.detail}</span>
                </div>
              ))}
            </div>
          </div>

          {/* High-Yield Table */}
          {activeChapter.content.table && (
            <div className="space-y-3 pt-2">
              <h3 className="text-base font-extrabold text-gray-900">
                📊 {activeChapter.content.table.title}
              </h3>

              <div className="overflow-x-auto rounded-2xl border border-gray-200 shadow-2xs">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="bg-slate-900 text-white">
                      {activeChapter.content.table.headers.map((h, i) => (
                        <th key={i} className="p-3 font-extrabold">{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100 bg-white">
                    {activeChapter.content.table.rows.map((row, rIdx) => (
                      <tr key={rIdx} className="hover:bg-blue-50/40 transition-colors">
                        {row.map((cell, cIdx) => (
                          <td key={cIdx} className={`p-3 ${cIdx === 0 ? "font-bold text-gray-900" : "text-gray-700"}`}>
                            {cell}
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* TCS Examiner Trap Alert */}
          {activeChapter.content.tcsTrap && (
            <div className="rounded-2xl border border-amber-300/80 bg-amber-50/80 p-4 text-xs sm:text-sm text-amber-950 space-y-1">
              <div className="flex items-center gap-1.5 font-black text-amber-900">
                <Sparkles className="h-4 w-4 text-amber-600" />
                <span>⚠️ Examiner's Trap (बार-बार गलत होने वाला पॉइंट):</span>
              </div>
              <p className="leading-relaxed font-medium">{activeChapter.content.tcsTrap}</p>
            </div>
          )}

          {/* Concept Verification MCQ */}
          {activeChapter.content.practiceMcq && (
            <div className="rounded-3xl border border-gray-200 bg-slate-900 text-white p-6 space-y-4 shadow-md">
              <div className="flex items-center justify-between border-b border-white/10 pb-2.5">
                <span className="rounded bg-blue-600 px-2 py-0.5 text-[10px] font-black uppercase tracking-wider text-white">
                  ⚡ Concept Check MCQ
                </span>
                <span className="text-[11px] text-slate-400 font-semibold">TCS Previous Pattern</span>
              </div>

              <div className="space-y-1">
                <p className="text-sm sm:text-base font-bold leading-relaxed">{activeChapter.content.practiceMcq.question}</p>
                <p className="text-xs text-slate-300 leading-relaxed">{activeChapter.content.practiceMcq.questionHi}</p>
              </div>

              {/* MCQ Options */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-2">
                {activeChapter.content.practiceMcq.options.map((opt, oIdx) => {
                  const isSelected = quizAnswer === oIdx;
                  const isCorrect = oIdx === activeChapter.content.practiceMcq.correctIndex;
                  const answered = quizAnswer !== null;

                  let optStyle = "border-white/10 bg-white/5 hover:bg-white/15 text-slate-200";
                  if (answered) {
                    if (isCorrect) optStyle = "border-emerald-500 bg-emerald-500/20 text-emerald-300 font-bold";
                    else if (isSelected) optStyle = "border-rose-500 bg-rose-500/20 text-rose-300 font-bold";
                    else optStyle = "border-white/5 bg-white/5 opacity-50";
                  }

                  return (
                    <button
                      key={oIdx}
                      disabled={answered}
                      onClick={() => setQuizAnswer(oIdx)}
                      className={`flex items-center gap-2.5 p-3 rounded-xl border text-xs text-left transition-all cursor-pointer ${optStyle}`}
                    >
                      <span className="flex h-5 w-5 items-center justify-center rounded-md bg-white/10 text-[11px] font-black shrink-0">
                        {String.fromCharCode(65 + oIdx)}
                      </span>
                      <span>{opt}</span>
                    </button>
                  );
                })}
              </div>

              {quizAnswer !== null && (
                <div className="p-3 rounded-xl bg-emerald-950/40 border border-emerald-500/30 text-xs text-emerald-200 animate-in fade-in space-y-1">
                  <div className="flex items-center gap-1 font-bold text-emerald-400">
                    <CheckCircle2 className="h-4 w-4" />
                    <span>Detailed Solution:</span>
                  </div>
                  <p className="leading-relaxed text-slate-300">{activeChapter.content.practiceMcq.explanation}</p>
                </div>
              )}
            </div>
          )}

          {/* Bottom Next / Prev Chapter Navigation */}
          <div className="flex items-center justify-between pt-6 border-t border-gray-100 gap-3">
            {prevChapter ? (
              <button
                onClick={() => {
                  setSelectedChapterId(prevChapter.id);
                  setQuizAnswer(null);
                  window.scrollTo({ top: 0, behavior: "smooth" });
                }}
                className="flex items-center gap-2 rounded-xl border border-gray-200 bg-gray-50 px-4 py-2.5 text-xs font-bold text-gray-700 hover:bg-gray-100 transition-all cursor-pointer"
              >
                <ArrowLeft className="h-3.5 w-3.5" />
                <span className="truncate max-w-[120px] sm:max-w-[200px]">{prevChapter.title}</span>
              </button>
            ) : <div />}

            {nextChapter && (
              <button
                onClick={() => {
                  setSelectedChapterId(nextChapter.id);
                  setQuizAnswer(null);
                  window.scrollTo({ top: 0, behavior: "smooth" });
                }}
                className="flex items-center gap-2 rounded-xl bg-blue-600 px-4 py-2.5 text-xs font-bold text-white hover:bg-blue-700 transition-all cursor-pointer"
              >
                <span className="truncate max-w-[120px] sm:max-w-[200px]">{nextChapter.title}</span>
                <ArrowRight className="h-3.5 w-3.5" />
              </button>
            )}
          </div>

        </main>

      </div>

    </div>
  );
}
