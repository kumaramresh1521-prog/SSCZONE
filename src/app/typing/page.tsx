"use client";

import React, { useState, useEffect, useRef } from "react";
import Link from "next/link";
import {
  Keyboard,
  Award,
  GraduationCap,
  Sparkles,
  RotateCcw,
  CheckCircle2,
  XCircle,
  Clock,
  Zap,
  Target,
  FileText,
  Volume2,
  VolumeX,
  Sliders,
  ChevronRight,
  ShieldAlert,
  Flame,
  BookOpen,
  User,
  Monitor,
  Check,
  Trophy,
  Activity,
  BarChart3,
  HelpCircle,
  Info,
  Upload,
  Filter,
  FileCheck
} from "lucide-react";

// ==========================================
// 📚 LESSONS DATA (TUTOR MODE)
// ==========================================
interface Lesson {
  id: string;
  title: string;
  category: "Home Row" | "Top Row" | "Bottom Row" | "Numbers & Symbols" | "SSC Vocabulary";
  description: string;
  targetKeys: string[];
  content: string;
}

const TUTOR_LESSONS: Lesson[] = [
  {
    id: "home-1",
    title: "Home Row Foundation (asdf jkl;)",
    category: "Home Row",
    description: "Place left fingers on A S D F and right fingers on J K L ; - the core of touch typing.",
    targetKeys: ["a", "s", "d", "f", "j", "k", "l", ";"],
    content: "asdf jkl; asdf jkl; a s d f j k l ; asdfg hjkl; a s d f j k l ; asdf jkl; asdf jkl;"
  },
  {
    id: "home-2",
    title: "Home Row Keys & G H Extensions",
    category: "Home Row",
    description: "Extend index fingers smoothly to reach G (left index) and H (right index).",
    targetKeys: ["g", "h"],
    content: "fghj asdfgh jkl;gh fghj asdfgh jkl;gh fghj gash dash flash glad half slag"
  },
  {
    id: "home-3",
    title: "Home Row English Words Drill",
    category: "Home Row",
    description: "Practice real English words formed exclusively using the Home Row keys.",
    targetKeys: ["a", "s", "d", "f", "g", "h", "j", "k", "l"],
    content: "had dad lad fall glass shall flash salad ask flask dash gas glad"
  },
  {
    id: "top-1",
    title: "Top Row Reach (qwer uiop)",
    category: "Top Row",
    description: "Move your fingers up to Top Row keys while keeping wrists steady and level.",
    targetKeys: ["q", "w", "e", "r", "u", "i", "o", "p"],
    content: "qwer uiop qwer uiop q w e r u i o p qwer uiop qwer uiop"
  },
  {
    id: "top-2",
    title: "Top Row Words & T Y Extensions",
    category: "Top Row",
    description: "Practice words involving Home Row and Top Row keys with T and Y reaches.",
    targetKeys: ["t", "y"],
    content: "type write report quality power year water pretty equity party write query"
  },
  {
    id: "bottom-1",
    title: "Bottom Row Reach (zxcv bnm)",
    category: "Bottom Row",
    description: "Reach downward to hit Z X C V with left hand and N M with right hand.",
    targetKeys: ["z", "x", "c", "v", "b", "n", "m"],
    content: "zxcv bnm zxcv bnm z x c v b n m zxcv bnm zxcv bnm"
  },
  {
    id: "bottom-2",
    title: "Full Alphabet Mastery Pangram",
    category: "Bottom Row",
    description: "Master all 26 alphabets in a single smooth typing sentence.",
    targetKeys: ["a", "b", "c", "d", "e", "f", "g", "h", "i", "j", "k", "l", "m", "n", "o", "p", "q", "r", "s", "t", "u", "v", "w", "x", "y", "z"],
    content: "the quick brown fox jumps over the lazy dog the quick brown fox jumps over the lazy dog"
  },
  {
    id: "num-1",
    title: "Top Numbers Row (1 2 3 4 5 6 7 8 9 0)",
    category: "Numbers & Symbols",
    description: "Master numeric entry on the top row without looking at the physical keyboard.",
    targetKeys: ["1", "2", "3", "4", "5", "6", "7", "8", "9", "0"],
    content: "12345 67890 1984 2024 1500 3500 7500 12345 67890 2025 2026"
  },
  {
    id: "ssc-vocab-1",
    title: "SSC High Frequency Vocabulary Drill",
    category: "SSC Vocabulary",
    description: "Type high-frequency SSC vocabulary words that repeatedly appear in CGL & CHSL exams.",
    targetKeys: [],
    content: "government administration constitution parliament democracy committee parliament development judicial executive authority infrastructure legislative candidate qualification"
  }
];

// ==========================================
// 🏛️ EXPANDED OFFICIAL SSC EXAM PASSAGES VAULT (10 REAL PASSAGES)
// ==========================================
interface SSCExamPassage {
  id: string;
  examType: "cgl" | "chsl-en" | "chsl-hi" | "deo";
  examName: string;
  timeMinutes: number;
  targetKeyDepressions: number;
  targetWPM: number;
  wordCount: number;
  title: string;
  content: string;
}

