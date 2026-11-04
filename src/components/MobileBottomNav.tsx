"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { 
  Home, 
  Target, 
  Trophy, 
  BookMarked, 
  LayoutDashboard, 
  LogIn,
  FileText
} from "lucide-react";
import { supabase } from "@/lib/supabase";

export default function MobileBottomNav() {
  const pathname = usePathname();
  const [user, setUser] = useState<any>(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user || null);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user || null);
    });

    return () => subscription.unsubscribe();
  }, []);

  // Hide bottom nav on test-taking full screen pages so it doesn't distract students
  if (pathname?.startsWith("/take-test/")) {
    return null;
  }

  const navItems = [
    {
      label: "Home",
      href: "/",
      icon: Home,
      isActive: pathname === "/",
    },
    {
      label: "Exams",
      href: "/exams",
      icon: Target,
      isActive: pathname?.startsWith("/exams"),
    },
    {
      label: "PYQ Papers",
      href: "/papers",
      icon: FileText,
      isActive: pathname?.startsWith("/papers"),
    },
    {
      label: "Books",
      href: "/books",
      icon: BookMarked,
      isActive: pathname?.startsWith("/books"),
    },
    {
      label: user ? "Dashboard" : "Login",
      href: user ? "/dashboard" : "/login",
      icon: user ? LayoutDashboard : LogIn,
      isActive: pathname?.startsWith("/dashboard") || pathname?.startsWith("/login"),
    },
  ];

  return (
    <nav 
      aria-label="Mobile Navigation Bar"
      className="fixed bottom-0 left-0 right-0 z-50 flex lg:hidden items-center justify-around bg-white/92 backdrop-blur-2xl border-t border-slate-200/80 py-2 px-3 shadow-[0_-8px_30px_rgba(0,0,0,0.08)] touch-manipulation select-none pb-safe"
    >
      {navItems.map((item) => {
        const Icon = item.icon;
        const active = item.isActive;

        return (
          <Link
            key={item.label}
            href={item.href}
            prefetch={true}
            className={`relative flex flex-col items-center justify-center flex-1 min-h-[46px] py-1 rounded-2xl transition-all duration-200 active:scale-90 touch-manipulation cursor-pointer ${
              active
                ? "text-blue-700 font-black"
                : "text-slate-500 font-semibold hover:text-slate-900"
            }`}
          >
            {active && (
              <span className="absolute inset-0 rounded-2xl bg-blue-50/80 -z-10 scale-95 border border-blue-100/60" />
            )}
            <div className="relative">
              <Icon 
                className={`h-5 w-5 transition-transform duration-150 ${
                  active ? "text-blue-600 stroke-[2.2]" : "text-slate-400 stroke-[1.8]"
                }`} 
              />
            </div>
            <span className={`text-[10px] mt-1 tracking-tight ${active ? "font-black text-blue-700" : "text-slate-500"}`}>
              {item.label}
            </span>
          </Link>
        );
      })}
    </nav>
  );
}
