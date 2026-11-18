"use client";

import React from "react";
import { usePathname } from "next/navigation";
import UserNav from "@/components/UserNav";
import Footer from "@/components/Footer";
import MobileBottomNav from "@/components/MobileBottomNav";
import GuestSessionGateModal from "@/components/GuestSessionGateModal";
import AnnouncementModal from "@/components/AnnouncementModal";
import TopGovernmentDisclaimer from "@/components/TopGovernmentDisclaimer";
import { TopDisclaimerConfig } from "@/lib/static-pages-store";

export default function MainLayoutWrapper({
  children,
  topDisclaimer,
}: {
  children: React.ReactNode;
  topDisclaimer?: TopDisclaimerConfig;
}) {
  const pathname = usePathname();
  const isAdminRoute = pathname?.startsWith("/admin");
  const isTestRoute = pathname?.startsWith("/take-test");

  if (isAdminRoute) {
    return <main className="min-h-screen bg-slate-900 text-slate-100 font-sans">{children}</main>;
  }

  // Standalone immersive CBT exam hall: No website UserNav, Footer, or MobileBottomNav interference!
  if (isTestRoute) {
    return (
      <main className="h-screen w-full max-w-full overflow-hidden bg-[#F0F2F5] text-slate-900 font-sans">
        <GuestSessionGateModal />
        {children}
      </main>
    );
  }

  return (
    <div className="min-h-screen w-full max-w-full overflow-x-clip bg-slate-50 text-slate-900 antialiased font-sans flex flex-col justify-between">
      <TopGovernmentDisclaimer config={topDisclaimer} />
      <UserNav />
      <GuestSessionGateModal />
      <AnnouncementModal />
      <main className="flex-1 w-full max-w-full">{children}</main>
      <Footer />
      <MobileBottomNav />
    </div>
  );
}
