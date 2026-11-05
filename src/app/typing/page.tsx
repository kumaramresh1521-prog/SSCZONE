"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import {
  Keyboard,
  RotateCcw,
  CheckCircle2,
  XCircle,
  Clock,
  Zap,
  Target,
  FileText,
  Volume2,
  VolumeX,
  Trophy,
  ShieldAlert,
  BookOpen,
  ChevronDown,
  Settings2,
  Play,
  Upload,
  Info,
  Filter,
  TrendingUp,
} from "lucide-react";

// ==========================================
// 📚 DATA
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
    examName: "SSC CGL DEST",
    timeMinutes: 15,
    targetKeyDepressions: 2000,
    targetWPM: 27,
    wordCount: 136,
    title: "Administrative Efficiency & Electronic Office",
    content:
      "India is a democratic republic with a federal system of governance comprising twenty-eight states and eight union territories. Administrative efficiency in government departments depends heavily upon clear communication, structured record keeping, and timely disposal of official business. In recent years, public administration has undergone significant modernization through the adoption of electronic office systems and digital record management platforms. Employees working in government offices are expected to maintain high accuracy, typing speed, and strict confidentiality while processing official files and correspondence. Effective coordination between various ministries ensures that policy decisions are implemented seamlessly across state and district administration levels. Public servants play a pivotal role in ensuring that public welfare schemes reach the intended beneficiaries without administrative delays or procedural bottlenecks. The continuous training of administrative staff enhances organizational productivity and strengthens democratic institutions across the nation.",
  },
  {
    id: "cgl-2",
    examType: "cgl",
    examName: "SSC CGL DEST",
    timeMinutes: 15,
    targetKeyDepressions: 2010,
    targetWPM: 27,
    wordCount: 136,
    title: "Financial Governance & Direct Tax Modernization",
    content:
      "Financial integrity and transparent tax collection systems are vital pillars of national economic development. The Revenue Department has implemented comprehensive digital reforms to streamline income tax filing and electronic audit procedures. Taxpayers are provided with user-friendly online portals that facilitate seamless submission of annual tax returns and instant verification of refunds. Tax administration officials utilize advanced data analytics tools to detect tax evasion, prevent financial fraud, and ensure compliance across all corporate and commercial sectors. Promoting voluntary tax compliance through public education drives enhances national revenue collection while reducing litigation costs. Systematic recording of financial transactions and timely resolution of taxpayer grievances strengthen public trust in government financial institutions. Continuous technological upgrading across revenue offices ensures efficient tax governance and accelerates economic growth across all sectors of the economy.",
  },
  {
    id: "cgl-3",
    examType: "cgl",
    examName: "SSC CGL DEST",
    timeMinutes: 15,
    targetKeyDepressions: 2005,
    targetWPM: 27,
    wordCount: 136,
    title: "Judicial Reforms & Digital Court Management",
    content:
      "The judicial system forms an indispensable cornerstone of constitutional democracy and the rule of law in India. Modernizing court infrastructure through electronic filing platforms and virtual court hearing facilities has improved access to justice for citizens. E-Courts projects have digitized millions of court records, enabling litigants and advocates to track case status and court orders in real time. Fast-track courts and alternative dispute resolution mechanisms help reduce case pendency in district and high courts across the country. Efficient case management by judicial officers ensures timely delivery of judgments and upholds the constitutional rights of every citizen. Transparent judicial proceedings and accessible legal aid programs empower vulnerable sections of society while reinforcing faith in the legal framework. Integrating artificial intelligence tools in legal research further accelerates case disposal and modernizes court operations nationwide.",
  },
  {
    id: "chsl-en-1",
    examType: "chsl-en",
    examName: "SSC CHSL English",
    timeMinutes: 10,
    targetKeyDepressions: 1750,
    targetWPM: 35,
    wordCount: 136,
    title: "Forestry Conservation & Biodiversity Protection",
    content:
      "Environmental protection and sustainable forestry management are crucial for maintaining ecological balance and biodiversity. Forests act as natural carbon sinks, absorbing greenhouse gas emissions and regulating regional climate patterns. Deforestation caused by urban expansion, industrial development, and unsustainable agricultural practices poses a severe threat to natural habitats and wildlife species. Government agencies and non-governmental organizations have launched extensive afforestation drives to restore degraded forest lands. Community participation in forest protection has proven highly effective in preventing illegal logging and soil erosion. Preserving water resources and protecting wildlife corridors are essential components of national environmental policy. Sustainable management practices ensure that economic progress does not compromise environmental health for future generations. Scientific research and environmental awareness among citizens play a very vital role in conserving natural ecosystems and safeguarding valuable natural resources for upcoming generations as well.",
  },
  {
    id: "chsl-en-2",
    examType: "chsl-en",
    examName: "SSC CHSL English",
    timeMinutes: 10,
    targetKeyDepressions: 1755,
    targetWPM: 35,
    wordCount: 136,
    title: "Digital Banking & Unified Payments Ecosystem",
    content:
      "The expansion of digital banking services has revolutionized daily financial transactions and commercial operations across urban and rural India. Unified Payments Interface and mobile banking applications allow instant money transfers between bank accounts with utmost security. Financial inclusion drives have brought millions of unbanked citizens into the formal banking network, enabling direct benefit transfers for government subsidy schemes. Electronic payment gateways have empowered small retail business merchants to accept digital payments seamlessly. Cybersecurity measures and customer awareness campaigns are continuously updated to safeguard digital transactions against online fraud and phishing attacks. Modern banking infrastructure supports rapid economic growth by facilitating smooth fund flow across national commercial markets. Digital payment technology continues to transform everyday commerce while building a transparent and cashless national financial economy for all citizens.",
  },
  {
    id: "chsl-hi-1",
    examType: "chsl-hi",
    examName: "SSC CHSL Hindi",
    timeMinutes: 10,
    targetKeyDepressions: 1500,
    targetWPM: 30,
    wordCount: 136,
    title: "National Economic Growth & Rural Development",
    content:
      "The expansion of modern transport infrastructure is essential for economic growth and regional connectivity. Railway networks connect remote agricultural belts with major urban markets, enabling efficient movement of passengers and essential commodities. Freight corridors and modern high-speed expressways have reduced transit time and transportation costs for industrial goods. Continuous investments in track modernization, signal automation, and passenger safety remain top priorities for transport authorities. Modern seaport terminals and expanded airport facilities have boosted international trade volume and regional tourism. Efficient logistical networks encourage domestic manufacturing and attract foreign direct investment across emerging industrial corridors. Digital payment integration and automated toll collection systems have further streamlined cargo movement across state borders. Public and private partnerships in infrastructure development accelerate national economic integration and foster balanced regional development across all commercial and industrial sectors of our country today.",
  },
  {
    id: "deo-1",
    examType: "deo",
    examName: "SSC DEO High Speed",
    timeMinutes: 15,
    targetKeyDepressions: 3700,
    targetWPM: 50,
    wordCount: 250,
    title: "Industrial Growth & Export Trade",
    content:
      "Industrial growth and export competitiveness are essential drivers of sustainable economic progress in developing nations. Expanding manufacturing clusters and establishing Special Economic Zones encourage domestic production while attracting substantial foreign direct investment. Government policies focusing on ease of doing business, single-window clearances, and infrastructure development have significantly reduced operational costs for industrial enterprises. Quality certification standards and technological innovation enable domestic products to compete effectively in international trade markets. Specialized export promotion councils provide market intelligence, trade fair participation opportunities, and regulatory guidance to emerging exporters across diverse manufacturing sectors. Efficient logistics networks, modernized port terminals, and dedicated freight corridors streamline the transit of export cargo to international destinations. Continuous skill training programs for industrial workers enhance productivity and technological capabilities across key manufacturing sectors. Strengthening research and development infrastructure fosters innovation, product diversification, and high-value export growth. Transparent trade governance, robust intellectual property rights enforcement, and stable export credit facilities further boost investor confidence and national economic resilience.",
  },
];

