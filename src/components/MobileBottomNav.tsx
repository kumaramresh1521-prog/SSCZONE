"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { 
  Home, 
  FileText, 
  Zap, 
  BrainCircuit, 
  LayoutDashboard, 
  LogIn,
  Target
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
      label: "Papers",
      href: "/papers",
      icon: FileText,
      badge: "2026",
      isActive: pathname?.startsWith("/papers"),
    },
    {
      label: "Daily Quiz",
      href: "/daily-quiz",
      icon: Zap,
      badge: "FREE",
      isActive: pathname?.startsWith("/daily-quiz"),
    },
    {
      label: "Exams",
      href: "/exams",
      icon: Target,
      isActive: pathname?.startsWith("/exams"),
    },
    {
      label: user ? "Profile" : "Login",
      href: user ? "/dashboard" : "/login",
      icon: user ? LayoutDashboard : LogIn,
      isActive: pathname?.startsWith("/dashboard") || pathname?.startsWith("/login"),
    },
  ];

  return (
    <nav 
      aria-label="Mobile Navigation Bar"
      className="fixed bottom-0 left-0 right-0 z-50 flex lg:hidden items-center justify-around bg-white/95 backdrop-blur-2xl border-t border-slate-200/90 py-1.5 px-2 shadow-[0_-8px_30px_rgba(0,0,0,0.08)] touch-manipulation select-none pb-safe"
    >
      {navItems.map((item) => {
        const Icon = item.icon;
        const active = item.isActive;

        return (
          <Link
            key={item.label}
            href={item.href}
            prefetch={true}
            className={`relative flex flex-col items-center justify-center flex-1 min-h-[50px] py-1 rounded-2xl transition-all duration-200 active:scale-90 touch-manipulation cursor-pointer ${
              active
                ? "text-blue-700 font-black"
                : "text-slate-500 font-semibold hover:text-slate-900"
            }`}
          >
            {active && (
              <span className="absolute inset-x-2 inset-y-1 rounded-2xl bg-blue-50/90 -z-10 border border-blue-100" />
            )}

            <div className="relative">
              <Icon 
                className={`h-5 w-5 transition-transform duration-150 ${
                  active ? "text-blue-600 stroke-[2.4] scale-105" : "text-slate-400 stroke-[1.8]"
                }`} 
              />
              {item.badge && (
                <span className={`absolute -top-1.5 -right-3 px-1 py-0.2 rounded-full text-[8px] font-black uppercase tracking-tight ${
                  item.badge === "FREE" ? "bg-emerald-500 text-white" : "bg-amber-400 text-slate-950"
                }`}>
                  {item.badge}
                </span>
              )}
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