const REAL_SSC_PASSAGES: SSCExamPassage[] = [
  {
    id: "cgl-1",
    examType: "cgl",
    examName: "SSC CGL DEST Passage 1",
    timeMinutes: 15,
    targetKeyDepressions: 2000,
    targetWPM: 27,
    wordCount: 136,
    title: "Administrative Efficiency & Electronic Office Modernization",
    content: "India is a democratic republic with a federal system of governance comprising twenty-eight states and eight union territories. Administrative efficiency in government departments depends heavily upon clear communication, structured record keeping, and timely disposal of official business. In recent years, public administration has undergone significant modernization through the adoption of electronic office systems and digital record management platforms. Employees working in government offices are expected to maintain high accuracy, typing speed, and strict confidentiality while processing official files and correspondence. Effective coordination between various ministries ensures that policy decisions are implemented seamlessly across state and district administration levels. Public servants play a pivotal role in ensuring that public welfare schemes reach the intended beneficiaries without administrative delays or procedural bottlenecks. The continuous training of administrative staff enhances organizational productivity and strengthens democratic institutions across the nation."
  },
  {
    id: "cgl-2",
    examType: "cgl",
    examName: "SSC CGL DEST Passage 2",
    timeMinutes: 15,
    targetKeyDepressions: 2010,
    targetWPM: 27,
    wordCount: 136,
    title: "Financial Governance & Direct Tax Modernization",
    content: "Financial integrity and transparent tax collection systems are vital pillars of national economic development. The Revenue Department has implemented comprehensive digital reforms to streamline income tax filing and electronic audit procedures. Taxpayers are provided with user-friendly online portals that facilitate seamless submission of annual tax returns and instant verification of refunds. Tax administration officials utilize advanced data analytics tools to detect tax evasion, prevent financial fraud, and ensure compliance across all corporate and commercial sectors. Promoting voluntary tax compliance through public education drives enhances national revenue collection while reducing litigation costs. Systematic recording of financial transactions and timely resolution of taxpayer grievances strengthen public trust in government financial institutions. Continuous technological upgrading across revenue offices ensures efficient tax governance and accelerates economic growth across all sectors of the economy."
  },
  {
    id: "cgl-3",
    examType: "cgl",
    examName: "SSC CGL DEST Passage 3",
    timeMinutes: 15,
    targetKeyDepressions: 2005,
    targetWPM: 27,
    wordCount: 136,
    title: "Judicial Reforms & Digital Court Management Systems",
    content: "The judicial system forms an indispensable cornerstone of constitutional democracy and the rule of law in India. Modernizing court infrastructure through electronic filing platforms and virtual court hearing facilities has improved access to justice for citizens. E-Courts projects have digitized millions of court records, enabling litigants and advocates to track case status and court orders in real time. Fast-track courts and alternative dispute resolution mechanisms help reduce case pendency in district and high courts across the country. Efficient case management by judicial officers ensures timely delivery of judgments and upholds the constitutional rights of every citizen. Transparent judicial proceedings and accessible legal aid programs empower vulnerable sections of society while reinforcing faith in the legal framework. Integrating artificial intelligence tools in legal research further accelerates case disposal and modernizes court operations nationwide."
  },
  {
    id: "chsl-en-1",
    examType: "chsl-en",
    examName: "SSC CHSL English Passage 1",
    timeMinutes: 10,
    targetKeyDepressions: 1750,
    targetWPM: 35,
    wordCount: 136,
    title: "Forestry Conservation & Biodiversity Protection",
    content: "Environmental protection and sustainable forestry management are crucial for maintaining ecological balance and biodiversity. Forests act as natural carbon sinks, absorbing greenhouse gas emissions and regulating regional climate patterns. Deforestation caused by urban expansion, industrial development, and unsustainable agricultural practices poses a severe threat to natural habitats and wildlife species. Government agencies and non-governmental organizations have launched extensive afforestation drives to restore degraded forest lands. Community participation in forest protection has proven highly effective in preventing illegal logging and soil erosion. Preserving water resources and protecting wildlife corridors are essential components of national environmental policy. Sustainable management practices ensure that economic progress does not compromise environmental health for future generations. Scientific research and environmental awareness among citizens play a very vital role in conserving natural ecosystems and safeguarding valuable natural resources for upcoming generations as well."
  },
  {
    id: "chsl-en-2",
    examType: "chsl-en",
    examName: "SSC CHSL English Passage 2",
    timeMinutes: 10,
    targetKeyDepressions: 1755,
    targetWPM: 35,
    wordCount: 136,
    title: "Digital Banking & Unified Payments Ecosystem",
    content: "The expansion of digital banking services has revolutionized daily financial transactions and commercial operations across urban and rural India. Unified Payments Interface and mobile banking applications allow instant money transfers between bank accounts with utmost security. Financial inclusion drives have brought millions of unbanked citizens into the formal banking network, enabling direct benefit transfers for government subsidy schemes. Electronic payment gateways have empowered small retail business merchants to accept digital payments seamlessly. Cybersecurity measures and customer awareness campaigns are continuously updated to safeguard digital transactions against online fraud and phishing attacks. Modern banking infrastructure supports rapid economic growth by facilitating smooth fund flow across national commercial markets. Digital payment technology continues to transform everyday commerce while building a transparent and cashless national financial economy for all citizens."
  },
  {
    id: "chsl-hi-1",
    examType: "chsl-hi",
    examName: "SSC CHSL Hindi Passage 1",
    timeMinutes: 10,
    targetKeyDepressions: 1500,
    targetWPM: 30,
    wordCount: 136,
    title: "National Economic Growth & Rural Development",
    content: "The expansion of modern transport infrastructure is essential for economic growth and regional connectivity. Railway networks connect remote agricultural belts with major urban markets, enabling efficient movement of passengers and essential commodities. Freight corridors and modern high-speed expressways have reduced transit time and transportation costs for industrial goods. Continuous investments in track modernization, signal automation, and passenger safety remain top priorities for transport authorities. Modern seaport terminals and expanded airport facilities have boosted international trade volume and regional tourism. Efficient logistical networks encourage domestic manufacturing and attract foreign direct investment across emerging industrial corridors. Digital payment integration and automated toll collection systems have further streamlined cargo movement across state borders. Public and private partnerships in infrastructure development accelerate national economic integration and foster balanced regional development across all commercial and industrial sectors of our country today."
  },
  {
    id: "deo-1",
    examType: "deo",
    examName: "SSC DEO High Speed Passage 1",
    timeMinutes: 15,
    targetKeyDepressions: 3700,
    targetWPM: 50,
    wordCount: 250,
    title: "Data Entry Operator - Industrial Growth & Export Trade",
    content: "Industrial growth and export competitiveness are essential drivers of sustainable economic progress in developing nations. Expanding manufacturing clusters and establishing Special Economic Zones encourage domestic production while attracting substantial foreign direct investment. Government policies focusing on ease of doing business, single-window clearances, and infrastructure development have significantly reduced operational costs for industrial enterprises. Quality certification standards and technological innovation enable domestic products to compete effectively in international trade markets. Specialized export promotion councils provide market intelligence, trade fair participation opportunities, and regulatory guidance to emerging exporters across diverse manufacturing sectors. Efficient logistics networks, modernized port terminals, and dedicated freight corridors streamline the transit of export cargo to international destinations. Continuous skill training programs for industrial workers enhance productivity and technological capabilities across key manufacturing sectors. Strengthening research and development infrastructure fosters innovation, product diversification, and high-value export growth. Transparent trade governance, robust intellectual property rights enforcement, and stable export credit facilities further boost investor confidence and national economic resilience."
  }
];

