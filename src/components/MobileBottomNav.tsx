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
  Zap
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
      label: "Tests",
      href: "/papers",
      icon: Trophy,
      isActive: pathname?.startsWith("/papers") || pathname?.startsWith("/mocks"),
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
      className="fixed bottom-0 left-0 right-0 z-50 flex lg:hidden items-center justify-around bg-white/95 backdrop-blur-lg border-t border-gray-200/90 py-1.5 px-2 shadow-[0_-4px_20px_rgba(0,0,0,0.06)] touch-manipulation select-none"
    >
      {navItems.map((item) => {
        const Icon = item.icon;
        const active = item.isActive;

        return (
          <Link
            key={item.label}
            href={item.href}
            prefetch={true}
            className={`flex flex-col items-center justify-center flex-1 min-h-[48px] py-1 rounded-xl transition-all duration-150 active:scale-95 touch-manipulation cursor-pointer ${
              active
                ? "text-blue-700 font-extrabold"
                : "text-gray-500 font-medium hover:text-gray-900"
            }`}
          >
            <div className="relative">
              <Icon 
                className={`h-5 w-5 transition-transform duration-150 ${
                  active ? "scale-110 text-blue-700" : "text-gray-500"
                }`} 
              />
              {active && (
                <span className="absolute -top-1 -right-1.5 h-2 w-2 rounded-full bg-blue-600 animate-pulse" />
              )}
            </div>
            <span className={`text-[10px] mt-0.5 tracking-tight ${active ? "font-black text-blue-700" : "text-gray-500"}`}>
              {item.label}
            </span>
          </Link>
        );
      })}
    </nav>
  );
}
