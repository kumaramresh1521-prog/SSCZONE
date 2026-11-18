"use client";

import React from "react";
import { ShieldAlert } from "lucide-react";
import { TopDisclaimerConfig, DEFAULT_STATIC_PAGES_CONFIG } from "@/lib/static-pages-store";

export default function TopGovernmentDisclaimer({
  config = DEFAULT_STATIC_PAGES_CONFIG.topDisclaimer,
}: {
  config?: TopDisclaimerConfig;
}) {
  if (!config || config.enabled === false) {
    return null;
  }

  return (
    <aside
      aria-label="Government Affiliation Disclaimer"
      className="w-full max-w-full overflow-x-clip bg-white text-slate-600 border-b border-slate-200/90 py-1.5 px-3 sm:px-6 relative z-50 text-[11px] sm:text-xs antialiased shadow-2xs"
    >
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-center gap-1.5 md:gap-2 text-center leading-snug">
        <div className="inline-flex items-center gap-1.5 shrink-0">
          <ShieldAlert className="h-3.5 w-3.5 text-amber-500" />
          <span className="font-extrabold uppercase tracking-wider text-slate-700 text-[10px] sm:text-[11px] bg-slate-100 border border-slate-200/80 px-2 py-0.5 rounded-full">
            {config.badgeText || "Disclaimer"}
          </span>
        </div>

        <p className="text-slate-600 font-medium text-center">
          {config.text ||
            "This website & app is an independent educational portal and is NOT affiliated with, authorized, endorsed by, or in any way officially connected with the Staff Selection Commission (SSC), Government of India, or any government entity."}
        </p>
      </div>
    </aside>
  );
}