const EXAM_FILTERS = [
  { value: "all", label: "All Exams" },
  { value: "cgl", label: "CGL DEST · 27 WPM" },
  { value: "chsl-en", label: "CHSL English · 35 WPM" },
  { value: "chsl-hi", label: "CHSL Hindi · 30 WPM" },
  { value: "deo", label: "DEO · 50 WPM" },
] as const;

const EXAM_RULES = [
  {
    exam: "SSC CGL DEST",
    color: "blue",
    rows: [
      { label: "Time", value: "15 Minutes" },
      { label: "Key Depressions", value: "2000 (≈ 400 Words)" },
      { label: "Required Speed", value: "27 WPM" },
      { label: "Error Limit (UR)", value: "5% Max" },
      { label: "Error Limit (OBC/EWS)", value: "7% Max" },
      { label: "Error Limit (SC/ST)", value: "10% Max" },
    ],
  },
  {
    exam: "SSC CHSL LDC/JSA",
    color: "emerald",
    rows: [
      { label: "English Typing", value: "1750 Depressions in 10 Min" },
      { label: "English Speed", value: "35 WPM" },
      { label: "Hindi Typing", value: "1500 Depressions in 10 Min" },
      { label: "Hindi Speed", value: "30 WPM" },
      { label: "Error Limit (UR)", value: "20% Max" },
      { label: "Error Limit (OBC/SC/ST)", value: "25–30% Max" },
    ],
  },
  {
    exam: "SSC DEO (Data Entry Operator)",
    color: "violet",
    rows: [
      { label: "Key Depressions", value: "3700–4000 in 15 Min" },
      { label: "Required Speed", value: "~50 WPM" },
      { label: "Accuracy", value: "Very High Required" },
    ],
  },
];