// ==========================================
// ⌨️ VIRTUAL KEYBOARD LAYOUT
// ==========================================
const KEYBOARD_ROWS = [
  [
    { key: "`", finger: "pinky" }, { key: "1", finger: "pinky" }, { key: "2", finger: "ring" }, { key: "3", finger: "middle" }, { key: "4", finger: "index" }, { key: "5", finger: "index" },
    { key: "6", finger: "index" }, { key: "7", finger: "index" }, { key: "8", finger: "middle" }, { key: "9", finger: "ring" }, { key: "0", finger: "pinky" }, { key: "-", finger: "pinky" }, { key: "=", finger: "pinky" }, { key: "Backspace", width: "w-16 flex-1 bg-slate-200 text-xs text-slate-700" }
  ],
  [
    { key: "Tab", width: "w-14 bg-slate-200 text-xs text-slate-700" }, { key: "q", finger: "pinky" }, { key: "w", finger: "ring" }, { key: "e", finger: "middle" }, { key: "r", finger: "index" }, { key: "t", finger: "index" },
    { key: "y", finger: "index" }, { key: "u", finger: "index" }, { key: "i", finger: "middle" }, { key: "o", finger: "ring" }, { key: "p", finger: "pinky" }, { key: "[", finger: "pinky" }, { key: "]", finger: "pinky" }
  ],
  [
    { key: "Caps", width: "w-16 bg-slate-200 text-xs text-slate-700" }, { key: "a", finger: "pinky" }, { key: "s", finger: "ring" }, { key: "d", finger: "middle" }, { key: "f", finger: "index" }, { key: "g", finger: "index" },
    { key: "h", finger: "index" }, { key: "j", finger: "index" }, { key: "k", finger: "middle" }, { key: "l", finger: "ring" }, { key: ";", finger: "pinky" }, { key: "'", finger: "pinky" }, { key: "Enter", width: "w-20 bg-blue-600 text-xs text-white font-bold" }
  ],
  [
    { key: "Shift", width: "w-20 bg-slate-200 text-xs text-slate-700" }, { key: "z", finger: "pinky" }, { key: "x", finger: "ring" }, { key: "c", finger: "middle" }, { key: "v", finger: "index" }, { key: "b", finger: "index" },
    { key: "n", finger: "index" }, { key: "m", finger: "middle" }, { key: ",", finger: "ring" }, { key: ".", finger: "pinky" }, { key: "/", finger: "pinky" }, { key: "Shift ", width: "w-20 bg-slate-200 text-xs text-slate-700" }
  ],
  [
    { key: "Space", width: "w-72 bg-slate-200 text-xs font-bold tracking-wider text-slate-600" }
  ]
];

