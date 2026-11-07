"use client";

import { useEffect, useMemo, useState } from "react";
import { supabase } from "@/lib/supabase";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { 
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
  ExternalLink
} from "lucide-react";
import NavigationIcon from "@/components/NavigationIcon";
import { 
  MenuItemConfig, 
  DEFAULT_NAVIGATION_CONFIG 
} from "@/lib/navigation-store";

// In-memory module cache to avoid redundant fetches on every client navigation
let memoryNavCache: MenuItemConfig[] | null = null;
let memoryExamsCache: any[] | null = null;

export default function UserNav() {
  const [user, setUser] = useState<any>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  
  // Dynamic Navigation Configuration
  const [navItems, setNavItems] = useState<MenuItemConfig[]>(memoryNavCache || DEFAULT_NAVIGATION_CONFIG.items);
  const [activeDropdownId, setActiveDropdownId] = useState<string | null>(null);
  const [mobileOpenDropdowns, setMobileOpenDropdowns] = useState<Record<string, boolean>>({});

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
  
  const [sscSubExams, setSscSubExams] = useState<any[]>(memoryExamsCache || []);

  const pathname = usePathname();
  const router = useRouter();

  // Load Dynamic Navigation from API
  useEffect(() => {
    setMounted(true);

    // Fetch live navigation config (use memory cache if already loaded)
    if (!memoryNavCache) {
      fetch("/api/navigation")
        .then((r) => r.json())
        .then((data) => {
          if (data && Array.isArray(data.items) && data.items.length > 0) {
            memoryNavCache = data.items;
            setNavItems(data.items);
          }
        })
        .catch(() => {});
    }

    // Read cached tickers
    const saved = localStorage.getItem("ssczone_live_tickers");
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) setTickers(parsed);
      } catch (e) {}
    }

    // User auth & exams fetch
    (async () => {
      const { data: { session } } = await supabase.auth.getSession();
      const curUser = session?.user || null;
      setUser(curUser);
      if (curUser) {
        const { data } = await supabase
          .from("profiles")
          .select("is_admin")
          .eq("id", curUser.id)
          .maybeSingle();
        setIsAdmin(data?.is_admin || false);
      }

      // Fetch active exams (use memory cache if already fetched)
      if (memoryExamsCache) {
        setSscSubExams(memoryExamsCache);
      } else {
        const { data: activeExams } = await supabase
          .from("exams")
          .select("id, title, slug, description")
          .eq("is_active", true)
          .order("sort_order");
          
        if (activeExams) {
          const mapped = activeExams.map(ex => ({
            name: ex.title,
            slug: ex.slug,
            desc: ex.description || "",
            badge: ""
          }));
          memoryExamsCache = mapped;
          setSscSubExams(mapped);
        }
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

  // Filter only active menu items, sorted
  const activeNavItems = useMemo(() => {
    return navItems
      .filter((m) => m.is_active)
      .sort((a, b) => a.sort_order - b.sort_order);
  }, [navItems]);

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

        {/* Dynamic Desktop Main Navigation Bar */}
        <nav className="hidden xl:flex items-center gap-1 xl:gap-1.5 shrink-0">
          {activeNavItems.map((menu) => {
            if (menu.is_dropdown) {
              const isExams = menu.id === "exams";
              const isOpen = activeDropdownId === menu.id;
              const isPathActive = menu.href && menu.href !== "/" ? pathname.startsWith(menu.href) : false;
              const activeSubItems = (menu.sub_items || [])
                .filter((s) => s.is_active)
                .sort((a, b) => a.sort_order - b.sort_order);

              return (
                <div
                  key={menu.id}
                  className="relative"
                  onMouseEnter={() => setActiveDropdownId(menu.id)}
                  onMouseLeave={() => setActiveDropdownId(null)}
                >
                  <button
                    onClick={() => setActiveDropdownId(isOpen ? null : menu.id)}
                    className={`flex items-center gap-1.5 rounded-xl px-2.5 2xl:px-3 py-1.5 2xl:py-2 text-xs 2xl:text-sm font-bold transition-all cursor-pointer ${
                      isPathActive || (isExams && pathname.startsWith("/exams"))
                        ? "bg-blue-50/90 text-blue-700 shadow-2xs border border-blue-100"
                        : "text-slate-700 hover:bg-slate-100/80 hover:text-blue-700"
                    }`}
                  >
                    <NavigationIcon name={menu.icon} className="h-4 w-4 text-blue-600" />
                    <span>{menu.name}</span>
                    {menu.badge && (
                      <span className="hidden 2xl:inline rounded-full bg-amber-400 text-slate-950 text-[9px] font-black px-1.5 py-0.5 uppercase tracking-wide shrink-0">
                        {menu.badge}
                      </span>
                    )}
                    <ChevronDown className={`h-3.5 w-3.5 text-slate-400 transition-transform duration-200 ${isOpen ? "rotate-180 text-blue-600" : ""}`} />
                  </button>

                  {isOpen && (
                    <div className="absolute left-0 top-full pt-2 w-72 z-50 animate-in fade-in slide-in-from-top-2 duration-150">
                      <div className="rounded-2xl border border-slate-200/90 bg-white/98 backdrop-blur-xl p-2.5 shadow-2xl shadow-slate-900/10 space-y-1 ring-1 ring-black/5">
                        {isExams ? (
                          <>
                            <div className="flex items-center justify-between border-b border-slate-100 pb-2 px-2">
                              <span className="text-[11px] font-black uppercase text-slate-400 tracking-wider">Select SSC Target Exam</span>
                              <Link href="/exams" onClick={() => setActiveDropdownId(null)} className="text-[11px] font-black text-blue-600 hover:text-blue-800 transition-colors">View All →</Link>
                            </div>
                            <div className="grid grid-cols-1 gap-1 max-h-96 overflow-y-auto pr-1 custom-scrollbar">
                              {sscSubExams.map((subEx) => (
                                <Link
                                  key={subEx.slug}
                                  href={`/exams/${subEx.slug}`}
                                  onClick={() => setActiveDropdownId(null)}
                                  className="group flex items-center justify-between rounded-xl px-3 py-2 hover:bg-blue-50/80 border border-transparent hover:border-blue-100 transition-all"
                                >
                                  <div>
                                    <span className="text-xs font-bold text-slate-900 group-hover:text-blue-700 transition-colors">
                                      {subEx.name}
                                    </span>
                                    {subEx.desc && <p className="text-[10px] text-slate-400 line-clamp-1">{subEx.desc}</p>}
                                  </div>
                                  <ChevronRight className="h-3.5 w-3.5 text-slate-300 group-hover:text-blue-600 group-hover:translate-x-0.5 transition-all shrink-0" />
                                </Link>
                              ))}
                            </div>
                          </>
                        ) : (
                          <div className="space-y-1">
                            {activeSubItems.map((sub) => (
                              <Link
                                key={sub.id}
                                href={sub.href}
                                target={sub.target || "_self"}
                                onClick={() => setActiveDropdownId(null)}
                                className="group flex items-center justify-between rounded-xl px-3 py-2 hover:bg-slate-50 transition-all"
                              >
                                <div className="flex items-center gap-2.5">
                                  <div className="bg-slate-100 group-hover:bg-blue-50 p-1.5 rounded-lg text-slate-500 group-hover:text-blue-600 transition-colors">
                                    <NavigationIcon name={sub.icon} className="h-4 w-4" />
                                  </div>
                                  <div>
                                    <div className="flex items-center gap-1.5">
                                      <span className="text-xs font-semibold text-slate-800 group-hover:text-blue-700">
                                        {sub.name}
                                      </span>
                                      {sub.badge && (
                                        <span className="text-[9px] font-black bg-amber-100 text-amber-900 px-1.5 py-0.2 rounded-full">
                                          {sub.badge}
                                        </span>
                                      )}
                                    </div>
                                  </div>
                                </div>
                                {sub.target === "_blank" && (
                                  <ExternalLink className="h-3 w-3 text-slate-300 group-hover:text-blue-600 shrink-0" />
                                )}
                              </Link>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              );
            }

            // Direct Link Menu Item
            const isLinkActive = pathname === menu.href || (menu.href !== "/" && pathname.startsWith(menu.href || ""));
            const isPapersTab = menu.id === "papers" || menu.href === "/papers";

            return (
              <Link
                key={menu.id}
                href={menu.href || "#"}
                target={menu.target || "_self"}
                className={`flex items-center gap-1.5 rounded-xl px-2.5 2xl:px-3 py-1.5 2xl:py-2 text-xs 2xl:text-sm font-bold transition-all relative cursor-pointer ${
                  isLinkActive
                    ? isPapersTab
                      ? "bg-blue-600 text-white shadow-sm shadow-blue-500/20"
                      : "bg-blue-50/90 text-blue-700 shadow-2xs border border-blue-100"
                    : "text-slate-800 hover:bg-blue-50/80 hover:text-blue-700"
                }`}
              >
                <NavigationIcon
                  name={menu.icon}
                  className={`h-4 w-4 ${isLinkActive && isPapersTab ? "text-white" : "text-blue-600"}`}
                />
                <span>{menu.name}</span>
                {menu.badge && (
                  <span
                    className={`rounded-full text-[9px] font-black px-1.5 py-0.5 uppercase tracking-wide shrink-0 ${
                      isPapersTab && isLinkActive
                        ? "bg-amber-400 text-slate-950"
                        : "bg-amber-100 text-amber-900 border border-amber-300"
                    }`}
                  >
                    {menu.badge}
                  </span>
                )}
                {menu.target === "_blank" && <ExternalLink className="h-2.5 w-2.5 text-slate-400" />}
              </Link>
            );
          })}
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
            {activeNavItems.map((menu) => {
              if (menu.is_dropdown) {
                const isExams = menu.id === "exams";
                const isOpen = Boolean(mobileOpenDropdowns[menu.id]);
                const activeSubItems = (menu.sub_items || [])
                  .filter((s) => s.is_active)
                  .sort((a, b) => a.sort_order - b.sort_order);

                return (
                  <div key={menu.id}>
                    <button 
                      type="button"
                      onClick={() => setMobileOpenDropdowns((prev) => ({ ...prev, [menu.id]: !prev[menu.id] }))}
                      className="flex w-full items-center justify-between rounded-xl px-4 py-3 text-sm font-extrabold text-gray-800 hover:bg-gray-50 active:bg-gray-100 touch-manipulation cursor-pointer select-none"
                    >
                      <div className="flex items-center gap-2.5">
                        <NavigationIcon name={menu.icon} className="h-5 w-5 text-blue-600" />
                        <span>{menu.name}</span>
                        {menu.badge && (
                          <span className="text-[9px] font-black bg-amber-400 text-slate-950 px-1.5 py-0.2 rounded-full">
                            {menu.badge}
                          </span>
                        )}
                      </div>
                      <ChevronDown className={`h-4 w-4 text-gray-500 transition-transform ${isOpen ? 'rotate-180 text-blue-600' : ''}`} />
                    </button>
                    {isOpen && (
                      <div className="ml-4 mt-1 border-l-2 border-blue-200 pl-2 space-y-1">
                        {isExams ? (
                          sscSubExams.map((subEx) => (
                            <Link
                              key={subEx.slug}
                              href={`/exams/${subEx.slug}`}
                              onClick={() => setMobileMenuOpen(false)}
                              className="flex items-center justify-between rounded-xl px-3 py-2 text-sm font-bold text-gray-800 hover:bg-blue-50 active:bg-blue-100 hover:text-blue-700 touch-manipulation"
                            >
                              {subEx.name}
                            </Link>
                          ))
                        ) : (
                          activeSubItems.map((sub) => (
                            <Link
                              key={sub.id}
                              href={sub.href}
                              target={sub.target || "_self"}
                              onClick={() => setMobileMenuOpen(false)}
                              className="flex items-center justify-between rounded-xl px-3 py-2 text-sm font-bold text-gray-800 hover:bg-blue-50 active:bg-blue-100 hover:text-blue-700 touch-manipulation"
                            >
                              <div className="flex items-center gap-2">
                                <NavigationIcon name={sub.icon} className="h-4 w-4 text-slate-500" />
                                <span>{sub.name}</span>
                              </div>
                              {sub.badge && (
                                <span className="text-[9px] font-black bg-amber-100 text-amber-900 px-1.5 py-0.2 rounded-full">
                                  {sub.badge}
                                </span>
                              )}
                            </Link>
                          ))
                        )}
                      </div>
                    )}
                  </div>
                );
              }

              return (
                <Link
                  key={menu.id}
                  href={menu.href || "#"}
                  target={menu.target || "_self"}
                  onClick={() => setMobileMenuOpen(false)}
                  className={`flex items-center justify-between rounded-xl px-4 py-3 text-sm font-extrabold transition-all ${
                    menu.id === "papers"
                      ? "bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-md shadow-blue-500/20 active:scale-95 mb-1"
                      : "text-gray-800 hover:bg-gray-50 active:bg-gray-100"
                  } touch-manipulation`}
                >
                  <div className="flex items-center gap-2.5">
                    <NavigationIcon
                      name={menu.icon}
                      className={`h-5 w-5 ${menu.id === "papers" ? "text-amber-300" : "text-blue-600"}`}
                    />
                    <span>{menu.name}</span>
                  </div>
                  {menu.badge && (
                    <span
                      className={`rounded-md text-[10px] font-black px-2 py-0.5 ${
                        menu.id === "papers"
                          ? "bg-amber-400 text-slate-950"
                          : "bg-amber-100 text-amber-900 border border-amber-300"
                      }`}
                    >
                      {menu.badge}
                    </span>
                  )}
                </Link>
              );
            })}
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
