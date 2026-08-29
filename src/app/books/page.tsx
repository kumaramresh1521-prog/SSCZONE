"use client";

import { useState, useMemo, useEffect } from "react";
import Link from "next/link";
import {
  BookOpen,
  Search,
  Download,
  Eye,
  Star,
  Bookmark,
  ChevronRight,
  X,
  FileText,
  Layers,
  Sparkles,
  ArrowRight,
  BookMarked,
  CheckCircle2
} from "lucide-react";

// --- DATA TYPES ---
export interface BookItem {
  id: string;
  title: string;
  hindiTitle?: string;
  author: string;
  publisher: string;
  edition: string;
  subject: "Quantitative Aptitude" | "English Language" | "Reasoning Ability" | "General Awareness" | "PYQ Compilations";
  exams: string[];
  language: "Bilingual" | "English" | "Hindi";
  pages: number;
  rating: number;
  reviewCount: number;
  badge?: string;
  coverImage?: string; // Image URL/Path - user can easily drop their image here
  coverColor: string; // Elegant clean placeholder color
  description: string;
  topperNote?: string;
  freePdfAvailable: boolean;
  sampleChapters: { title: string; pages: string; highYield?: boolean }[];
  practiceTopicSlug?: string;
}

// --- CURATED TOPPER BOOKS DATASET ---
const BOOKS_DATA: BookItem[] = [
  {
    id: "maths-ssczone-6800",
    title: "SSC Zone Master Mathematics 6800+ TCS MCQs",
    hindiTitle: "एसएससी जोन मैथ्स 6800+ टीसीएस प्रश्न",
    author: "SSC Zone Math Team",
    publisher: "SSC Zone Publications",
    edition: "6th Edition (2025-26 TCS Pattern)",
    subject: "Quantitative Aptitude",
    exams: ["SSC CGL", "SSC CHSL", "SSC CPO", "SSC MTS", "SSC GD"],
    language: "Bilingual",
    pages: 940,
    rating: 4.9,
    reviewCount: 4820,
    badge: "Topper's #1 Choice",
    coverColor: "from-blue-600 to-indigo-800",
    description: "Complete TCS arithmetic and advance maths questions categorized type-wise with smart shortcut solutions and formula summaries.",
    topperNote: "Must-solve book for scoring 45+ out of 50 in CGL Tier-1 and full accuracy in Tier-2.",
    freePdfAvailable: true,
    practiceTopicSlug: "percentage",
    sampleChapters: [
      { title: "Number System, Divisibility & Remainder Theorem", pages: "1-42", highYield: true },
      { title: "Percentage & Multiplicative Factor Shortcuts", pages: "43-85", highYield: true },
      { title: "Profit, Loss & Discount Type-wise Questions", pages: "86-130", highYield: true },
      { title: "Algebra & Algebraic Identities", pages: "131-180", highYield: true },
      { title: "Geometry & Mensuration 2D/3D Theorems", pages: "181-260", highYield: true },
      { title: "Trigonometry, Heights & Distances", pages: "261-310", highYield: true }
    ]
  },
  {
    id: "english-black-book-vocab",
    title: "Black Book of English Vocabulary",
    hindiTitle: "ब्लैक बुक ऑफ इंग्लिश वोकैबुलरी",
    author: "Nikhil Gupta",
    publisher: "Gupta Publications",
    edition: "2025-2026 Revised Edition",
    subject: "English Language",
    exams: ["SSC CGL", "SSC CHSL", "SSC CPO", "SSC Steno", "SSC MTS"],
    language: "Bilingual",
    pages: 580,
    rating: 4.9,
    reviewCount: 6150,
    badge: "Most Popular",
    coverColor: "from-gray-900 to-slate-950",
    description: "Contains all 15,000+ One Word Substitutions, Idioms, Synonyms, Antonyms, and Spelling errors arranged by highest repetition frequency.",
    topperNote: "Completing just the 'Top 500 Most Repeated' sets covers 85% of SSC exam vocabulary questions.",
    freePdfAvailable: true,
    sampleChapters: [
      { title: "Top 500 Most Repeated One Word Substitutions", pages: "1-55", highYield: true },
      { title: "Top 500 Most Repeated Idioms & Phrases", pages: "56-110", highYield: true },
      { title: "TCS Most Asked Synonyms & Antonyms (With Hindi Meaning)", pages: "111-190", highYield: true },
      { title: "Frequently Misspelt Words & Confusing Words List", pages: "191-230", highYield: false },
      { title: "Root Words Method for Rapid Vocabulary Acquisition", pages: "231-280", highYield: true }
    ]
  },
  {
    id: "english-neetu-singh-vol1",
    title: "English For General Competitions (Vol 1 - Grammar)",
    hindiTitle: "एसएससी जोन इंग्लिश ग्रामर (Vol 1)",
    author: "SSC Zone English Team",
    publisher: "SSC Zone Publications",
    edition: "Latest Edition 2025",
    subject: "English Language",
    exams: ["SSC CGL", "SSC CHSL", "SSC CPO", "SSC GD", "SSC MTS"],
    language: "Bilingual",
    pages: 490,
    rating: 4.8,
    reviewCount: 5400,
    badge: "Core Foundation",
    coverColor: "from-emerald-700 to-teal-900",
    description: "The gold standard for mastering English Grammar rules explained in simple Hindi-English conversational language with spot-the-error exercises.",
    topperNote: "Essential for Hindi medium & vernacular background students to build rock-solid grammar clarity.",
    freePdfAvailable: true,
    sampleChapters: [
      { title: "Verb (Basic to Advance Rules & Non-Finites)", pages: "1-38", highYield: true },
      { title: "Tenses & Conditional Sentences", pages: "39-74", highYield: true },
      { title: "Subject-Verb Agreement Rules", pages: "75-102", highYield: true },
      { title: "Active & Passive Voice Transformation", pages: "103-145", highYield: true },
      { title: "Direct and Indirect Speech (Narration)", pages: "146-190", highYield: true }
    ]
  },
  {
    id: "reasoning-ssczone-7200",
    title: "SSC Zone Master Reasoning 7200+ TCS MCQs",
    hindiTitle: "एसएससी जोन रीजनिंग 7200+ टीसीएस प्रश्न",
    author: "SSC Zone Editorial Board",
    publisher: "SSC Zone Publications",
    edition: "5th Edition (2025 Pattern)",
    subject: "Reasoning Ability",
    exams: ["SSC CGL", "SSC CHSL", "SSC CPO", "SSC MTS", "SSC GD", "SSC Steno"],
    language: "Bilingual",
    pages: 720,
    rating: 4.8,
    reviewCount: 3900,
    badge: "Full Score Blueprint",
    coverColor: "from-purple-700 to-indigo-900",
    description: "Complete TCS chapter-wise question bank covering Analogies, Syllogisms, Number Series, Coding-Decoding, and tricky Non-Verbal patterns.",
    topperNote: "Contains all the tough logical pattern shifts introduced in recent CGL Tier 1 & 2 exams.",
    freePdfAvailable: true,
    sampleChapters: [
      { title: "Analogy & Semantic Classification", pages: "1-48", highYield: true },
      { title: "Coding-Decoding & Number Series Patterns", pages: "49-112", highYield: true },
      { title: "Syllogism (100-50 & Venn Diagram Methods)", pages: "113-160", highYield: true },
      { title: "Blood Relations & Coded Hierarchy", pages: "161-198", highYield: false },
      { title: "Non-Verbal Paper Folding, Cutting & Mirror Images", pages: "199-245", highYield: true }
    ]
  },
  {
    id: "gs-lucents-gk",
    title: "Lucent's General Knowledge (Static GK Core)",
    hindiTitle: "ल्यूसेंट सामान्य ज्ञान (सामान्य अध्ययन)",
    author: "Dr. Binay Karna & R.P. Suman",
    publisher: "Lucent Publications",
    edition: "2025 Latest Edition",
    subject: "General Awareness",
    exams: ["SSC CGL", "SSC CHSL", "SSC CPO", "SSC MTS", "SSC GD", "State Exams"],
    language: "Bilingual",
    pages: 440,
    rating: 4.7,
    reviewCount: 8900,
    badge: "Evergreen Classic",
    coverColor: "from-amber-600 to-yellow-700",
    description: "The classic concise reference for Indian History, Polity, Geography, Indian Economy, and General Science for all competitive exams.",
    topperNote: "Best for quick revision of static facts, constitutional articles, and scientific terms.",
    freePdfAvailable: true,
    sampleChapters: [
      { title: "Indian Polity: Constitution, Articles & Amendments", pages: "1-62", highYield: true },
      { title: "Ancient, Medieval & Modern Indian History", pages: "63-134", highYield: true },
      { title: "Indian & World Geography Key Facts", pages: "135-198", highYield: true },
      { title: "General Science (Physics, Chemistry, Biology Highlights)", pages: "199-280", highYield: true },
      { title: "Static GK (Dances, Temples, Awards, Sports)", pages: "281-340", highYield: true }
    ]
  },
  {
    id: "gs-ssczone-6500",
    title: "SSC Zone General Studies 6500+ TCS MCQs",
    hindiTitle: "एसएससी जोन सामान्य अध्ययन 6500+ प्रश्न",
    author: "SSC Zone Editorial Board",
    publisher: "SSC Zone Publications",
    edition: "6th Edition (TCS Pattern 2025)",
    subject: "General Awareness",
    exams: ["SSC CGL", "SSC CHSL", "SSC CPO", "SSC MTS", "SSC GD"],
    language: "Bilingual",
    pages: 820,
    rating: 4.8,
    reviewCount: 4200,
    badge: "TCS Trendsetter",
    coverColor: "from-rose-700 to-red-900",
    description: "Detailed topic-wise TCS questions on Classical Dances, Musical Instruments, Census 2011, Articles, Schemes, and modern Science questions.",
    topperNote: "The 4 options explanation gives you 4 extra facts per question, making revision comprehensive.",
    freePdfAvailable: true,
    sampleChapters: [
      { title: "Art & Culture: Classical Dances, Instruments & Gharanas", pages: "1-70", highYield: true },
      { title: "Indian Polity: Articles, Fundamental Rights & Panchayats", pages: "71-140", highYield: true },
      { title: "Modern History: Freedom Struggle & Important Acts", pages: "141-210", highYield: true },
      { title: "Census 2011 & Key Economic Terms", pages: "211-255", highYield: true },
      { title: "Vitamins, Human Diseases & Chemistry in Daily Life", pages: "256-320", highYield: true }
    ]
  },
  {
    id: "maths-ssczone-7300",
    title: "SSC Zone Mathematics 7300+ Concept & Shortcuts",
    hindiTitle: "एसएससी जोन 7300+ गणित",
    author: "SSC Zone Math Team",
    publisher: "SSC Zone Publications",
    edition: "Solved Edition",
    subject: "Quantitative Aptitude",
    exams: ["SSC CGL", "SSC CHSL", "SSC CPO"],
    language: "Bilingual",
    pages: 880,
    rating: 4.7,
    reviewCount: 5120,
    badge: "Concept & Tricks",
    coverColor: "from-cyan-700 to-blue-900",
    description: "Celebrated for innovative short tricks and visual methods for Time & Work, Compound Interest, and Advance Geometry.",
    topperNote: "Excellent for building speed without pen-and-paper reliance for standard arithmetic sums.",
    freePdfAvailable: true,
    sampleChapters: [
      { title: "Time and Work & Pipe Cistern Unitary Methods", pages: "1-60", highYield: true },
      { title: "Compound Interest & Simple Interest Ratio Method", pages: "61-120", highYield: true },
      { title: "Time, Speed & Distance Train Relative Speed", pages: "121-175", highYield: true },
      { title: "Advance Trigonometry Value-Putting Techniques", pages: "176-230", highYield: true }
    ]
  },
  {
    id: "pyq-ssczone-cgl",
    title: "SSC Zone CGL Shift-wise Solved PYQ Papers",
    hindiTitle: "एसएससी जोन सीजीएल सॉल्व्ड पेपर्स",
    author: "SSC Zone Editorial Team",
    publisher: "SSC Zone Publications",
    edition: "2025-2026 Edition",
    subject: "PYQ Compilations",
    exams: ["SSC CGL", "SSC CHSL"],
    language: "Bilingual",
    pages: 1100,
    rating: 4.8,
    reviewCount: 6800,
    badge: "Real Exam Mocks",
    coverColor: "from-teal-700 to-emerald-900",
    description: "Complete shift-wise 100-question actual exam papers with step-by-step solutions and historical cutoff benchmarks.",
    topperNote: "Ideal for final 30-day exam simulation and time-management practice.",
    freePdfAvailable: true,
    sampleChapters: [
      { title: "SSC CGL 2024 Tier-1 Official Shift Papers (Sets 1-10)", pages: "1-120", highYield: true },
      { title: "SSC CGL 2023 Tier-2 Mains High Difficulty Papers", pages: "121-220", highYield: true },
      { title: "Shift-wise Cutoff Analysis & Safe Attempt Guide", pages: "221-240", highYield: false }
    ]
  }
];

