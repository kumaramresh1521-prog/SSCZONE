"use client";

import React from "react";
import { usePathname } from "next/navigation";
import UserNav from "@/components/UserNav";
import Footer from "@/components/Footer";
import MobileBottomNav from "@/components/MobileBottomNav";

export default function MainLayoutWrapper({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isAdminRoute = pathname?.startsWith("/admin");
  const isTestRoute = pathname?.startsWith("/take-test");

  if (isAdminRoute) {
    return <main className="min-h-screen bg-slate-900 text-slate-100 font-sans">{children}</main>;
  }

  // Standalone immersive CBT exam hall: No website UserNav, Footer, or MobileBottomNav interference!
  if (isTestRoute) {
    return <main className="h-screen w-full max-w-full overflow-hidden bg-[#F0F2F5] text-slate-900 font-sans">{children}</main>;
  }

  return (
    <div className="min-h-screen w-full max-w-full overflow-x-clip bg-slate-50 text-slate-900 antialiased font-sans flex flex-col justify-between">
      <UserNav />
      <main className="flex-1 w-full max-w-full">{children}</main>
      <Footer />
      <MobileBottomNav />
    </div>
  );
}
