"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Volume2, Sparkles, ChevronRight, Zap } from "lucide-react";

export default function LiveTickerBar() {
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

  useEffect(() => {
    setMounted(true);
    const saved = localStorage.getItem("ssczone_live_tickers");
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          setTickers(parsed);
        }
      } catch (e) {}
    }
  }, []);

  if (!mounted) return null;
  const activeItems = tickers.filter((t) => t.is_active);
  if (activeItems.length === 0) return null;

  return (
    <div className="bg-gradient-to-r from-slate-900 via-blue-950 to-slate-900 text-white border-b border-blue-500/20 py-2 px-4 overflow-hidden">
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-3 text-xs font-bold">
        {/* Left Label */}
        <div className="flex items-center gap-2 shrink-0 bg-blue-600/90 text-white px-2.5 py-1 rounded-lg shadow-xs">
          <Zap className="h-3.5 w-3.5 text-amber-300 fill-amber-300 animate-pulse" />
          <span className="uppercase tracking-wider text-[10px] font-black">Live Alerts</span>
        </div>

        {/* Ticker Items Scroller */}
        <div className="flex-1 overflow-x-auto whitespace-nowrap custom-scrollbar py-0.5">
          <div className="inline-flex items-center gap-4">
            {activeItems.map((t) => (
              <Link
                key={t.id}
                href={t.link || "/exams"}
                className="inline-flex items-center gap-2 rounded-lg bg-white/10 hover:bg-white/20 border border-white/10 px-3 py-1 text-xs font-semibold text-blue-100 hover:text-white transition-all shrink-0"
              >
                <span className="rounded-md bg-red-600 px-1.5 py-0.5 text-[9px] font-black text-white">
                  {t.badge || "LIVE"}
                </span>
                <span>{t.title}</span>
                <ChevronRight className="h-3.5 w-3.5 text-amber-400" />
              </Link>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