// --- FREE REVISION NOTES & CHEAT SHEETS ---
const FREE_NOTES = [
  {
    id: "note-1",
    title: "Advance Maths: 120 Essential Formulas & Theorems Sheet",
    subject: "Maths",
    pages: "18 Pages",
    size: "3.8 MB",
    badge: "PDF"
  },
  {
    id: "note-2",
    title: "English: 1000 Most Repeated One Word Substitutions & Idioms",
    subject: "English",
    pages: "24 Pages",
    size: "2.9 MB",
    badge: "PDF"
  },
  {
    id: "note-3",
    title: "Static GK: 50 High-Frequency Tables (Dances, Articles, Gharanas)",
    subject: "General Awareness",
    pages: "32 Pages",
    size: "4.5 MB",
    badge: "PDF"
  },
  {
    id: "note-4",
    title: "Reasoning: Non-Verbal & Missing Number Logic Formulas",
    subject: "Reasoning",
    pages: "14 Pages",
    size: "2.4 MB",
    badge: "PDF"
  }
];

export default function BooksPage() {
  const [selectedSubject, setSelectedSubject] = useState<string>("All");
  const [selectedExam, setSelectedExam] = useState<string>("All");
  const [selectedMedium, setSelectedMedium] = useState<string>("All");
  const [searchQuery, setSearchQuery] = useState<string>("");
  
  // Active Book for Drawer Modal
  const [activeBook, setActiveBook] = useState<BookItem | null>(null);
  
  // Bookmark / Desk list
  const [savedBooks, setSavedBooks] = useState<string[]>([]);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  useEffect(() => {
    try {
      const saved = localStorage.getItem("ssczone_saved_books");
      if (saved) setSavedBooks(JSON.parse(saved));
    } catch (e) {}
  }, []);

  const toggleSaveBook = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setSavedBooks((prev) => {
      let updated: string[];
      if (prev.includes(id)) {
        updated = prev.filter((item) => item !== id);
        triggerToast("Removed from your saved books list.");
      } else {
        updated = [...prev, id];
        triggerToast("Saved to your reading list! 📚");
      }
      localStorage.setItem("ssczone_saved_books", JSON.stringify(updated));
      return updated;
    });
  };

  const triggerToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  const filteredBooks = useMemo(() => {
    return BOOKS_DATA.filter((b) => {
      const matchSubject =
        selectedSubject === "All" ||
        b.subject === selectedSubject ||
        (selectedSubject === "Quantitative Aptitude" && b.subject === "Quantitative Aptitude") ||
        (selectedSubject === "English Language" && b.subject === "English Language") ||
        (selectedSubject === "Reasoning Ability" && b.subject === "Reasoning Ability") ||
        (selectedSubject === "General Awareness" && b.subject === "General Awareness") ||
        (selectedSubject === "PYQ Compilations" && b.subject === "PYQ Compilations");

      const matchExam = selectedExam === "All" || b.exams.includes(selectedExam);
      const matchMedium = selectedMedium === "All" || b.language.toLowerCase() === selectedMedium.toLowerCase();
      const matchSearch =
        searchQuery.trim() === "" ||
        b.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (b.hindiTitle && b.hindiTitle.toLowerCase().includes(searchQuery.toLowerCase())) ||
        b.author.toLowerCase().includes(searchQuery.toLowerCase()) ||
        b.description.toLowerCase().includes(searchQuery.toLowerCase());

      return matchSubject && matchExam && matchMedium && matchSearch;
    });
  }, [selectedSubject, selectedExam, selectedMedium, searchQuery]);

  return (
    <div className="min-h-screen bg-slate-50/70 text-gray-900 font-sans antialiased selection:bg-blue-100 selection:text-blue-900">
      
      {/* Floating Toast */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 flex items-center gap-2.5 rounded-xl border border-gray-200 bg-white px-4 py-3 text-xs font-bold text-gray-800 shadow-xl animate-in fade-in slide-in-from-bottom-3">
          <CheckCircle2 className="h-4 w-4 text-emerald-600" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* ELEGANT HEADER SECTION */}
      <header className="border-b border-gray-200/80 bg-white pt-8 pb-8 px-4">
        <div className="mx-auto max-w-5xl">
          
          {/* Breadcrumbs */}
          <div className="flex items-center gap-2 text-xs font-semibold text-gray-500 mb-3">
            <Link href="/" className="hover:text-blue-600 transition-colors">Home</Link>
            <ChevronRight className="h-3 w-3 text-gray-400" />
            <span className="text-gray-500">Study Material</span>
            <ChevronRight className="h-3 w-3 text-gray-400" />
            <span className="text-blue-700 font-bold">SSC Recommended Books</span>
          </div>

          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
            <div>
              <div className="inline-flex items-center gap-1.5 rounded-full bg-blue-50 border border-blue-100 px-3 py-1 text-[11px] font-bold text-blue-700 mb-2">
                <Sparkles className="h-3.5 w-3.5 text-blue-600" />
                <span>Topper's Verified Resource Catalogue</span>
              </div>
              
              <h1 className="text-2xl sm:text-3xl md:text-4xl font-extrabold tracking-tight text-gray-900">
                Recommended Books For SSC Exams
              </h1>
              
              <p className="mt-2 text-sm text-gray-600 max-w-2xl leading-relaxed">
                Structured reference books and chapter-wise question banks for <strong>SSC CGL, CHSL, CPO, MTS & GD</strong>. Review chapter indexes, sample PDFs, and practice topic-wise MCQs directly.
              </p>
            </div>

            {/* Reading list counter */}
            {savedBooks.length > 0 && (
              <div className="flex items-center gap-2 rounded-xl border border-blue-100 bg-blue-50/60 px-3.5 py-2 text-xs font-bold text-blue-700 shrink-0">
                <Bookmark className="h-4 w-4 fill-blue-600 text-blue-600" />
                <span>{savedBooks.length} Book{savedBooks.length > 1 ? "s" : ""} in Reading List</span>
              </div>
            )}
          </div>

        </div>
      </header>

      {/* STICKY FILTER & SEARCH CONTROLS */}
      <section className="sticky top-0 z-30 border-b border-gray-200/80 bg-white/95 backdrop-blur-md px-4 py-3 shadow-xs">
        <div className="mx-auto max-w-5xl space-y-3">
          
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
            
            {/* Search Input */}
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3.5 top-2.5 h-4 w-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search by book title, subject, topic (e.g. Maths, Grammar, Static GK)..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full rounded-xl border border-gray-200 bg-gray-50/70 pl-9 pr-8 py-2 text-xs text-gray-900 placeholder-gray-400 focus:border-blue-600 focus:bg-white focus:outline-none focus:ring-1 focus:ring-blue-600 transition-all"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery("")}
                  className="absolute right-2.5 top-2.5 text-gray-400 hover:text-gray-600"
                >
                  <X className="h-3.5 w-3.5" />
                </button>
              )}
            </div>

            {/* Exam Filter Chips */}
            <div className="flex items-center gap-1.5 overflow-x-auto pb-0.5 scrollbar-none">
              <span className="text-[11px] font-bold text-gray-400 uppercase tracking-wider hidden md:inline">Exam:</span>
              {["All", "SSC CGL", "SSC CHSL", "SSC CPO", "SSC MTS"].map((exam) => (
                <button
                  key={exam}
                  onClick={() => setSelectedExam(exam)}
                  className={`rounded-lg px-2.5 py-1 text-xs font-semibold transition-all whitespace-nowrap cursor-pointer ${
                    selectedExam === exam
                      ? "bg-gray-900 text-white shadow-xs"
                      : "bg-gray-100 text-gray-600 hover:bg-gray-200 hover:text-gray-900"
                  }`}
                >
                  {exam}
                </button>
              ))}
            </div>

          </div>

          {/* Subject Filter Pills */}
          <div className="flex items-center justify-between gap-2 overflow-x-auto scrollbar-none pt-1">
            <div className="flex items-center gap-1.5">
              {[
                { label: "All Subjects", value: "All" },
                { label: "Maths", value: "Quantitative Aptitude" },
                { label: "English", value: "English Language" },
                { label: "Reasoning", value: "Reasoning Ability" },
                { label: "General Studies", value: "General Awareness" },
                { label: "PYQ Papers", value: "PYQ Compilations" },
              ].map((sub) => {
                const active = selectedSubject === sub.value;
                return (
                  <button
                    key={sub.value}
                    onClick={() => setSelectedSubject(sub.value)}
                    className={`rounded-lg px-3 py-1.5 text-xs font-bold transition-all whitespace-nowrap cursor-pointer ${
                      active
                        ? "bg-blue-600 text-white shadow-xs"
                        : "bg-white border border-gray-200 text-gray-700 hover:bg-gray-50 hover:border-gray-300"
                    }`}
                  >
                    {sub.label}
                  </button>
                );
              })}
            </div>

            {/* Medium Selector */}
            <div className="hidden sm:flex items-center gap-1.5 shrink-0">
              <select
                value={selectedMedium}
                onChange={(e) => setSelectedMedium(e.target.value)}
                className="rounded-lg border border-gray-200 bg-white px-2.5 py-1 text-xs font-semibold text-gray-700 focus:border-blue-600 focus:outline-none"
              >
                <option value="All">All Mediums</option>
                <option value="Bilingual">Bilingual</option>
                <option value="English">English</option>
                <option value="Hindi">Hindi</option>
              </select>
            </div>
          </div>

        </div>
      </section>

      {/* MAIN CONTAINER */}
      <main className="mx-auto max-w-5xl px-4 py-8 space-y-10">
        
        {/* Results Counter */}
        <div className="flex items-center justify-between text-xs text-gray-500">
          <p>
            Showing <strong className="text-gray-900">{filteredBooks.length}</strong> standard reference books
          </p>
          <span className="text-[11px] text-gray-400">Click any book to review chapter index & sample topics</span>
        </div>

        {/* ELEGANT LIST-WISE BOOK CATALOGUE */}
        {filteredBooks.length === 0 ? (
          <div className="rounded-2xl border border-gray-200 bg-white p-12 text-center max-w-md mx-auto space-y-3">
            <BookOpen className="h-10 w-10 text-gray-400 mx-auto" />
            <h3 className="text-sm font-bold text-gray-900">No books found</h3>
            <p className="text-xs text-gray-500">Try adjusting your keywords or clearing the subject/exam filters.</p>
            <button
              onClick={() => {
                setSelectedSubject("All");
                setSelectedExam("All");
                setSelectedMedium("All");
                setSearchQuery("");
              }}
              className="rounded-lg bg-blue-600 px-3.5 py-1.5 text-xs font-bold text-white hover:bg-blue-700 transition-colors"
            >
              Reset Filters
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredBooks.map((book) => {
              const isSaved = savedBooks.includes(book.id);

              return (
                <div
                  key={book.id}
                  onClick={() => setActiveBook(book)}
                  className="group relative flex flex-col sm:flex-row items-start gap-4 rounded-2xl border border-gray-200/90 bg-white p-4 sm:p-5 shadow-xs transition-all duration-200 hover:border-blue-400 hover:shadow-md cursor-pointer"
                >
                  
                  {/* Left: Book Cover Thumbnail Slot (Clean Aspect Ratio) */}
                  <div className="relative w-24 sm:w-28 aspect-[1/1.38] rounded-xl overflow-hidden shrink-0 shadow-sm border border-gray-100 flex flex-col justify-between p-2.5 text-white select-none">
                    {book.coverImage ? (
                      /* If user provides a real image URL, it shows cleanly here */
                      <img
                        src={book.coverImage}
                        alt={book.title}
                        className="absolute inset-0 h-full w-full object-cover"
                      />
                    ) : (
                      /* Elegant Minimal Placeholder when image is not yet uploaded */
                      <div className={`absolute inset-0 bg-gradient-to-br ${book.coverColor}`}>
                        {/* Book Spine Crease Effect */}
                        <div className="absolute left-0 top-0 bottom-0 w-2.5 bg-black/20" />
                        <div className="absolute left-2.5 top-0 bottom-0 w-[1px] bg-white/20" />
                      </div>
                    )}

                    {/* Thumbnail Cover Text Overlay */}
                    <div className="relative z-10 text-[9px] font-black uppercase tracking-wider text-white/80 line-clamp-1">
                      {book.publisher.split(" ")[0]}
                    </div>
                    
                    <div className="relative z-10 my-auto text-center">
                      <p className="text-[11px] font-black leading-tight text-white line-clamp-3">
                        {book.title}
                      </p>
                    </div>

                    <div className="relative z-10 flex items-center justify-between text-[8px] font-bold text-white/80 pt-1 border-t border-white/20">
                      <span>{book.language}</span>
                      <span>{book.pages}p</span>
                    </div>
                  </div>

                  {/* Center: Book Metadata & Content */}
                  <div className="flex-1 min-w-0 space-y-2 text-left">
                    
                    {/* Badge & Subject Strip */}
                    <div className="flex flex-wrap items-center gap-1.5">
                      {book.badge && (
                        <span className="rounded-md bg-amber-50 border border-amber-200/80 px-2 py-0.5 text-[10px] font-bold text-amber-800">
                          {book.badge}
                        </span>
                      )}
                      <span className="rounded-md bg-gray-100 px-2 py-0.5 text-[10px] font-semibold text-gray-700">
                        {book.subject}
                      </span>
                      <span className="text-[11px] text-gray-400">• {book.edition}</span>
                    </div>

                    {/* Title & Hindi Title */}
                    <div>
                      <h3 className="text-base font-bold text-gray-900 group-hover:text-blue-700 transition-colors leading-snug">
                        {book.title}
                      </h3>
                      {book.hindiTitle && (
                        <p className="text-xs text-gray-500 font-medium mt-0.5">{book.hindiTitle}</p>
                      )}
                    </div>

                    {/* Author & Exam tags */}
                    <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-gray-500">
                      <span>By <strong className="text-gray-700">{book.author}</strong></span>
                      <span className="text-gray-300">|</span>
                      <span>Target: {book.exams.join(", ")}</span>
                    </div>

                    {/* Short Description */}
                    <p className="text-xs text-gray-600 line-clamp-2 leading-relaxed">
                      {book.description}
                    </p>

                    {/* Sample Chapters Pill Strip */}
                    <div className="flex flex-wrap items-center gap-1.5 pt-1">
                      <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wide mr-1">Index:</span>
                      {book.sampleChapters.slice(0, 3).map((chap, idx) => (
                        <span
                          key={idx}
                          className="rounded-md bg-slate-100/90 border border-gray-200/60 px-2 py-0.5 text-[11px] text-gray-600 line-clamp-1 max-w-[200px]"
                        >
                          {chap.title}
                        </span>
                      ))}
                      {book.sampleChapters.length > 3 && (
                        <span className="text-[10px] font-bold text-blue-600">
                          +{book.sampleChapters.length - 3} more
                        </span>
                      )}
                    </div>

                  </div>

                  {/* Right Side: Rating, Bookmark & Action Buttons */}
                  <div className="flex sm:flex-col items-center sm:items-end justify-between sm:justify-center gap-2.5 w-full sm:w-auto shrink-0 pt-3 sm:pt-0 border-t sm:border-t-0 border-gray-100">
                    
                    <div className="flex items-center gap-2">
                      {/* Rating */}
                      <div className="flex items-center gap-1 text-xs font-bold text-gray-800">
                        <Star className="h-3.5 w-3.5 fill-amber-400 text-amber-500" />
                        <span>{book.rating}</span>
                        <span className="text-[10px] font-normal text-gray-400">({book.reviewCount})</span>
                      </div>

                      {/* Bookmark Icon */}
                      <button
                        onClick={(e) => toggleSaveBook(book.id, e)}
                        title={isSaved ? "Remove from saved" : "Save for later"}
                        className={`p-1.5 rounded-lg border transition-all cursor-pointer ${
                          isSaved
                            ? "border-blue-200 bg-blue-50 text-blue-700"
                            : "border-gray-200 bg-white text-gray-400 hover:text-gray-700 hover:border-gray-300"
                        }`}
                      >
                        <Bookmark className={`h-3.5 w-3.5 ${isSaved ? "fill-blue-700" : ""}`} />
                      </button>
                    </div>

                    {/* Action Button: View Chapter Index */}
                    <div className="flex items-center gap-1.5">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setActiveBook(book);
                        }}
                        className="flex items-center gap-1 rounded-xl bg-blue-600 px-3.5 py-2 text-xs font-bold text-white hover:bg-blue-700 transition-all cursor-pointer shadow-xs"
                      >
                        <Eye className="h-3.5 w-3.5" />
                        <span>View Index</span>
                      </button>

                      {book.practiceTopicSlug && (
                        <Link
                          href={`/practice/${book.practiceTopicSlug}`}
                          onClick={(e) => e.stopPropagation()}
                          className="flex items-center gap-1 rounded-xl border border-gray-200 bg-gray-50 px-3 py-2 text-xs font-bold text-gray-700 hover:bg-gray-100 hover:text-blue-700 transition-all"
                          title="Solve questions online"
                        >
                          <span>Solve</span>
                          <ChevronRight className="h-3.5 w-3.5" />
                        </Link>
                      )}
                    </div>

                  </div>

                </div>
              );
            })}
          </div>
        )}

        {/* COMPACT FREE REVISION NOTES VAULT */}
        <section className="rounded-2xl border border-gray-200/90 bg-white p-6 space-y-4 shadow-xs text-left">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div>
              <h2 className="text-base font-extrabold text-gray-900">
                Free Downloadable Formula & Revision Sheets (PDFs)
              </h2>
              <p className="text-xs text-gray-500 mt-0.5">
                Printable summary notes created from high-frequency TCS shifts.
              </p>
            </div>
            <span className="text-[11px] font-bold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-lg border border-emerald-100 w-fit">
              100% Free For All Students
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
            {FREE_NOTES.map((note) => (
              <div
                key={note.id}
                className="flex items-center justify-between rounded-xl border border-gray-100 bg-gray-50/80 p-3.5 hover:border-gray-300 hover:bg-white transition-all text-xs"
              >
                <div className="flex items-center gap-3">
                  <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-blue-100 text-blue-700 font-bold text-[10px] shrink-0">
                    PDF
                  </div>
                  <div>
                    <h4 className="font-bold text-gray-900 leading-snug line-clamp-1">{note.title}</h4>
                    <p className="text-[10px] text-gray-500 mt-0.5">{note.subject} • {note.pages} • {note.size}</p>
                  </div>
                </div>

                <button
                  onClick={() => triggerToast(`Downloading PDF: ${note.title}`)}
                  className="flex items-center gap-1 rounded-lg bg-white border border-gray-200 px-2.5 py-1.5 text-[11px] font-bold text-gray-700 hover:bg-blue-50 hover:text-blue-700 hover:border-blue-200 transition-all cursor-pointer shrink-0 ml-2"
                >
                  <Download className="h-3.5 w-3.5" />
                  <span>Get PDF</span>
                </button>
              </div>
            ))}
          </div>
        </section>

      </main>

      {/* --- DETAIL / CHAPTER INDEX MODAL --- */}
      {activeBook && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-in fade-in duration-150 text-left"
          onClick={() => setActiveBook(null)}
        >
          <div
            className="relative w-full max-w-xl max-h-[85vh] flex flex-col rounded-2xl border border-gray-200 bg-white shadow-2xl overflow-hidden animate-in zoom-in-95 duration-150"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="flex items-start justify-between border-b border-gray-100 p-4 bg-gray-50/80">
              <div>
                <div className="flex items-center gap-2">
                  <span className="rounded bg-blue-100 px-2 py-0.5 text-[10px] font-bold text-blue-800">
                    {activeBook.subject}
                  </span>
                  <span className="text-xs text-gray-500">• {activeBook.edition}</span>
                </div>
                <h3 className="text-base font-extrabold text-gray-900 mt-1">{activeBook.title}</h3>
                {activeBook.hindiTitle && (
                  <p className="text-xs text-gray-500">{activeBook.hindiTitle}</p>
                )}
              </div>

              <button
                onClick={() => setActiveBook(null)}
                className="rounded-lg border border-gray-200 p-1.5 text-gray-400 hover:bg-gray-100 hover:text-gray-700 cursor-pointer"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4 text-xs">
              
              {/* Topper Note */}
              {activeBook.topperNote && (
                <div className="rounded-xl border border-amber-200 bg-amber-50/60 p-3 text-amber-900">
                  <span className="font-bold">💡 Topper's Advice: </span>
                  <span className="text-amber-800">{activeBook.topperNote}</span>
                </div>
              )}

              {/* Chapter Breakdown */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <h4 className="font-extrabold uppercase tracking-wider text-gray-500 text-[11px]">
                    Syllabus Chapters ({activeBook.sampleChapters.length} Key Chapters)
                  </h4>
                  <span className="text-[10px] text-emerald-700 font-bold">100% TCS Pattern</span>
                </div>

                <div className="space-y-1.5">
                  {activeBook.sampleChapters.map((chap, idx) => (
                    <div
                      key={idx}
                      className="flex items-center justify-between rounded-xl border border-gray-100 bg-gray-50/60 p-2.5 text-xs"
                    >
                      <div className="flex items-center gap-2.5">
                        <span className="flex h-5 w-5 items-center justify-center rounded-md bg-white border border-gray-200 text-[10px] font-bold text-gray-500">
                          {idx + 1}
                        </span>
                        <span className="font-medium text-gray-800">{chap.title}</span>
                      </div>

                      <div className="flex items-center gap-2 shrink-0">
                        {chap.highYield && (
                          <span className="rounded bg-rose-50 border border-rose-100 px-1.5 py-0.5 text-[9px] font-bold text-rose-700">
                            High Yield
                          </span>
                        )}
                        <span className="text-[10px] text-gray-400">pp. {chap.pages}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Book Details Summary Table */}
              <div className="rounded-xl border border-gray-100 bg-gray-50 p-3">
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div>
                    <span className="text-[10px] text-gray-400">Author</span>
                    <p className="font-bold text-gray-800">{activeBook.author}</p>
                  </div>
                  <div>
                    <span className="text-[10px] text-gray-400">Publisher</span>
                    <p className="font-bold text-gray-800">{activeBook.publisher}</p>
                  </div>
                  <div>
                    <span className="text-[10px] text-gray-400">Language</span>
                    <p className="font-bold text-gray-800">{activeBook.language}</p>
                  </div>
                  <div>
                    <span className="text-[10px] text-gray-400">Total Pages</span>
                    <p className="font-bold text-gray-800">{activeBook.pages} Pages</p>
                  </div>
                </div>
              </div>

            </div>

            {/* Modal Footer */}
            <div className="flex items-center justify-between border-t border-gray-100 p-3.5 bg-gray-50/80">
              <button
                onClick={(e) => toggleSaveBook(activeBook.id, e)}
                className="flex items-center gap-1.5 rounded-lg border border-gray-200 bg-white px-3 py-2 text-xs font-bold text-gray-700 hover:bg-gray-100 cursor-pointer"
              >
                <Bookmark className="h-3.5 w-3.5" />
                <span>{savedBooks.includes(activeBook.id) ? "Saved" : "Save Book"}</span>
              </button>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => {
                    triggerToast(`Downloading Sample Chapters for ${activeBook.title}`);
                    setActiveBook(null);
                  }}
                  className="flex items-center gap-1.5 rounded-xl bg-blue-600 px-4 py-2 text-xs font-bold text-white hover:bg-blue-700 transition-all cursor-pointer shadow-xs"
                >
                  <Download className="h-3.5 w-3.5" />
                  <span>Download Sample Index</span>
                </button>
              </div>
            </div>

          </div>
        </div>
      )}

      {/* FOOTER */}
      

    </div>
  );
}