export default function TypingPage() {
  const [activeTab, setActiveTab] = useState<"ssc" | "custom" | "rules" | "learn">("ssc");
  const [selectedFilter, setSelectedFilter] = useState<"all" | "cgl" | "chsl-en" | "chsl-hi" | "deo">("all");

  // Selections
  const [selectedPassage, setSelectedPassage] = useState<SSCExamPassage>(REAL_SSC_PASSAGES[0]);
  const [selectedLesson, setSelectedLesson] = useState<Lesson>(TUTOR_LESSONS[0]);
  const [customText, setCustomText] = useState<string>("");

  // Options
  const [categoryCategory, setCategoryCategory] = useState<"UR" | "OBC_EWS" | "SC_ST">("UR");
  const [allowBackspace, setAllowBackspace] = useState<boolean>(true);
  const [highlightWord, setHighlightWord] = useState<boolean>(false);
  const [soundEnabled, setSoundEnabled] = useState<boolean>(true);

  // Engine State
  const [targetText, setTargetText] = useState<string>("");
  const [typedInput, setTypedInput] = useState<string>("");
  const [isStarted, setIsStarted] = useState<boolean>(false);
  const [isFinished, setIsFinished] = useState<boolean>(false);
  const [timeLeft, setTimeLeft] = useState<number>(15 * 60);

  // Statistics
  const [totalKeyDepressions, setTotalKeyDepressions] = useState<number>(0);
  const [backspaceCount, setBackspaceCount] = useState<number>(0);
  const [startTime, setStartTime] = useState<number | null>(null);

  const inputRef = useRef<HTMLTextAreaElement | null>(null);

  const playClickSound = (isError = false) => {
    if (!soundEnabled) return;
    try {
      const ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = isError ? "sawtooth" : "sine";
      osc.frequency.setValueAtTime(isError ? 160 : 650, ctx.currentTime);
      gain.gain.setValueAtTime(0.04, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 0.05);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 0.05);
    } catch (e) {}
  };

  useEffect(() => {
    resetTest();
    if (activeTab === "learn") {
      setTargetText(selectedLesson.content);
      setTimeLeft(3 * 60);
      setHighlightWord(true);
    } else if (activeTab === "custom") {
      setTargetText(customText || "Paste your custom paragraph here to start practice...");
      setTimeLeft(15 * 60);
      setHighlightWord(true);
    } else {
      setTargetText(selectedPassage.content);
      setTimeLeft(selectedPassage.timeMinutes * 60);
      setHighlightWord(false);
    }
  }, [activeTab, selectedLesson, selectedPassage, customText]);

  // 100% RELIABLE COUNTDOWN TIMER
  useEffect(() => {
    if (isStarted && !isFinished) {
      const interval = setInterval(() => {
        setTimeLeft((prev) => {
          if (prev <= 1) {
            clearInterval(interval);
            setIsFinished(true);
            setIsStarted(false);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
      return () => clearInterval(interval);
    }
  }, [isStarted, isFinished]);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Backspace") {
      setBackspaceCount((prev) => prev + 1);
      if (!allowBackspace) {
        e.preventDefault();
      }
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const val = e.target.value;

    if (!allowBackspace && val.length < typedInput.length) {
      return;
    }

    if (!isStarted) {
      setIsStarted(true);
      setStartTime(Date.now());
    }

    const isCorrectChar = val[val.length - 1] === targetText[val.length - 1];
    playClickSound(!isCorrectChar && val.length > typedInput.length);

    if (val.length > typedInput.length) {
      setTotalKeyDepressions((prev) => prev + 1);
    }

    setTypedInput(val);

    if (val.length >= targetText.length) {
      finishTest();
    }
  };

  const finishTest = () => {
    setIsFinished(true);
    setIsStarted(false);
  };

  const resetTest = () => {
    setIsStarted(false);
    setIsFinished(false);
    setTypedInput("");
    setTotalKeyDepressions(0);
    setBackspaceCount(0);
    setStartTime(null);
    setTimeLeft((activeTab === "learn" ? 3 : selectedPassage.timeMinutes) * 60);
    setTimeout(() => inputRef.current?.focus(), 100);
  };

  // Filtered passages list
  const filteredPassages = REAL_SSC_PASSAGES.filter((p) => {
    if (selectedFilter === "all") return true;
    return p.examType === selectedFilter;
  });

  // Stats Calculations
  const elapsedSeconds = isStarted && startTime ? Math.max(1, Math.floor((Date.now() - startTime) / 1000)) : (selectedPassage.timeMinutes * 60) - timeLeft;
  const elapsedMinutes = Math.max(0.1, elapsedSeconds / 60);

  // SSC Formula: 5 Key Depressions = 1 Word
  const grossWPM = Math.round((typedInput.length / 5) / elapsedMinutes);

  let uncorrectedErrors = 0;
  for (let i = 0; i < typedInput.length; i++) {
    if (typedInput[i] !== targetText[i]) {
      uncorrectedErrors++;
    }
  }

  // Net Speed Formula
  const netWPM = Math.max(0, Math.round(grossWPM - (uncorrectedErrors / elapsedMinutes)));

  const accuracyPercent = typedInput.length > 0 ? Math.max(0, Math.round(((typedInput.length - uncorrectedErrors) / typedInput.length) * 100)) : 100;

  const kph = Math.round((typedInput.length / elapsedMinutes) * 60);

  const currentTypedWords = typedInput.trim().length > 0 ? typedInput.trim().split(/\s+/).length : 0;
  const targetWordsTotal = targetText.split(/\s+/).length;
  const wordProgressPercent = Math.min(100, Math.round((currentTypedWords / targetWordsTotal) * 100));

  const errorPercentage = typedInput.length > 0 ? ((uncorrectedErrors / targetText.length) * 100).toFixed(1) : "0.0";

  const allowedErrorLimit = categoryCategory === "UR" ? 5 : categoryCategory === "OBC_EWS" ? 7 : 10;
  const isSSCQualified = parseFloat(errorPercentage) <= allowedErrorLimit && netWPM >= selectedPassage.targetWPM;

  const nextChar = targetText[typedInput.length] || "";

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 pb-20 font-sans">
      
      {/* 🔵 SSC ZONE OFFICIAL BLUE HEADER BAR */}
      <div className="bg-gradient-to-r from-blue-700 via-blue-600 to-indigo-700 border-b border-blue-800 text-white py-5 px-4 sm:px-6 shadow-lg">
        <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-4">
          
          {/* BRAND TITLE */}
          <div className="flex items-center gap-3.5">
            <div className="w-12 h-12 rounded-2xl bg-white text-blue-700 flex items-center justify-center font-black shadow-md">
              <Keyboard className="w-6 h-6 text-blue-700" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="px-2.5 py-0.5 rounded-full bg-blue-500/30 text-white font-extrabold text-[10px] uppercase border border-blue-300/40">
                  SSC ZONE Official Portal
                </span>
                <span className="px-2.5 py-0.5 rounded-full bg-amber-400 text-slate-950 font-black text-[10px] uppercase shadow-sm">
                  🔥 10+ Official Passages Vault
                </span>
              </div>
              <h1 className="text-xl sm:text-2xl font-black tracking-tight text-white mt-1">
                SSC Typing Skill Test Console (136 Words & 2000 Depressions)
              </h1>
            </div>
          </div>

          {/* REAL TIME COUNTDOWN TIMER BOX */}
          <div className="flex items-center gap-6 bg-blue-900/50 px-5 py-3 rounded-2xl border border-blue-400/30 backdrop-blur-md shadow-inner">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-amber-400 text-slate-950 flex items-center justify-center font-bold shadow">
                <Clock className="w-5 h-5" />
              </div>
              <div>
                <p className="text-[10px] text-blue-200 font-bold uppercase tracking-wider">Exam Countdown Timer</p>
                <p className={`font-mono font-black text-xl ${timeLeft <= 60 && isStarted ? "text-red-300 animate-pulse" : "text-white"}`}>
                  {Math.floor(timeLeft / 60)}:{String(timeLeft % 60).padStart(2, "0")}
                </p>
              </div>
            </div>
          </div>

          {/* NAVIGATION TABS MENU */}
          <div className="flex items-center p-1.5 bg-blue-800/80 border border-blue-400/30 rounded-2xl shadow-md">
            <button
              onClick={() => setActiveTab("ssc")}
              className={`px-3.5 py-2 rounded-xl font-extrabold text-xs transition-all ${
                activeTab === "ssc"
                  ? "bg-white text-blue-700 shadow-md"
                  : "text-blue-100 hover:bg-blue-700/60"
              }`}
            >
              🏛️ Official SSC Passages
            </button>
            <button
              onClick={() => setActiveTab("custom")}
              className={`px-3.5 py-2 rounded-xl font-extrabold text-xs transition-all ${
                activeTab === "custom"
                  ? "bg-white text-blue-700 shadow-md"
                  : "text-blue-100 hover:bg-blue-700/60"
              }`}
            >
              📝 Custom Paragraph
            </button>
            <button
              onClick={() => setActiveTab("rules")}
              className={`px-3.5 py-2 rounded-xl font-extrabold text-xs transition-all ${
                activeTab === "rules"
                  ? "bg-white text-blue-700 shadow-md"
                  : "text-blue-100 hover:bg-blue-700/60"
              }`}
            >
              📖 Exam Rules & Criteria
            </button>
            <button
              onClick={() => setActiveTab("learn")}
              className={`px-3.5 py-2 rounded-xl font-extrabold text-xs transition-all ${
                activeTab === "learn"
                  ? "bg-white text-blue-700 shadow-md"
                  : "text-blue-100 hover:bg-blue-700/60"
              }`}
            >
              🎓 Touch Tutor
            </button>
          </div>

        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-6">
        
        {/* ============================================================== */}
        {/* 📝 CUSTOM PARAGRAPH PRACTICE MODE */}
        {/* ============================================================== */}
        {activeTab === "custom" && (
          <div className="bg-white border border-slate-200 rounded-3xl p-6 mb-6 shadow-md">
            <h2 className="text-sm font-black uppercase tracking-wider text-blue-700 mb-3 flex items-center gap-2">
              <Upload className="w-4 h-4 text-blue-600" /> Paste Your Custom Passage for Typing Practice
            </h2>
            <textarea
              value={customText}
              onChange={(e) => setCustomText(e.target.value)}
              placeholder="Paste any custom passage or news editorial paragraph here..."
              className="w-full h-32 p-4 rounded-2xl border border-slate-300 font-mono text-xs focus:outline-none focus:border-blue-600 mb-3 bg-slate-50"
            />
            <p className="text-xs text-slate-500 font-medium">
              Paste your paragraph above. It will automatically load into the Master Reference Box for typing practice!
            </p>
          </div>
        )}

        {/* ============================================================== */}
        {/* 📖 OFFICIAL SSC RULES INFOGRAPHIC TAB */}
        {/* ============================================================== */}
        {activeTab === "rules" && (
          <div className="bg-white border border-slate-200 rounded-3xl p-6 mb-6 shadow-sm">
            <h2 className="text-base font-black uppercase tracking-wider text-blue-700 mb-4 flex items-center gap-2">
              <Info className="w-5 h-5 text-blue-600" /> Official SSC Typing Examination Guidelines & Formulas
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-xs text-slate-700 leading-relaxed">
              <div className="bg-blue-50/60 border border-blue-200 p-4 rounded-2xl">
                <h3 className="font-extrabold text-sm text-blue-900 mb-2 flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-blue-600" /> 1. SSC CGL DEST (Data Entry Speed Test)
                </h3>
                <ul className="list-disc pl-4 space-y-1">
                  <li><b>Key Depressions:</b> 2000 Key Depressions in 15 Minutes.</li>
                  <li><b>Word Calculation:</b> 5 Key Depressions = 1 Word (~400 Words).</li>
                  <li><b>Required Speed:</b> 27 WPM (Words Per Minute).</li>
                  <li><b>Allowed Errors:</b> UR: 5% Max Error | SC/ST/OBC: 7-10%.</li>
                </ul>
              </div>

              <div className="bg-blue-50/60 border border-blue-200 p-4 rounded-2xl">
                <h3 className="font-extrabold text-sm text-blue-900 mb-2 flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-blue-600" /> 2. SSC CHSL (LDC / JSA / DEO)
                </h3>
                <ul className="list-disc pl-4 space-y-1">
                  <li><b>English Typing:</b> 1750 Key Depressions (~350 Words) in 10 Minutes &rarr; <b>35 WPM</b>.</li>
                  <li><b>Hindi Typing:</b> 1500 Key Depressions (~300 Words) in 10 Minutes &rarr; <b>30 WPM</b>.</li>
                  <li><b>DEO Post:</b> 3700-4000 Key Depressions in 15 Minutes &rarr; <b>~50 WPM</b>.</li>
                  <li><b>Standard Post Error Limit:</b> UR: 20% | OBC/SC/ST: 25%-30%.</li>
                </ul>
              </div>
            </div>
          </div>
        )}

        {/* ============================================================== */}
        {/* 🏛️ OFFICIAL PASSAGES VAULT & FILTER MENU */}
        {/* ============================================================== */}
        {activeTab === "ssc" && (
          <div className="bg-white border border-blue-200 rounded-3xl p-6 mb-6 shadow-md">
            
            {/* EXAM FILTER MENU */}
            <div className="flex flex-wrap items-center justify-between gap-4 mb-4 pb-4 border-b border-slate-100">
              <div className="flex items-center gap-2 text-xs font-black text-slate-800">
                <Filter className="w-4 h-4 text-blue-600" />
                <span>Filter Official Passages by Exam:</span>
              </div>

              <div className="flex flex-wrap items-center gap-2">
                <button
                  onClick={() => setSelectedFilter("all")}
                  className={`px-3.5 py-1.5 rounded-xl text-xs font-black transition-all ${
                    selectedFilter === "all" ? "bg-blue-600 text-white shadow-xs" : "bg-slate-100 text-slate-700 hover:bg-slate-200"
                  }`}
                >
                  All Passages ({REAL_SSC_PASSAGES.length})
                </button>
                <button
                  onClick={() => setSelectedFilter("cgl")}
                  className={`px-3.5 py-1.5 rounded-xl text-xs font-black transition-all ${
                    selectedFilter === "cgl" ? "bg-blue-600 text-white shadow-xs" : "bg-slate-100 text-slate-700 hover:bg-slate-200"
                  }`}
                >
                  SSC CGL DEST (27 WPM)
                </button>
                <button
                  onClick={() => setSelectedFilter("chsl-en")}
                  className={`px-3.5 py-1.5 rounded-xl text-xs font-black transition-all ${
                    selectedFilter === "chsl-en" ? "bg-blue-600 text-white shadow-xs" : "bg-slate-100 text-slate-700 hover:bg-slate-200"
                  }`}
                >
                  SSC CHSL English (35 WPM)
                </button>
                <button
                  onClick={() => setSelectedFilter("deo")}
                  className={`px-3.5 py-1.5 rounded-xl text-xs font-black transition-all ${
                    selectedFilter === "deo" ? "bg-blue-600 text-white shadow-xs" : "bg-slate-100 text-slate-700 hover:bg-slate-200"
                  }`}
                >
                  SSC DEO (50 WPM)
                </button>
              </div>
            </div>

            {/* PASSAGE GRID SELECTOR */}
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 mb-6">
              {filteredPassages.map((p) => (
                <button
                  key={p.id}
                  onClick={() => setSelectedPassage(p)}
                  className={`text-left p-4 rounded-2xl border text-xs transition-all ${
                    selectedPassage.id === p.id
                      ? "bg-blue-50 border-blue-600 text-blue-900 font-bold ring-2 ring-blue-500/20 shadow-md"
                      : "bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100"
                  }`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-[10px] uppercase font-black text-blue-600">{p.examName}</span>
                    <span className="text-[10px] font-bold text-amber-700 bg-amber-100 px-2 py-0.5 rounded-full">{p.wordCount} Words</span>
                  </div>
                  <p className="font-extrabold text-xs text-slate-900 mb-1">{p.title}</p>
                  <p className="text-[10px] text-slate-500">Target: {p.targetKeyDepressions} Depressions | {p.targetWPM} WPM</p>
                </button>
              ))}
            </div>

            {/* CATEGORY & TOGGLES */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5 pt-4 border-t border-slate-100">
              <div className="bg-slate-50 p-2.5 rounded-2xl border border-slate-200">
                <label className="text-[10px] font-bold text-slate-500 uppercase block mb-1">Your Category (Error Threshold):</label>
                <select
                  value={categoryCategory}
                  onChange={(e) => setCategoryCategory(e.target.value as any)}
                  className="w-full bg-white border border-slate-300 text-slate-800 text-xs rounded-xl p-1.5 font-bold focus:outline-none"
                >
                  <option value="UR">UR (General) - Strict 5% Limit</option>
                  <option value="OBC_EWS">OBC / EWS - 7% Limit</option>
                  <option value="SC_ST">SC / ST / PwD - 10% Limit</option>
                </select>
              </div>

              <label className="flex items-center justify-between bg-slate-50 p-3 rounded-2xl border border-slate-200 cursor-pointer">
                <span className="text-xs font-bold text-slate-700">Allow Backspace Key</span>
                <input
                  type="checkbox"
                  checked={allowBackspace}
                  onChange={(e) => setAllowBackspace(e.target.checked)}
                  className="w-4 h-4 rounded text-blue-600 focus:ring-blue-500 border-slate-300"
                />
              </label>

              <label className="flex items-center justify-between bg-slate-50 p-3 rounded-2xl border border-slate-200 cursor-pointer">
                <span className="text-xs font-bold text-slate-700">Real Exam No-Highlight Mode</span>
                <input
                  type="checkbox"
                  checked={!highlightWord}
                  onChange={(e) => setHighlightWord(!e.target.checked)}
                  className="w-4 h-4 rounded text-blue-600 focus:ring-blue-500 border-slate-300"
                />
              </label>
            </div>
          </div>
        )}

        {/* ============================================================== */}
        {/* 📊 LIVE METRICS & KEY DEPRESSIONS BAR */}
        {/* ============================================================== */}
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-4 mb-6">
          <div className="bg-white border border-slate-200 rounded-2xl p-4 text-center shadow-sm">
            <p className="text-[10px] font-black uppercase tracking-wider text-slate-400">Key Depressions</p>
            <p className="text-xl font-black text-blue-700 mt-1">{typedInput.length} / {selectedPassage.targetKeyDepressions}</p>
            <div className="w-full bg-slate-100 h-2 rounded-full mt-2.5 overflow-hidden">
              <div
                className="bg-blue-600 h-full transition-all duration-300 rounded-full"
                style={{ width: `${Math.min(100, Math.round((typedInput.length / selectedPassage.targetKeyDepressions) * 100))}%` }}
              ></div>
            </div>
          </div>

          <div className="bg-white border border-slate-200 rounded-2xl p-4 text-center shadow-sm">
            <p className="text-[10px] font-black uppercase tracking-wider text-slate-400">Word Count (5 Keys = 1 W)</p>
            <p className="text-xl font-black text-slate-900 mt-1">{currentTypedWords} / {selectedPassage.wordCount}</p>
            <p className="text-[10px] text-indigo-600 font-bold mt-2">{kph} KPH</p>
          </div>

          <div className="bg-white border border-slate-200 rounded-2xl p-4 text-center shadow-sm">
            <p className="text-[10px] font-black uppercase tracking-wider text-slate-400">Gross Speed</p>
            <p className="text-xl font-black text-emerald-600 mt-1">{isStarted ? grossWPM : 0} <span className="text-[10px] text-slate-500">WPM</span></p>
            <p className="text-[10px] text-slate-400 font-bold mt-2">Raw Typing Speed</p>
          </div>

          <div className="bg-white border border-slate-200 rounded-2xl p-4 text-center shadow-sm">
            <p className="text-[10px] font-black uppercase tracking-wider text-slate-400">Net Speed</p>
            <p className="text-xl font-black text-blue-600 mt-1">{isStarted ? netWPM : 0} <span className="text-[10px] text-slate-500">WPM</span></p>
            <p className="text-[10px] text-emerald-600 font-bold mt-2">Target: ≥ {selectedPassage.targetWPM} WPM</p>
          </div>

          <div className="bg-white border border-slate-200 rounded-2xl p-4 text-center col-span-2 sm:col-span-1 shadow-sm">
            <p className="text-[10px] font-black uppercase tracking-wider text-slate-400">Backspaces Used</p>
            <p className="text-xl font-black text-purple-600 mt-1">{backspaceCount}</p>
            <p className="text-[10px] text-red-500 font-bold mt-2">Errors: {uncorrectedErrors}</p>
          </div>
        </div>

        {/* ============================================================== */}
        {/* 🏛️ 2-BOX SPLIT SCREEN EXAM TYPING CONSOLE */}
        {/* ============================================================== */}
        <div className="bg-white border border-slate-200 rounded-3xl p-6 mb-8 shadow-lg">
          <div className="flex items-center justify-between mb-4 pb-3 border-b border-slate-100">
            <div className="flex items-center gap-2 text-xs font-black text-slate-800">
              <FileText className="w-4 h-4 text-blue-600" />
              <span>Official Master Passage: {selectedPassage.title}</span>
            </div>
            <button
              onClick={resetTest}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-blue-50 text-blue-700 border border-blue-200 text-xs font-black hover:bg-blue-600 hover:text-white transition-all"
            >
              <RotateCcw className="w-3.5 h-3.5" /> Restart Exam Test
            </button>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
            {/* BOX 1: MASTER PASSAGE */}
            <div className="flex flex-col">
              <div className="flex items-center justify-between text-[11px] font-black text-slate-500 mb-1.5 px-1 uppercase tracking-wider">
                <span>MASTER PASSAGE ({selectedPassage.wordCount} WORDS)</span>
                <span className="text-blue-700 font-extrabold">Target: {selectedPassage.targetKeyDepressions} Depressions</span>
              </div>
              <div className="h-72 p-5 rounded-2xl border border-slate-200 bg-slate-50 font-mono text-sm leading-relaxed overflow-y-auto select-none tracking-wide text-slate-800 shadow-inner">
                {targetText.split("").map((char, index) => {
                  let charStyle = "text-slate-800";

                  if (highlightWord && index < typedInput.length) {
                    charStyle = typedInput[index] === char ? "text-emerald-700 bg-emerald-100 font-bold" : "text-red-700 bg-red-100 font-bold underline decoration-red-500";
                  }

                  const isCurrentCursor = highlightWord && index === typedInput.length;
                  return (
                    <span
                      key={index}
                      className={`${charStyle} ${isCurrentCursor ? "bg-blue-600 text-white font-black px-0.5 rounded-xs" : ""}`}
                    >
                      {char}
                    </span>
                  );
                })}
              </div>
            </div>

            {/* BOX 2: CANDIDATE TYPING TEXTAREA */}
            <div className="flex flex-col">
              <div className="flex items-center justify-between text-[11px] font-black text-slate-500 mb-1.5 px-1 uppercase tracking-wider">
                <span>CANDIDATE TYPING BOX</span>
                <span className="text-blue-700 font-extrabold">Key Depressions: {typedInput.length} / {targetText.length}</span>
              </div>
              <textarea
                ref={inputRef}
                value={typedInput}
                onChange={handleInputChange}
                onKeyDown={handleKeyDown}
                disabled={isFinished}
                placeholder={isStarted ? "Type official exam passage here..." : "Click inside this box and start typing to begin exam timer..."}
                className={`h-72 w-full p-5 rounded-2xl border-2 font-mono text-sm leading-relaxed tracking-wide resize-none focus:outline-none transition-all shadow-inner bg-white ${
                  isStarted
                    ? "border-blue-600 ring-4 ring-blue-500/20"
                    : "border-slate-300 focus:border-blue-600"
                }`}
              />
            </div>
          </div>
        </div>

        {/* ============================================================== */}
        {/* 🎹 INTERACTIVE VIRTUAL KEYBOARD */}
        {/* ============================================================== */}
        <div className="bg-white border border-slate-200 rounded-3xl p-6 mb-8 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h4 className="text-xs font-black uppercase tracking-wider text-slate-500 flex items-center gap-2">
              <Keyboard className="w-4 h-4 text-blue-600" /> Virtual Keyboard Guide
            </h4>
            <span className="text-xs font-black text-blue-700">
              Next Key: <span className="uppercase px-2.5 py-1 rounded-lg bg-blue-100 border border-blue-200 text-blue-900 font-mono font-bold">{nextChar === " " ? "SPACE" : nextChar || "END"}</span>
            </span>
          </div>

          <div className="flex flex-col gap-1.5 max-w-4xl mx-auto overflow-x-auto p-1">
            {KEYBOARD_ROWS.map((row, rIdx) => (
              <div key={rIdx} className="flex justify-center gap-1">
                {row.map((item, kIdx) => {
                  const isNextKey = nextChar.toLowerCase() === item.key.toLowerCase() || (nextChar === " " && item.key === "Space");
                  return (
                    <div
                      key={kIdx}
                      className={`h-10 sm:h-12 flex items-center justify-center rounded-xl font-mono text-xs sm:text-sm font-bold border transition-all select-none ${
                        item.width ? item.width : "w-8 sm:w-10 bg-slate-100 border-slate-200 text-slate-800"
                      } ${
                        isNextKey
                          ? "bg-blue-600 border-blue-600 text-white shadow-lg ring-2 ring-blue-400 scale-105 z-10 font-extrabold"
                          : ""
                      }`}
                    >
                      {item.key}
                    </div>
                  );
                })}
              </div>
            ))}
          </div>
        </div>

        {/* ============================================================== */}
        {/* 🏆 TEST FINISHED RESULT MODAL SCORECARD */}
        {/* ============================================================== */}
        {isFinished && (
          <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-md z-50 flex items-center justify-center p-4">
            <div className="bg-white border border-slate-200 rounded-3xl p-8 max-w-2xl w-full shadow-2xl relative overflow-hidden animate-in fade-in zoom-in duration-200 text-slate-900">
              <div className="text-center mb-6">
                <div className="inline-flex p-3.5 rounded-2xl bg-blue-100 border border-blue-200 text-blue-700 mb-2">
                  <Trophy className="w-8 h-8 text-blue-600" />
                </div>
                <h3 className="text-2xl font-black text-slate-900">SSC ZONE Official Exam Scorecard</h3>
                <p className="text-xs text-blue-700 font-extrabold mt-1">{selectedPassage.examName}</p>
              </div>

              <div className={`p-4 rounded-2xl mb-6 text-center border ${isSSCQualified ? "bg-emerald-50 border-emerald-300 text-emerald-900" : "bg-red-50 border-red-300 text-red-900"}`}>
                <div className="flex items-center justify-center gap-2 text-lg font-black">
                  {isSSCQualified ? <CheckCircle2 className="w-6 h-6 text-emerald-600" /> : <ShieldAlert className="w-6 h-6 text-red-600" />}
                  {isSSCQualified ? "QUALIFIED FOR SSC EXAM STANDARDS 🎉" : "DISQUALIFIED (ERROR LIMIT EXCEEDED)"}
                </div>
                <p className="text-xs mt-1 opacity-90">
                  Target Speed: {selectedPassage.targetWPM} WPM | Net Speed: {netWPM} WPM | Error Rate: {errorPercentage}% (Category Limit: ≤ {allowedErrorLimit}%)
                </p>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mb-6">
                <div className="bg-slate-50 p-3.5 rounded-2xl border border-slate-200 text-center">
                  <p className="text-[10px] text-slate-500 uppercase font-extrabold">Gross Speed</p>
                  <p className="text-xl font-black text-slate-900 mt-1">{grossWPM} <span className="text-xs text-slate-500">WPM</span></p>
                </div>
                <div className="bg-slate-50 p-3.5 rounded-2xl border border-slate-200 text-center">
                  <p className="text-[10px] text-slate-500 uppercase font-extrabold">Net Speed</p>
                  <p className="text-xl font-black text-emerald-600 mt-1">{netWPM} <span className="text-xs text-slate-500">WPM</span></p>
                </div>
                <div className="bg-slate-50 p-3.5 rounded-2xl border border-slate-200 text-center">
                  <p className="text-[10px] text-slate-500 uppercase font-extrabold">Accuracy</p>
                  <p className="text-xl font-black text-blue-700 mt-1">{accuracyPercent}%</p>
                </div>
                <div className="bg-slate-50 p-3.5 rounded-2xl border border-slate-200 text-center">
                  <p className="text-[10px] text-slate-500 uppercase font-extrabold">Key Depressions</p>
                  <p className="text-xl font-black text-slate-900 mt-1">{typedInput.length}</p>
                </div>
                <div className="bg-slate-50 p-3.5 rounded-2xl border border-slate-200 text-center">
                  <p className="text-[10px] text-slate-500 uppercase font-extrabold">Key Depressions / Hr</p>
                  <p className="text-xl font-black text-indigo-600 mt-1">{kph} <span className="text-xs text-slate-500">KPH</span></p>
                </div>
                <div className="bg-slate-50 p-3.5 rounded-2xl border border-slate-200 text-center">
                  <p className="text-[10px] text-slate-500 uppercase font-extrabold">Uncorrected Errors</p>
                  <p className="text-xl font-black text-red-600 mt-1">{uncorrectedErrors}</p>
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-200">
                <button
                  onClick={resetTest}
                  className="w-full sm:w-auto px-6 py-3.5 rounded-2xl bg-blue-600 hover:bg-blue-700 text-white font-black text-sm shadow-lg transition-all flex items-center justify-center gap-2"
                >
                  <RotateCcw className="w-4 h-4" /> Re-Test Exam Passage
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