const KEYBOARD_ROWS = [
  ["`","1","2","3","4","5","6","7","8","9","0","-","=","⌫"],
  ["Tab","q","w","e","r","t","y","u","i","o","p","[","]"],
  ["Caps","a","s","d","f","g","h","j","k","l",";","'","↵"],
  ["Shift","z","x","c","v","b","n","m",",",".","/","Shift"],
  ["Space"],
];

const WIDE_KEYS = new Set(["Tab","Caps","Shift","⌫","↵","Space"]);

// ==========================================
// COMPONENT
// ==========================================
type TabType = "ssc" | "custom" | "rules" | "keyboard";
type FilterType = "all" | "cgl" | "chsl-en" | "chsl-hi" | "deo";
type CategoryType = "UR" | "OBC_EWS" | "SC_ST";

export default function TypingPage() {
  const [activeTab, setActiveTab] = useState<TabType>("ssc");
  const [selectedFilter, setSelectedFilter] = useState<FilterType>("all");
  const [selectedPassage, setSelectedPassage] = useState<SSCExamPassage>(REAL_SSC_PASSAGES[0]);
  const [customText, setCustomText] = useState("");
  const [customTextDraft, setCustomTextDraft] = useState("");

  // Settings
  const [category, setCategory] = useState<CategoryType>("UR");
  const [allowBackspace, setAllowBackspace] = useState(true);
  const [soundEnabled, setSoundEnabled] = useState(false);
  const [showSettings, setShowSettings] = useState(false);

  // Engine
  const [targetText, setTargetText] = useState(REAL_SSC_PASSAGES[0].content);
  const [typedInput, setTypedInput] = useState("");
  const [isStarted, setIsStarted] = useState(false);
  const [isFinished, setIsFinished] = useState(false);
  const [timeLeft, setTimeLeft] = useState(REAL_SSC_PASSAGES[0].timeMinutes * 60);
  const [totalKeys, setTotalKeys] = useState(0);
  const [backspaceCount, setBackspaceCount] = useState(0);
  const [startTime, setStartTime] = useState<number | null>(null);

  const inputRef = useRef<HTMLTextAreaElement>(null);
  const passageRef = useRef<HTMLDivElement>(null);

  // Sync target text when passage/tab changes
  useEffect(() => {
    if (activeTab === "ssc") {
      setTargetText(selectedPassage.content);
      resetTest(selectedPassage.timeMinutes * 60);
    } else if (activeTab === "custom") {
      const txt = customText || "";
      setTargetText(txt);
      resetTest(15 * 60);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeTab, selectedPassage]);

  // Countdown
  useEffect(() => {
    if (!isStarted || isFinished) return;
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
  }, [isStarted, isFinished]);

  // Auto-scroll passage to cursor
  useEffect(() => {
    if (!passageRef.current) return;
    const cursor = passageRef.current.querySelector("[data-cursor]");
    if (cursor) cursor.scrollIntoView({ block: "center", behavior: "smooth" });
  }, [typedInput.length]);

  const playSound = useCallback(
    (isError = false) => {
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
      } catch {}
    },
    [soundEnabled]
  );

  const resetTest = useCallback((duration?: number) => {
    setIsStarted(false);
    setIsFinished(false);
    setTypedInput("");
    setTotalKeys(0);
    setBackspaceCount(0);
    setStartTime(null);
    setTimeLeft(duration ?? selectedPassage.timeMinutes * 60);
    setTimeout(() => inputRef.current?.focus(), 100);
  }, [selectedPassage]);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Backspace") {
      setBackspaceCount((p) => p + 1);
      if (!allowBackspace) e.preventDefault();
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const val = e.target.value;
    if (!targetText) return;
    if (!allowBackspace && val.length < typedInput.length) return;
    if (!isStarted) {
      setIsStarted(true);
      setStartTime(Date.now());
    }
    const isCorrect = val[val.length - 1] === targetText[val.length - 1];
    if (val.length > typedInput.length) {
      playSound(!isCorrect);
      setTotalKeys((p) => p + 1);
    }
    setTypedInput(val);
    if (val.length >= targetText.length) {
      setIsFinished(true);
      setIsStarted(false);
    }
  };

  const handleLoadCustom = () => {
    const txt = customTextDraft.trim();
    if (!txt) return;
    setCustomText(txt);
    setTargetText(txt);
    resetTest(15 * 60);
  };

  // Stats
  const elapsedSeconds = isStarted && startTime
    ? Math.max(1, Math.floor((Date.now() - startTime) / 1000))
    : selectedPassage.timeMinutes * 60 - timeLeft;
  const elapsedMinutes = Math.max(0.1, elapsedSeconds / 60);
  const grossWPM = Math.round(typedInput.length / 5 / elapsedMinutes);
  let uncorrectedErrors = 0;
  for (let i = 0; i < typedInput.length; i++) {
    if (typedInput[i] !== targetText[i]) uncorrectedErrors++;
  }
  const netWPM = Math.max(0, Math.round(grossWPM - uncorrectedErrors / elapsedMinutes));
  const accuracy = typedInput.length > 0
    ? Math.max(0, Math.round(((typedInput.length - uncorrectedErrors) / typedInput.length) * 100))
    : 100;
  const kph = Math.round((typedInput.length / elapsedMinutes) * 60);
  const errorPct = typedInput.length > 0
    ? ((uncorrectedErrors / targetText.length) * 100).toFixed(1)
    : "0.0";
  const allowedError = category === "UR" ? 5 : category === "OBC_EWS" ? 7 : 10;
  const isQualified = parseFloat(errorPct) <= allowedError && netWPM >= selectedPassage.targetWPM;
  const progressPct = targetText.length > 0
    ? Math.min(100, Math.round((typedInput.length / targetText.length) * 100))
    : 0;
  const nextChar = targetText[typedInput.length] || "";
  const filteredPassages = REAL_SSC_PASSAGES.filter(
    (p) => selectedFilter === "all" || p.examType === selectedFilter
  );

  const mins = Math.floor(timeLeft / 60);
  const secs = String(timeLeft % 60).padStart(2, "0");
  const isTimeLow = timeLeft <= 60 && isStarted;

  const TABS: { id: TabType; label: string; icon: React.ReactNode }[] = [
    { id: "ssc", label: "SSC Passages", icon: <FileText className="w-4 h-4" /> },
    { id: "custom", label: "Custom Text", icon: <Upload className="w-4 h-4" /> },
    { id: "rules", label: "Exam Rules", icon: <Info className="w-4 h-4" /> },
    { id: "keyboard", label: "Keyboard Guide", icon: <Keyboard className="w-4 h-4" /> },
  ];

  return (
    <div className="min-h-screen bg-gray-50 font-sans">

      {/* ── TOP HEADER ── */}
      <header className="bg-white border-b border-gray-200 shadow-sm sticky top-0 z-30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3 flex items-center justify-between gap-4">
          {/* Brand */}
          <div className="flex items-center gap-3 shrink-0">
            <div className="w-9 h-9 rounded-xl bg-blue-600 flex items-center justify-center shadow-sm">
              <Keyboard className="w-5 h-5 text-white" />
            </div>
            <div className="hidden sm:block">
              <p className="text-[10px] text-gray-500 font-semibold uppercase tracking-wider">SSC Zone</p>
              <h1 className="text-sm font-black text-gray-900 leading-none">Typing Test Console</h1>
            </div>
          </div>

          {/* Timer */}
          <div className={`flex items-center gap-2 px-4 py-2 rounded-xl border font-mono font-black text-lg ${
            isTimeLow
              ? "bg-red-50 border-red-300 text-red-600 animate-pulse"
              : isStarted
              ? "bg-blue-50 border-blue-300 text-blue-700"
              : "bg-gray-100 border-gray-200 text-gray-700"
          }`}>
            <Clock className="w-4 h-4 shrink-0" />
            {mins}:{secs}
          </div>

          {/* Live WPM pill */}
          {isStarted && (
            <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-700 text-sm font-black">
              <Zap className="w-4 h-4" />
              {netWPM} WPM
            </div>
          )}

          {/* Controls */}
          <div className="flex items-center gap-2 ml-auto">
            <button
              onClick={() => setSoundEnabled((v) => !v)}
              className="p-2 rounded-xl border border-gray-200 bg-white hover:bg-gray-50 text-gray-500 transition-colors"
              title={soundEnabled ? "Mute sounds" : "Enable sounds"}
            >
              {soundEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
            </button>
            <button
              onClick={() => setShowSettings((v) => !v)}
              className={`p-2 rounded-xl border transition-colors ${showSettings ? "bg-blue-600 border-blue-600 text-white" : "border-gray-200 bg-white hover:bg-gray-50 text-gray-500"}`}
            >
              <Settings2 className="w-4 h-4" />
            </button>
            <button
              onClick={() => resetTest()}
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold transition-colors shadow-sm"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              Reset
            </button>
          </div>
        </div>

        {/* Settings drawer */}
        {showSettings && (
          <div className="border-t border-gray-100 bg-gray-50 px-4 sm:px-6 py-3">
            <div className="max-w-7xl mx-auto flex flex-wrap gap-4 items-center text-sm">
              <div className="flex items-center gap-2">
                <label className="text-xs font-semibold text-gray-600">Category:</label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value as CategoryType)}
                  className="border border-gray-300 rounded-lg px-2 py-1 text-xs font-semibold text-gray-800 bg-white focus:outline-none focus:ring-2 focus:ring-blue-400"
                >
                  <option value="UR">UR / General (5% limit)</option>
                  <option value="OBC_EWS">OBC / EWS (7% limit)</option>
                  <option value="SC_ST">SC / ST / PwD (10% limit)</option>
                </select>
              </div>
              <label className="flex items-center gap-2 cursor-pointer select-none">
                <div
                  onClick={() => setAllowBackspace((v) => !v)}
                  className={`w-10 h-5 rounded-full transition-colors relative ${allowBackspace ? "bg-blue-600" : "bg-gray-300"}`}
                >
                  <span className={`absolute top-0.5 w-4 h-4 bg-white rounded-full shadow transition-transform ${allowBackspace ? "translate-x-5" : "translate-x-0.5"}`} />
                </div>
                <span className="text-xs font-semibold text-gray-700">Allow Backspace</span>
              </label>
            </div>
          </div>
        )}
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-6 space-y-5">

        {/* ── TAB BAR ── */}
        <div className="flex gap-1 p-1 bg-white border border-gray-200 rounded-2xl shadow-sm w-fit">
          {TABS.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                activeTab === tab.id
                  ? "bg-blue-600 text-white shadow-sm"
                  : "text-gray-600 hover:bg-gray-100"
              }`}
            >
              {tab.icon}
              <span className="hidden sm:inline">{tab.label}</span>
            </button>
          ))}
        </div>

        {/* ════════════════════════════════════════════
            TAB: SSC PASSAGES
        ════════════════════════════════════════════ */}
        {activeTab === "ssc" && (
          <div className="bg-white border border-gray-200 rounded-2xl shadow-sm overflow-hidden">
            {/* Filter bar */}
            <div className="px-5 pt-4 pb-3 border-b border-gray-100 flex flex-wrap items-center gap-2">
              <Filter className="w-4 h-4 text-gray-400 shrink-0" />
              {EXAM_FILTERS.map((f) => (
                <button
                  key={f.value}
                  onClick={() => setSelectedFilter(f.value as FilterType)}
                  className={`px-3 py-1 rounded-lg text-xs font-bold transition-all ${
                    selectedFilter === f.value
                      ? "bg-blue-600 text-white"
                      : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                  }`}
                >
                  {f.label}
                </button>
              ))}
            </div>

            {/* Passage cards */}
            <div className="p-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
              {filteredPassages.map((p) => (
                <button
                  key={p.id}
                  onClick={() => setSelectedPassage(p)}
                  className={`text-left p-4 rounded-xl border transition-all ${
                    selectedPassage.id === p.id
                      ? "bg-blue-50 border-blue-500 ring-2 ring-blue-500/20"
                      : "bg-gray-50 border-gray-200 hover:border-blue-300 hover:bg-blue-50/40"
                  }`}
                >
                  <span className={`inline-block text-[10px] font-black uppercase px-2 py-0.5 rounded-full mb-2 ${
                    p.examType === "cgl" ? "bg-blue-100 text-blue-700"
                    : p.examType === "chsl-en" ? "bg-emerald-100 text-emerald-700"
                    : p.examType === "chsl-hi" ? "bg-orange-100 text-orange-700"
                    : "bg-violet-100 text-violet-700"
                  }`}>
                    {p.examName}
                  </span>
                  <p className="text-xs font-bold text-gray-900 leading-snug mb-2">{p.title}</p>
                  <div className="flex items-center gap-2 text-[10px] text-gray-500 font-semibold">
                    <span>{p.targetKeyDepressions} Keys</span>
                    <span>·</span>
                    <span>{p.targetWPM} WPM</span>
                    <span>·</span>
                    <span>{p.timeMinutes}m</span>
                  </div>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* ════════════════════════════════════════════
            TAB: CUSTOM TEXT
        ════════════════════════════════════════════ */}
        {activeTab === "custom" && (
          <div className="bg-white border border-gray-200 rounded-2xl shadow-sm p-5">
            <h2 className="text-sm font-black text-gray-800 mb-1 flex items-center gap-2">
              <Upload className="w-4 h-4 text-blue-600" /> Custom Passage Practice
            </h2>
            <p className="text-xs text-gray-500 mb-4">
              Paste any paragraph below and click <strong>Load</strong> to start typing practice on it.
            </p>
            <textarea
              value={customTextDraft}
              onChange={(e) => setCustomTextDraft(e.target.value)}
              placeholder="Paste your custom paragraph here (news articles, government notifications, etc.)..."
              className="w-full h-36 p-4 rounded-xl border border-gray-300 font-mono text-xs focus:outline-none focus:ring-2 focus:ring-blue-400 resize-none bg-gray-50"
            />
            <div className="flex items-center justify-between mt-3">
              <span className="text-xs text-gray-400">{customTextDraft.length} characters</span>
              <button
                onClick={handleLoadCustom}
                disabled={!customTextDraft.trim()}
                className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 disabled:opacity-40 disabled:cursor-not-allowed text-white text-xs font-bold transition-colors shadow-sm"
              >
                <Play className="w-3.5 h-3.5" /> Load & Start
              </button>
            </div>
          </div>
        )}

        {/* ════════════════════════════════════════════
            TAB: EXAM RULES
        ════════════════════════════════════════════ */}
        {activeTab === "rules" && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {EXAM_RULES.map((rule) => (
              <div key={rule.exam} className="bg-white border border-gray-200 rounded-2xl shadow-sm p-5">
                <h3 className={`text-sm font-black mb-4 ${
                  rule.color === "blue" ? "text-blue-700"
                  : rule.color === "emerald" ? "text-emerald-700"
                  : "text-violet-700"
                }`}>
                  {rule.exam}
                </h3>
                <table className="w-full text-xs">
                  <tbody className="divide-y divide-gray-100">
                    {rule.rows.map((row) => (
                      <tr key={row.label}>
                        <td className="py-1.5 text-gray-500 font-medium pr-2">{row.label}</td>
                        <td className="py-1.5 text-gray-900 font-bold text-right">{row.value}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ))}

            {/* Formula card */}
            <div className="md:col-span-3 bg-blue-50 border border-blue-200 rounded-2xl p-5">
              <h3 className="text-sm font-black text-blue-800 mb-3 flex items-center gap-2">
                <TrendingUp className="w-4 h-4" /> Speed Calculation Formulas
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
                <div className="bg-white rounded-xl p-3 border border-blue-100">
                  <p className="font-black text-gray-700 mb-1">Gross Speed (WPM)</p>
                  <p className="font-mono text-blue-700 font-bold">Total Keys Typed ÷ 5 ÷ Time (min)</p>
                </div>
                <div className="bg-white rounded-xl p-3 border border-blue-100">
                  <p className="font-black text-gray-700 mb-1">Net Speed (WPM)</p>
                  <p className="font-mono text-blue-700 font-bold">Gross WPM − (Errors ÷ Time)</p>
                </div>
                <div className="bg-white rounded-xl p-3 border border-blue-100">
                  <p className="font-black text-gray-700 mb-1">1 Word = 5 Key Depressions</p>
                  <p className="font-mono text-blue-700 font-bold">KPH = Keys/min × 60</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ════════════════════════════════════════════
            TAB: KEYBOARD GUIDE
        ════════════════════════════════════════════ */}
        {activeTab === "keyboard" && (
          <div className="bg-white border border-gray-200 rounded-2xl shadow-sm p-6">
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-sm font-black text-gray-800 flex items-center gap-2">
                <Keyboard className="w-4 h-4 text-blue-600" /> Virtual Keyboard
              </h2>
              {nextChar && (
                <div className="flex items-center gap-2 text-xs font-bold text-gray-700">
                  Next key:
                  <span className="px-2.5 py-1 bg-blue-600 text-white rounded-lg font-mono uppercase">
                    {nextChar === " " ? "SPACE" : nextChar}
                  </span>
                </div>
              )}
            </div>

            <div className="flex flex-col gap-1.5 max-w-3xl mx-auto overflow-x-auto pb-2">
              {KEYBOARD_ROWS.map((row, rIdx) => (
                <div key={rIdx} className="flex justify-center gap-1">
                  {row.map((key, kIdx) => {
                    const isNext =
                      nextChar.toLowerCase() === key.toLowerCase() ||
                      (nextChar === " " && key === "Space");
                    const isWide = WIDE_KEYS.has(key);
                    return (
                      <div
                        key={kIdx}
                        className={`flex items-center justify-center rounded-lg border text-xs font-bold select-none transition-all h-10 ${
                          isWide ? "px-3 min-w-[52px]" : "w-9"
                        } ${
                          isNext
                            ? "bg-blue-600 border-blue-500 text-white scale-105 shadow-md z-10"
                            : key === "Space"
                            ? "flex-1 max-w-xs bg-gray-100 border-gray-300 text-gray-600"
                            : WIDE_KEYS.has(key)
                            ? "bg-gray-200 border-gray-300 text-gray-700"
                            : "bg-white border-gray-300 text-gray-800 shadow-[0_2px_0_rgba(0,0,0,0.12)]"
                        }`}
                      >
                        {key}
                      </div>
                    );
                  })}
                </div>
              ))}
            </div>

            <p className="text-center text-xs text-gray-400 mt-4">
              Blue key = your next character to type. Switch to the main test to practice live.
            </p>
          </div>
        )}

        {/* ════════════════════════════════════════════
            LIVE STATS BAR
        ════════════════════════════════════════════ */}
        {(activeTab === "ssc" || activeTab === "custom") && (
          <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-6 gap-3">
            {[
              {
                label: "Key Depressions",
                value: `${typedInput.length}`,
                sub: `/ ${activeTab === "ssc" ? selectedPassage.targetKeyDepressions : (targetText.length || "—")}`,
                color: "blue",
              },
              {
                label: "Net Speed",
                value: isStarted ? `${netWPM}` : "—",
                sub: `WPM (target ≥ ${activeTab === "ssc" ? selectedPassage.targetWPM : "—"})`,
                color: netWPM >= (selectedPassage.targetWPM) && isStarted ? "emerald" : "gray",
              },
              {
                label: "Gross Speed",
                value: isStarted ? `${grossWPM}` : "—",
                sub: "WPM raw",
                color: "gray",
              },
              {
                label: "Accuracy",
                value: `${accuracy}%`,
                sub: `${uncorrectedErrors} errors`,
                color: accuracy >= 95 ? "emerald" : accuracy >= 85 ? "amber" : "red",
              },
              {
                label: "KPH",
                value: isStarted ? `${kph}` : "—",
                sub: "keystrokes/hr",
                color: "violet",
              },
              {
                label: "Progress",
                value: `${progressPct}%`,
                sub: `${typedInput.length} / ${targetText.length} chars`,
                color: "blue",
              },
            ].map((stat) => (
              <div key={stat.label} className="bg-white border border-gray-200 rounded-xl p-4 shadow-sm">
                <p className="text-[10px] font-bold uppercase tracking-wider text-gray-400 mb-1">{stat.label}</p>
                <p className={`text-xl font-black leading-none ${
                  stat.color === "emerald" ? "text-emerald-600"
                  : stat.color === "red" ? "text-red-500"
                  : stat.color === "amber" ? "text-amber-500"
                  : stat.color === "violet" ? "text-violet-600"
                  : stat.color === "blue" ? "text-blue-600"
                  : "text-gray-800"
                }`}>
                  {stat.value}
                </p>
                <p className="text-[10px] text-gray-400 mt-1 font-medium truncate">{stat.sub}</p>
              </div>
            ))}
          </div>
        )}

        {/* ════════════════════════════════════════════
            TYPING CONSOLE (2-pane)
        ════════════════════════════════════════════ */}
        {(activeTab === "ssc" || activeTab === "custom") && targetText && (
          <div className="bg-white border border-gray-200 rounded-2xl shadow-sm overflow-hidden">
            {/* Console header */}
            <div className="px-5 py-3 border-b border-gray-100 flex items-center justify-between flex-wrap gap-2">
              <div className="flex items-center gap-2">
                <FileText className="w-4 h-4 text-blue-600 shrink-0" />
                <span className="text-xs font-bold text-gray-700 truncate max-w-sm">
                  {activeTab === "ssc" ? selectedPassage.title : "Custom Passage"}
                </span>
              </div>
              {/* Progress bar */}
              <div className="flex items-center gap-3 ml-auto">
                <div className="hidden sm:flex items-center gap-2">
                  <div className="w-32 h-1.5 bg-gray-100 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-blue-600 rounded-full transition-all duration-300"
                      style={{ width: `${progressPct}%` }}
                    />
                  </div>
                  <span className="text-xs font-bold text-gray-500">{progressPct}%</span>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-0 divide-y lg:divide-y-0 lg:divide-x divide-gray-100">
              {/* Pane 1: Reference passage */}
              <div className="p-5 flex flex-col gap-2">
                <div className="flex items-center justify-between">
                  <p className="text-[10px] font-black uppercase tracking-wider text-gray-400">Reference Passage</p>
                  {activeTab === "ssc" && (
                    <span className="text-[10px] font-bold text-gray-400">
                      {selectedPassage.wordCount} words · {selectedPassage.targetKeyDepressions} depressions
                    </span>
                  )}
                </div>
                <div
                  ref={passageRef}
                  className="h-64 overflow-y-auto p-4 rounded-xl bg-gray-50 border border-gray-200 font-mono text-sm leading-loose select-none tracking-wide"
                >
                  {targetText.split("").map((char, i) => {
                    const isTyped = i < typedInput.length;
                    const isCorrect = isTyped && typedInput[i] === char;
                    const isError = isTyped && typedInput[i] !== char;
                    const isCursor = i === typedInput.length;
                    return (
                      <span
                        key={i}
                        data-cursor={isCursor ? true : undefined}
                        className={
                          isCursor
                            ? "bg-blue-600 text-white rounded-sm"
                            : isCorrect
                            ? "text-gray-400"
                            : isError
                            ? "text-red-500 bg-red-100 rounded-sm"
                            : "text-gray-800"
                        }
                      >
                        {char}
                      </span>
                    );
                  })}
                </div>
              </div>

              {/* Pane 2: Typing area */}
              <div className="p-5 flex flex-col gap-2">
                <div className="flex items-center justify-between">
                  <p className="text-[10px] font-black uppercase tracking-wider text-gray-400">Your Typing Area</p>
                  <span className="text-[10px] font-bold text-gray-400">
                    {typedInput.length} / {targetText.length} chars
                  </span>
                </div>
                <textarea
                  ref={inputRef}
                  value={typedInput}
                  onChange={handleInputChange}
                  onKeyDown={handleKeyDown}
                  disabled={isFinished}
                  autoFocus
                  placeholder={
                    isStarted
                      ? "Keep typing..."
                      : "Click here and start typing to begin the exam timer..."
                  }
                  className={`h-64 w-full p-4 rounded-xl border-2 font-mono text-sm leading-loose tracking-wide resize-none focus:outline-none transition-all bg-white ${
                    isFinished
                      ? "border-gray-200 opacity-60 cursor-not-allowed"
                      : isStarted
                      ? "border-blue-500 ring-2 ring-blue-400/20"
                      : "border-gray-300 focus:border-blue-400"
                  }`}
                />
                {!isStarted && !isFinished && (
                  <p className="text-[10px] text-gray-400 text-center font-medium">
                    ⏱ Timer starts automatically when you begin typing
                  </p>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Empty state for custom tab with no text loaded */}
        {activeTab === "custom" && !targetText && (
          <div className="bg-white border border-dashed border-gray-300 rounded-2xl p-12 text-center">
            <Upload className="w-10 h-10 text-gray-300 mx-auto mb-3" />
            <p className="text-sm font-bold text-gray-500">Paste your passage above and click Load & Start</p>
          </div>
        )}

      </main>

      {/* ════════════════════════════════════════════
          RESULT MODAL
      ════════════════════════════════════════════ */}
      {isFinished && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-lg p-7 relative animate-in fade-in zoom-in duration-200">

            {/* Badge */}
            <div className={`flex items-center justify-center gap-2 py-2.5 px-4 rounded-2xl mb-5 text-sm font-black ${
              isQualified
                ? "bg-emerald-50 border border-emerald-300 text-emerald-800"
                : "bg-red-50 border border-red-300 text-red-800"
            }`}>
              {isQualified
                ? <><CheckCircle2 className="w-5 h-5 text-emerald-600" /> QUALIFIED — SSC Standards Met 🎉</>
                : <><ShieldAlert className="w-5 h-5 text-red-500" /> NOT QUALIFIED — Below Required Standard</>
              }
            </div>

            <div className="text-center mb-5">
              <div className="inline-flex p-3 rounded-2xl bg-blue-50 mb-3">
                <Trophy className="w-8 h-8 text-blue-600" />
              </div>
              <h3 className="text-xl font-black text-gray-900">Exam Scorecard</h3>
              <p className="text-xs text-gray-500 mt-1">
                {activeTab === "ssc" ? selectedPassage.examName : "Custom Passage"}
              </p>
            </div>

            <div className="grid grid-cols-3 gap-3 mb-5">
              {[
                { label: "Net Speed", value: `${netWPM} WPM`, accent: "text-blue-600" },
                { label: "Gross Speed", value: `${grossWPM} WPM`, accent: "text-gray-700" },
                { label: "Accuracy", value: `${accuracy}%`, accent: accuracy >= 95 ? "text-emerald-600" : "text-amber-600" },
                { label: "Key Depressions", value: `${typedInput.length}`, accent: "text-gray-700" },
                { label: "KPH", value: `${kph}`, accent: "text-violet-600" },
                { label: "Errors", value: `${uncorrectedErrors} (${errorPct}%)`, accent: "text-red-500" },
              ].map((s) => (
                <div key={s.label} className="bg-gray-50 border border-gray-200 rounded-xl p-3 text-center">
                  <p className="text-[10px] text-gray-400 font-bold uppercase mb-1">{s.label}</p>
                  <p className={`text-base font-black ${s.accent}`}>{s.value}</p>
                </div>
              ))}
            </div>

            {activeTab === "ssc" && (
              <div className="text-xs text-gray-500 text-center mb-5">
                Required: ≥ <strong>{selectedPassage.targetWPM} WPM</strong> · Error limit: ≤ <strong>{allowedError}%</strong> ({category})
              </div>
            )}

            <button
              onClick={() => resetTest()}
              className="w-full py-3 rounded-2xl bg-blue-600 hover:bg-blue-700 text-white font-black text-sm transition-colors shadow-md flex items-center justify-center gap-2"
            >
              <RotateCcw className="w-4 h-4" /> Try Again
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
