"use client";

import { useEffect, useMemo, useState } from "react";
import { supabase } from "@/lib/supabase";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { 
  BookOpen, 
  FileText, 
  BookMarked,
  Trophy,
  Zap, 
  Clock, 
  Keyboard, 
  Newspaper,
  ChevronDown,
  ChevronRight,
  Search, 
  LayoutDashboard, 
  ShieldCheck, 
  LogOut, 
  LogIn, 
  Menu, 
  X,
  Sparkles,
  GraduationCap,
  Target,
  Wrench,
  Calendar,
  Image as ImageIcon
} from "lucide-react";

export default function UserNav() {
  const [user, setUser] = useState<any>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  
  // Dropdown states
  const [examsDropdownOpen, setExamsDropdownOpen] = useState(false);
  const [materialsDropdownOpen, setMaterialsDropdownOpen] = useState(false);
  const [practiceDropdownOpen, setPracticeDropdownOpen] = useState(false);
  const [toolkitDropdownOpen, setToolkitDropdownOpen] = useState(false);
  
  // Mobile dropdown states
  const [mobileExamsOpen, setMobileExamsOpen] = useState(false);
  const [mobileMaterialsOpen, setMobileMaterialsOpen] = useState(false);
  const [mobilePracticeOpen, setMobilePracticeOpen] = useState(false);
  const [mobileToolkitOpen, setMobileToolkitOpen] = useState(false);

  const [mounted, setMounted] = useState(false);
  const [tickers, setTickers] = useState<any[]>([
    {
      id: 1,
      title: "SSC CGL Tier 2 Exam Date Announced: 28 Days Remaining!",
      badge: "⏳ COUNTDOWN",
      link: "/exams/ssc-cgl",
      is_active: true,
    },
    {
      id: 2,
      title: "SSC CHSL Tier 1 Official Answer Key & Response Sheet Released",
      badge: "🔴 LIVE",
      link: "/papers",
      is_active: true,
    },
    {
      id: 3,
      title: "SSC CPO 2026 Notification Out — 4,000+ Vacancies Announced",
      badge: "🟢 NEW",
      link: "/exams/ssc-cpo",
      is_active: true,
    },
  ]);
  
  const [sscSubExams, setSscSubExams] = useState<any[]>([]);

  const pathname = usePathname();
  const router = useRouter();
  const activeTickers = useMemo(() => tickers.filter((t) => t.is_active), [tickers]);

  useEffect(() => {
    setMounted(true);
    const saved = localStorage.getItem("ssczone_live_tickers");
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) setTickers(parsed);
      } catch (e) {}
    }
    (async () => {
      const { data: { session } } = await supabase.auth.getSession();
      const user = session?.user || null;
      setUser(user);
      if (user) {
        const { data } = await supabase
          .from("profiles")
          .select("is_admin")
          .eq("id", user.id)
          .maybeSingle();
        setIsAdmin(data?.is_admin || false);
      }

      // Fetch active exams
      const { data: activeExams } = await supabase
        .from("exams")
        .select("id, title, slug, description")
        .eq("is_active", true)
        .order("sort_order");
        
      if (activeExams) {
        setSscSubExams(activeExams.map(ex => ({
          name: ex.title,
          slug: ex.slug,
          desc: ex.description || "",
          badge: ""
        })));
      }
    })();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user || null);
      if (!session) setIsAdmin(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  async function handleLogout() {
    await supabase.auth.signOut();
    setUser(null);
    setIsAdmin(false);
    router.push("/");
    router.refresh();
  }

  // --- MENU DATA ---
  const materialsMenu = [
    { name: "Subject Notes", href: "/notes", icon: BookOpen },
    { name: "SSC Reference Books", href: "/books", icon: BookMarked },
  ];

  const practiceMenu = [
    { name: "Previous Year Papers (PYQ)", href: "/papers", icon: FileText },
    { name: "Full Mock Tests", href: "/mocks", icon: Trophy },
    { name: "Speed Test", href: "/speed-test", icon: Clock },
    { name: "Daily Free Quiz", href: "/daily-quiz", icon: Zap },
  ];

  const toolkitMenu = [
    { name: "Rank Predictor & Marks", href: "/toolkit/rank-predictor", icon: Trophy },
    { name: "Age & Post Eligibility", href: "/toolkit/age-calculator", icon: Calendar },
    { name: "Photo & Signature Resizer", href: "/toolkit/photo-resizer", icon: ImageIcon },
  ];

  return (
    <header className="sticky top-0 z-40 w-full max-w-full overflow-x-clip bg-white/90 backdrop-blur-xl border-b border-slate-200/80 shadow-[0_2px_20px_-4px_rgba(0,0,0,0.06)]">
      <div className="mx-auto flex max-w-7xl w-full items-center justify-between px-3 sm:px-6 py-2.5">
        
        {/* Clean Professional Brand Logo */}
        <Link href="/" className="group flex items-center gap-2.5 text-xl md:text-2xl font-extrabold text-slate-900 tracking-tight shrink-0 mr-1 xl:mr-2">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-blue-600 text-white shadow-sm transition-transform group-hover:scale-105">
            <Sparkles className="h-4 w-4 text-amber-300 fill-amber-300" />
          </div>
          <span className="flex items-center font-black">
            <span className="text-blue-700">SSC</span>
            <span className="text-slate-900">Zone</span>
          </span>
        </Link>

        {/* Desktop Main Navigation Bar */}
        <nav className="hidden xl:flex items-center gap-1 xl:gap-1.5 shrink-0">
          
          {/* 1. SSC EXAMS */}
          <div 
            className="relative"
            onMouseEnter={() => setExamsDropdownOpen(true)}
            onMouseLeave={() => setExamsDropdownOpen(false)}
          >
            <button
              onClick={() => setExamsDropdownOpen(!examsDropdownOpen)}
              className={`flex items-center gap-1.5 rounded-xl px-2.5 2xl:px-3 py-1.5 2xl:py-2 text-xs 2xl:text-sm font-bold transition-all cursor-pointer ${
                pathname.startsWith("/exams")
                  ? "bg-blue-50/90 text-blue-700 shadow-2xs border border-blue-100"
                  : "text-slate-700 hover:bg-slate-100/80 hover:text-blue-700"
              }`}
            >
              <Target className="h-4 w-4 text-blue-600" />
              <span>Question Bank</span>
              <ChevronDown className={`h-3.5 w-3.5 text-slate-400 transition-transform duration-200 ${examsDropdownOpen ? "rotate-180 text-blue-600" : ""}`} />
            </button>

            {examsDropdownOpen && (
              <div className="absolute left-0 top-full pt-2 w-80 z-50 animate-in fade-in slide-in-from-top-2 duration-150">
                <div className="rounded-2xl border border-slate-200/90 bg-white/98 backdrop-blur-xl p-3 shadow-2xl shadow-slate-900/10 space-y-1.5 ring-1 ring-black/5">
                  <div className="flex items-center justify-between border-b border-slate-100 pb-2 px-2">
                    <span className="text-[11px] font-black uppercase text-slate-400 tracking-wider">Select SSC Target Exam</span>
                    <Link href="/exams" className="text-[11px] font-black text-blue-600 hover:text-blue-800 transition-colors">View All →</Link>
                  </div>
                  <div className="grid grid-cols-1 gap-1 max-h-96 overflow-y-auto pr-1 custom-scrollbar">
                    {sscSubExams.map((subEx) => (
                      <Link
                        key={subEx.slug}
                        href={`/exams/${subEx.slug}`}
                        onClick={() => setExamsDropdownOpen(false)}
                        className="group flex items-center justify-between rounded-xl px-3 py-2.5 hover:bg-blue-50/80 border border-transparent hover:border-blue-100 transition-all"
                      >
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="text-sm font-bold text-slate-900 group-hover:text-blue-700 transition-colors">
                              {subEx.name}
                            </span>
                            {subEx.badge && (
                              <span className="rounded-full bg-blue-100 px-1.5 py-0.2 text-[9px] font-black text-blue-700">
                                {subEx.badge}
                              </span>
                            )}
                          </div>
                          <p className="text-[11px] text-slate-500 line-clamp-1">{subEx.desc}</p>
                        </div>
                        <ChevronRight className="h-4 w-4 text-slate-300 group-hover:text-blue-600 group-hover:translate-x-1 transition-all shrink-0" />
                      </Link>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* 2. DIRECT PROMINENT PYQ PAPERS TAB */}
          <Link
            href="/papers"
            className={`flex items-center gap-1.5 rounded-xl px-2.5 2xl:px-3 py-1.5 2xl:py-2 text-xs 2xl:text-sm font-bold transition-all relative cursor-pointer ${
              pathname.startsWith("/papers")
                ? "bg-blue-600 text-white shadow-sm shadow-blue-500/20"
                : "text-slate-800 hover:bg-blue-50/80 hover:text-blue-700"
            }`}
          >
            <FileText className={`h-4 w-4 ${pathname.startsWith("/papers") ? "text-white" : "text-blue-600"}`} />
            <span>PYQ Papers</span>
            <span className="hidden 2xl:inline rounded-full bg-amber-400 text-slate-950 text-[9px] font-black px-1.5 py-0.5 uppercase tracking-wide shrink-0">
              2025 Live
            </span>
          </Link>

          {/* 3. STUDY MATERIAL */}
          <div 
            className="relative"
            onMouseEnter={() => setMaterialsDropdownOpen(true)}
            onMouseLeave={() => setMaterialsDropdownOpen(false)}
          >
            <button
              onClick={() => setMaterialsDropdownOpen(!materialsDropdownOpen)}
              className={`flex items-center gap-1.5 rounded-xl px-2.5 2xl:px-3 py-1.5 2xl:py-2 text-xs 2xl:text-sm font-bold transition-all cursor-pointer ${
                pathname.startsWith("/books") || pathname.startsWith("/notes")
                  ? "bg-blue-50/90 text-blue-700 shadow-2xs border border-blue-100"
                  : "text-slate-700 hover:bg-slate-100/80 hover:text-blue-700"
              }`}
            >
              <GraduationCap className="h-4 w-4 text-blue-600" />
              <span className="hidden 2xl:inline">Study Material</span>
              <span className="2xl:hidden">Material</span>
              <ChevronDown className={`h-3.5 w-3.5 text-slate-400 transition-transform duration-200 ${materialsDropdownOpen ? "rotate-180 text-blue-600" : ""}`} />
            </button>

            {materialsDropdownOpen && (
              <div className="absolute left-0 top-full pt-2 w-64 z-50 animate-in fade-in slide-in-from-top-2 duration-150">
                <div className="rounded-2xl border border-slate-200 bg-white p-2 shadow-xl space-y-1">
                  {materialsMenu.map((item) => {
                    const Icon = item.icon;
                    return (
                      <Link
                        key={item.name}
                        href={item.href}
                        onClick={() => setMaterialsDropdownOpen(false)}
                        className="group flex items-center justify-between rounded-xl px-3 py-2.5 hover:bg-slate-50 transition-all"
                      >
                        <div className="flex items-center gap-2.5">
                          <div className="bg-slate-100 group-hover:bg-blue-50 p-1.5 rounded-lg text-slate-500 group-hover:text-blue-600 transition-colors">
                            <Icon className="h-4 w-4" />
                          </div>
                          <span className="text-xs font-semibold text-slate-800 group-hover:text-blue-700">
                            {item.name}
                          </span>
                        </div>
                      </Link>
                    );
                  })}
                </div>
              </div>
            )}
          </div>

          {/* 3. PRACTICE ZONE */}
          <div 
            className="relative"
            onMouseEnter={() => setPracticeDropdownOpen(true)}
            onMouseLeave={() => setPracticeDropdownOpen(false)}
          >
            <button
              onClick={() => setPracticeDropdownOpen(!practiceDropdownOpen)}
              className={`flex items-center gap-1.5 rounded-xl px-2.5 2xl:px-3 py-1.5 2xl:py-2 text-xs 2xl:text-sm font-semibold transition-all cursor-pointer ${
                pathname.startsWith("/papers") || pathname.startsWith("/mocks") || pathname.startsWith("/speed-test") || pathname.startsWith("/daily-quiz") || pathname.startsWith("/typing")
                  ? "bg-slate-100 text-slate-900"
                  : "text-slate-700 hover:bg-slate-100/80 hover:text-blue-700"
              }`}
            >
              <Zap className="h-4 w-4 text-blue-600" />
              <span>Practice</span>
              <ChevronDown className={`h-3.5 w-3.5 text-slate-400 transition-transform duration-200 ${practiceDropdownOpen ? "rotate-180 text-blue-600" : ""}`} />
            </button>

            {practiceDropdownOpen && (
              <div className="absolute left-0 top-full pt-2 w-64 z-50 animate-in fade-in slide-in-from-top-2 duration-150">
                <div className="rounded-2xl border border-slate-200 bg-white p-2 shadow-xl space-y-1">
                  {practiceMenu.map((item) => {
                    const Icon = item.icon;
                    return (
                      <Link
                        key={item.name}
                        href={item.href}
                        onClick={() => setPracticeDropdownOpen(false)}
                        className="group flex items-center justify-between rounded-xl px-3 py-2.5 hover:bg-slate-50 transition-all"
                      >
                        <div className="flex items-center gap-2.5">
                          <div className="bg-slate-100 group-hover:bg-blue-50 p-1.5 rounded-lg text-slate-500 group-hover:text-blue-600 transition-colors">
                            <Icon className="h-4 w-4" />
                          </div>
                          <span className="text-xs font-semibold text-slate-800 group-hover:text-blue-700">
                            {item.name}
                          </span>
                        </div>
                      </Link>
                    );
                  })}
                </div>
              </div>
            )}
          </div>

          {/* 4. BLOG & UPDATES */}
          <Link
            href="/blog"
            className={`flex items-center gap-1.5 rounded-xl px-2.5 2xl:px-3 py-1.5 2xl:py-2 text-xs 2xl:text-sm font-bold transition-all relative ${
              pathname.startsWith("/blog")
                ? "bg-blue-50/90 text-blue-700 shadow-2xs border border-blue-100"
                : "text-slate-700 hover:bg-slate-100/80 hover:text-blue-700"
            }`}
          >
            <Newspaper className="h-4 w-4 text-blue-600" />
            <span className="hidden 2xl:inline">Blog & Updates</span>
            <span className="2xl:hidden">Blog</span>
          </Link>
          
          {/* 5. TYPING TEST */}
          <Link
            href="/typing"
            className={`flex items-center gap-1.5 rounded-xl px-2.5 2xl:px-3 py-1.5 2xl:py-2 text-xs 2xl:text-sm font-bold transition-all relative ${
              pathname.startsWith("/typing")
                ? "bg-blue-50/90 text-blue-700 shadow-2xs border border-blue-100"
                : "text-slate-700 hover:bg-slate-100/80 hover:text-blue-700"
            }`}
          >
            <Keyboard className="h-4 w-4 text-blue-600" />
            <span>Typing</span>
          </Link>

          {/* 6. SSC TOOLKIT DROPDOWN */}
          <div 
            className="relative"
            onMouseEnter={() => setToolkitDropdownOpen(true)}
            onMouseLeave={() => setToolkitDropdownOpen(false)}
          >
            <button
              onClick={() => setToolkitDropdownOpen(!toolkitDropdownOpen)}
              className={`flex items-center gap-1.5 rounded-xl px-2.5 2xl:px-3 py-1.5 2xl:py-2 text-xs 2xl:text-sm font-semibold transition-all cursor-pointer ${
                pathname.startsWith("/toolkit")
                  ? "bg-slate-100 text-slate-900"
                  : "text-slate-700 hover:bg-slate-100/80 hover:text-blue-700"
              }`}
            >
              <Wrench className="h-4 w-4 text-slate-500" />
              <span className="hidden 2xl:inline">Candidate Tools</span>
              <span className="2xl:hidden">Tools</span>
              <ChevronDown className={`h-3.5 w-3.5 text-slate-400 transition-transform duration-200 ${toolkitDropdownOpen ? "rotate-180 text-blue-600" : ""}`} />
            </button>

            {toolkitDropdownOpen && (
              <div className="absolute right-0 top-full pt-2 w-64 z-50 animate-in fade-in slide-in-from-top-2 duration-150">
                <div className="rounded-2xl border border-slate-200 bg-white p-2 shadow-xl space-y-1">
                  {toolkitMenu.map((item) => {
                    const Icon = item.icon;
                    return (
                      <Link
                        key={item.name}
                        href={item.href}
                        onClick={() => setToolkitDropdownOpen(false)}
                        className="group flex items-center justify-between rounded-xl px-3 py-2.5 hover:bg-slate-50 transition-all"
                      >
                        <div className="flex items-center gap-2.5">
                          <div className="bg-slate-100 group-hover:bg-blue-50 p-1.5 rounded-lg text-slate-500 group-hover:text-blue-600 transition-colors">
                            <Icon className="h-4 w-4" />
                          </div>
                          <span className="text-xs font-semibold text-slate-800 group-hover:text-blue-700">
                            {item.name}
                          </span>
                        </div>
                      </Link>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
          
        </nav>

        {/* User Auth & Quick Action Controls */}
        <div className="hidden xl:flex items-center gap-2.5 shrink-0">
          {/* Quick Search Button */}
          <Link
            href="/search"
            className="flex items-center gap-2 rounded-xl border border-slate-200/90 bg-slate-50/80 px-3 py-2 text-xs font-semibold text-slate-500 hover:text-slate-800 hover:bg-slate-100/90 transition-all shadow-2xs"
            title="Search Questions & Syllabus"
          >
            <Search className="h-3.5 w-3.5 text-slate-400" />
            <span className="hidden 2xl:inline">Search...</span>
          </Link>

          {mounted && user ? (
            <div className="flex items-center gap-2">
              <Link
                href="/dashboard"
                className={`flex items-center gap-1.5 rounded-xl border px-3.5 py-2 text-xs xl:text-sm font-bold transition-all ${
                  pathname?.startsWith("/dashboard")
                    ? "border-blue-600 bg-blue-600 text-white shadow-md shadow-blue-500/20"
                    : "border-slate-200 bg-white text-slate-700 hover:bg-slate-50 shadow-2xs"
                }`}
              >
                <LayoutDashboard className="h-4 w-4" />
                <span>Dashboard</span>
              </Link>

              {isAdmin && (
                <Link
                  href="/admin"
                  className="flex items-center gap-1.5 rounded-xl border border-amber-300/80 bg-gradient-to-r from-amber-50 to-amber-100/80 px-3.5 py-2 text-xs xl:text-sm font-black text-amber-900 hover:from-amber-100 hover:to-amber-200 transition-all shadow-2xs"
                >
                  <ShieldCheck className="h-4 w-4 text-amber-600" />
                  <span>Admin</span>
                </Link>
              )}

              <button
                onClick={handleLogout}
                className="flex items-center justify-center rounded-xl border border-slate-200 p-2 text-rose-500 hover:bg-rose-50 hover:border-rose-200 transition-all cursor-pointer shadow-2xs"
                title="Log Out"
              >
                <LogOut className="h-4 w-4" />
              </button>
            </div>
          ) : (
            <Link
              href="/login"
              className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-blue-600 via-indigo-600 to-blue-700 px-4 py-2 text-xs xl:text-sm font-black text-white shadow-md shadow-blue-500/20 hover:shadow-lg hover:shadow-blue-500/30 hover:scale-[1.02] active:scale-[0.98] transition-all"
            >
              <LogIn className="h-4 w-4" />
              <span>Login</span>
            </Link>
          )}
        </div>

        {/* Mobile Menu Toggle Button */}
        <button
          type="button"
          aria-label="Toggle navigation menu"
          className="flex h-11 w-11 items-center justify-center rounded-xl bg-gray-100/90 text-gray-800 xl:hidden touch-manipulation cursor-pointer active:scale-90 transition-all select-none shadow-xs border border-gray-200"
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
        >
          {mobileMenuOpen ? <X className="h-6 w-6 text-gray-900" /> : <Menu className="h-6 w-6 text-gray-900" />}
        </button>
      </div>

      {/* MOBILE MENU PANE */}
      {mobileMenuOpen && (
        <div className="fixed inset-x-0 top-[58px] z-50 max-h-[85vh] w-full overflow-y-auto bg-white/98 backdrop-blur-xl p-4 shadow-2xl xl:hidden animate-in slide-in-from-top-2 border-t border-gray-200 touch-manipulation">
          
          <div className="mb-4">
            <Link
              href="/search"
              onClick={() => setMobileMenuOpen(false)}
              className="flex items-center gap-2 w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm text-gray-600 active:bg-gray-100 touch-manipulation"
            >
              <Search className="h-4 w-4 text-gray-400" />
              Search questions, topics, exams...
            </Link>
          </div>

          <div className="flex flex-col gap-1 pb-4">
            
            {/* 0. DIRECT PYQ SHIFT PAPERS FOR MOBILE */}
            <Link
              href="/papers"
              onClick={() => setMobileMenuOpen(false)}
              className="flex items-center justify-between rounded-xl px-4 py-3 text-sm font-extrabold bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-md shadow-blue-500/20 active:scale-95 transition-all mb-1"
            >
              <div className="flex items-center gap-2.5">
                <FileText className="h-5 w-5 text-amber-300" />
                <span>PYQ Shift Papers (Official)</span>
              </div>
              <span className="rounded-md bg-amber-400 text-slate-950 text-[10px] font-black px-2 py-0.5">
                PDF + Test
              </span>
            </Link>

            {/* 1. Mobile SSC Exams */}
            <div>
              <button 
                type="button"
                onClick={() => setMobileExamsOpen(!mobileExamsOpen)}
                className="flex w-full items-center justify-between rounded-xl px-4 py-3 text-sm font-extrabold text-gray-800 hover:bg-gray-50 active:bg-gray-100 touch-manipulation cursor-pointer select-none"
              >
                <div className="flex items-center gap-2.5">
                  <Target className="h-5 w-5 text-blue-600" />
                  <span>Question Bank</span>
                </div>
                <ChevronDown className={`h-4 w-4 text-gray-500 transition-transform ${mobileExamsOpen ? 'rotate-180 text-blue-600' : ''}`} />
              </button>
              {mobileExamsOpen && (
                <div className="ml-4 mt-1 border-l-2 border-blue-200 pl-2 space-y-1">
                  {sscSubExams.map((subEx) => (
                    <Link
                      key={subEx.slug}
                      href={`/exams/${subEx.slug}`}
                      onClick={() => setMobileMenuOpen(false)}
                      className="flex items-center justify-between rounded-xl px-3 py-2.5 text-sm font-bold text-gray-800 hover:bg-blue-50 active:bg-blue-100 hover:text-blue-700 touch-manipulation"
                    >
                      {subEx.name}
                    </Link>
                  ))}
                </div>
              )}
            </div>

            {/* 2. Mobile Study Material */}
            <div>
              <button 
                type="button"
                onClick={() => setMobileMaterialsOpen(!mobileMaterialsOpen)}
                className="flex w-full items-center justify-between rounded-xl px-4 py-3 text-sm font-extrabold text-gray-800 hover:bg-gray-50 active:bg-gray-100 touch-manipulation cursor-pointer select-none"
              >
                <div className="flex items-center gap-2.5">
                  <GraduationCap className="h-5 w-5 text-blue-600" />
                  <span>Study Material</span>
                </div>
                <ChevronDown className={`h-4 w-4 text-gray-500 transition-transform ${mobileMaterialsOpen ? 'rotate-180 text-blue-600' : ''}`} />
              </button>
              {mobileMaterialsOpen && (
                <div className="ml-4 mt-1 border-l-2 border-blue-200 pl-2 space-y-1">
                  {materialsMenu.map((item) => (
                    <Link
                      key={item.name}
                      href={item.href}
                      onClick={() => setMobileMenuOpen(false)}
                      className="flex items-center gap-2.5 rounded-xl px-3 py-2.5 text-sm font-bold text-gray-800 hover:bg-blue-50 active:bg-blue-100 hover:text-blue-700 touch-manipulation"
                    >
                      {item.name}
                    </Link>
                  ))}
                </div>
              )}
            </div>

            {/* 3. Mobile Practice Zone */}
            <div>
              <button 
                type="button"
                onClick={() => setMobilePracticeOpen(!mobilePracticeOpen)}
                className="flex w-full items-center justify-between rounded-xl px-4 py-3 text-sm font-extrabold text-gray-800 hover:bg-gray-50 active:bg-gray-100 touch-manipulation cursor-pointer select-none"
              >
                <div className="flex items-center gap-2.5">
                  <Zap className="h-5 w-5 text-blue-600" />
                  <span>Practice Zone</span>
                </div>
                <ChevronDown className={`h-4 w-4 text-gray-500 transition-transform ${mobilePracticeOpen ? 'rotate-180 text-blue-600' : ''}`} />
              </button>
              {mobilePracticeOpen && (
                <div className="ml-4 mt-1 border-l-2 border-blue-200 pl-2 space-y-1">
                  {practiceMenu.map((item) => (
                    <Link
                      key={item.name}
                      href={item.href}
                      onClick={() => setMobileMenuOpen(false)}
                      className="flex items-center gap-2.5 rounded-xl px-3 py-2.5 text-sm font-bold text-gray-800 hover:bg-blue-50 active:bg-blue-100 hover:text-blue-700 touch-manipulation"
                    >
                      {item.name}
                    </Link>
                  ))}
                </div>
              )}
            </div>

            {/* 4. Mobile Blog & Typing */}
            <Link
              href="/blog"
              onClick={() => setMobileMenuOpen(false)}
              className="flex items-center gap-2.5 rounded-xl px-4 py-3 text-sm font-extrabold text-gray-800 hover:bg-gray-50 active:bg-gray-100 touch-manipulation"
            >
              <Newspaper className="h-5 w-5 text-blue-600" />
              <span>Blog & Updates</span>
            </Link>

            <Link
              href="/typing"
              onClick={() => setMobileMenuOpen(false)}
              className="flex items-center gap-2.5 rounded-xl px-4 py-3 text-sm font-extrabold text-gray-800 hover:bg-gray-50 active:bg-gray-100 touch-manipulation"
            >
              <Keyboard className="h-5 w-5 text-blue-600" />
              <span>Typing Test</span>
            </Link>

          </div>

          {/* User Auth Section */}
          <div className="pt-3 border-t border-gray-200 space-y-2">
            {user ? (
              <>
                <Link
                  href="/dashboard"
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center gap-3 rounded-xl px-4 py-2.5 text-sm font-bold text-gray-800 hover:bg-gray-100"
                >
                  <LayoutDashboard className="h-5 w-5 text-gray-500" />
                  User Dashboard
                </Link>
                {isAdmin && (
                  <Link
                    href="/admin"
                    onClick={() => setMobileMenuOpen(false)}
                    className="flex items-center gap-3 rounded-xl bg-amber-50 px-4 py-2.5 text-sm font-black text-amber-800"
                  >
                    <ShieldCheck className="h-5 w-5 text-amber-600" />
                    Admin Control Center
                  </Link>
                )}
                <button
                  onClick={() => {
                    setMobileMenuOpen(false);
                    handleLogout();
                  }}
                  className="flex w-full items-center gap-3 rounded-xl px-4 py-2.5 text-sm font-bold text-red-600 hover:bg-red-50"
                >
                  <LogOut className="h-5 w-5" />
                  Log Out
                </button>
              </>
            ) : (
              <Link
                href="/login"
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 px-4 py-3 text-sm font-black text-white shadow-md"
              >
                <LogIn className="h-4 w-4" />
                Login / Sign Up
              </Link>
            )}
          </div>
        </div>
      )}

      {/* End Header */}
    </header>
  );
}
