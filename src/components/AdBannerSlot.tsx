"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  ExternalLink,
  Sparkles,
  Target,
  Send,
  Keyboard,
  Trophy,
  BookOpen,
  Flame,
  Info,
  X
} from "lucide-react";
import { SiteAdsConfig, AdSlotConfig } from "@/lib/ads-types";

interface AdBannerSlotProps {
  slotKey: string;
  className?: string;
  /**
   * Optional inline fallback or override
   */
  fallback?: React.ReactNode;
}

// Global cached config to prevent re-fetching across multiple slots on the same page
let memoryCachedConfig: SiteAdsConfig | null = null;
let isFetchingPromise: Promise<SiteAdsConfig | null> | null = null;

async function fetchAdsConfig(): Promise<SiteAdsConfig | null> {
  if (memoryCachedConfig) return memoryCachedConfig;
  if (isFetchingPromise) return isFetchingPromise;

  isFetchingPromise = fetch("/api/ads")
    .then((res) => res.json())
    .then((data) => {
      if (data.success && data.config) {
        memoryCachedConfig = data.config;
        return data.config;
      }
      return null;
    })
    .catch(() => null)
    .finally(() => {
      isFetchingPromise = null;
    });

  return isFetchingPromise;
}

export default function AdBannerSlot({ slotKey, className = "", fallback = null }: AdBannerSlotProps) {
  const [config, setConfig] = useState<SiteAdsConfig | null>(memoryCachedConfig);
  const [loaded, setLoaded] = useState(!!memoryCachedConfig);
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    let isMounted = true;
    if (!memoryCachedConfig) {
      fetchAdsConfig().then((cfg) => {
        if (isMounted) {
          if (cfg) setConfig(cfg);
          setLoaded(true);
        }
      });
    } else {
      setConfig(memoryCachedConfig);
      setLoaded(true);
    }

    return () => {
      isMounted = false;
    };
  }, []);

  if (dismissed) return null;
  if (!loaded || !config) return null;
  if (!config.enabledGlobally) return null;

  const slot: AdSlotConfig | undefined = config.slots?.[slotKey];
  if (!slot || !slot.enabled) {
    return <>{fallback}</>;
  }

  // ── 1. PROMO CARD (Interactive Modern Preset Card) ──
  if (slot.type === "promo_card" && slot.promoCard) {
    const card = slot.promoCard;
    const theme = card.theme || "indigo";

    const themeStyles = {
      indigo: {
        wrapper: "border-indigo-200/90 bg-gradient-to-r from-indigo-50/80 via-blue-50/50 to-indigo-100/70 hover:border-indigo-300",
        badge: "bg-indigo-600/10 text-indigo-700 border-indigo-300/60",
        iconBox: "bg-indigo-600 text-white shadow-indigo-200",
        btn: "bg-indigo-600 hover:bg-indigo-700 text-white shadow-indigo-200",
        subtext: "text-indigo-950/70",
      },
      emerald: {
        wrapper: "border-emerald-200/90 bg-gradient-to-r from-emerald-50/80 via-teal-50/50 to-green-100/70 hover:border-emerald-300",
        badge: "bg-emerald-600/10 text-emerald-800 border-emerald-300/60",
        iconBox: "bg-emerald-600 text-white shadow-emerald-200",
        btn: "bg-emerald-600 hover:bg-emerald-700 text-white shadow-emerald-200",
        subtext: "text-emerald-950/70",
      },
      amber: {
        wrapper: "border-amber-200/90 bg-gradient-to-r from-amber-50/80 via-orange-50/50 to-yellow-100/70 hover:border-amber-300",
        badge: "bg-amber-600/15 text-amber-900 border-amber-300/60",
        iconBox: "bg-amber-500 text-slate-950 shadow-amber-200",
        btn: "bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-slate-950 shadow-amber-200 font-black",
        subtext: "text-amber-950/70",
      },
      blue: {
        wrapper: "border-sky-200/90 bg-gradient-to-r from-sky-50/80 via-blue-50/50 to-cyan-100/70 hover:border-sky-300",
        badge: "bg-sky-600/10 text-sky-800 border-sky-300/60",
        iconBox: "bg-sky-500 text-white shadow-sky-200",
        btn: "bg-sky-600 hover:bg-sky-700 text-white shadow-sky-200",
        subtext: "text-sky-950/70",
      },
      rose: {
        wrapper: "border-rose-200/90 bg-gradient-to-r from-rose-50/80 via-pink-50/50 to-red-100/70 hover:border-rose-300",
        badge: "bg-rose-600/10 text-rose-800 border-rose-300/60",
        iconBox: "bg-rose-600 text-white shadow-rose-200",
        btn: "bg-rose-600 hover:bg-rose-700 text-white shadow-rose-200",
        subtext: "text-rose-950/70",
      },
      dark: {
        wrapper: "border-slate-800 bg-gradient-to-r from-slate-900 via-gray-900 to-slate-950 text-white hover:border-slate-700",
        badge: "bg-amber-400/20 text-amber-300 border-amber-400/40",
        iconBox: "bg-amber-500 text-slate-950 shadow-black",
        btn: "bg-amber-500 hover:bg-amber-400 text-slate-950 shadow-black font-black",
        subtext: "text-slate-300",
      },
    }[theme];

    function renderIcon() {
      switch (card.icon) {
        case "target":
          return <Target className="h-5 w-5" />;
        case "telegram":
          return <Send className="h-5 w-5" />;
        case "keyboard":
          return <Keyboard className="h-5 w-5" />;
        case "trophy":
          return <Trophy className="h-5 w-5" />;
        case "book":
          return <BookOpen className="h-5 w-5" />;
        case "flame":
          return <Flame className="h-5 w-5" />;
        default:
          return <Sparkles className="h-5 w-5" />;
      }
    }

    const isInternal = card.targetUrl.startsWith("/") || card.targetUrl.startsWith("#");

    const ActionButton = (
      <span className={`inline-flex items-center justify-center gap-1.5 w-full sm:w-auto rounded-xl px-4 py-2 text-xs font-bold shadow-xs active:scale-98 transition-all shrink-0 cursor-pointer ${themeStyles.btn}`}>
        <span>{card.ctaText || "Check It Out ➔"}</span>
        {!isInternal && <ExternalLink className="h-3.5 w-3.5" />}
      </span>
    );

    return (
      <div
        className={`w-full overflow-hidden rounded-2xl border p-3.5 sm:p-4.5 shadow-2xs transition-all hover:shadow-md ${themeStyles.wrapper} ${className}`}
      >
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 sm:gap-4">
          <div className="flex items-start sm:items-center gap-3 min-w-0">
            <div className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl shadow-xs font-black ${themeStyles.iconBox}`}>
              {renderIcon()}
            </div>

            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 flex-wrap mb-1">
                {card.badge && (
                  <span className={`inline-flex items-center gap-1 rounded-md px-2 py-0.5 text-[10px] font-black uppercase tracking-wider border ${themeStyles.badge}`}>
                    <span>{card.badge}</span>
                  </span>
                )}
                <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-widest">
                  Featured
                </span>
              </div>

              <h4 className="text-xs sm:text-sm font-black text-slate-900 leading-snug">
                {card.title}
              </h4>

              {card.subtitle && (
                <p className={`text-[11px] sm:text-xs leading-snug line-clamp-1 mt-0.5 font-medium ${themeStyles.subtext}`}>
                  {card.subtitle}
                </p>
              )}
            </div>
          </div>

          <div className="w-full sm:w-auto shrink-0 pt-1 sm:pt-0">
            {isInternal ? (
              <Link href={card.targetUrl} className="block w-full sm:w-auto">
                {ActionButton}
              </Link>
            ) : (
              <a
                href={card.targetUrl}
                target="_blank"
                rel="noopener noreferrer sponsored"
                className="block w-full sm:w-auto"
              >
                {ActionButton}
              </a>
            )}
          </div>
        </div>
      </div>
    );
  }

  // ── 2. AFFILIATE BANNER (Books, Courses, Equipment) ──
  if (slot.type === "affiliate" && slot.affiliateBanner) {
    const banner = slot.affiliateBanner;
    return (
      <div
        className={`w-full overflow-hidden rounded-2xl border border-amber-200/90 bg-gradient-to-r from-amber-50/80 via-orange-50/40 to-amber-100/70 p-3 sm:p-4 shadow-2xs transition-all hover:border-amber-300 hover:shadow-md ${className}`}
      >
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3.5">
          {/* Left: Thumbnail & Content */}
          <div className="flex items-center gap-3.5 w-full sm:w-auto">
            {banner.imageUrl && (
              <div className="relative h-14 w-14 sm:h-16 sm:w-16 shrink-0 overflow-hidden rounded-xl border border-amber-200 bg-white shadow-2xs">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={banner.imageUrl}
                  alt={banner.title}
                  className="h-full w-full object-cover"
                  loading="lazy"
                />
              </div>
            )}

            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 flex-wrap mb-1">
                {banner.badge && (
                  <span className="inline-flex items-center gap-1 rounded-md bg-amber-500/15 px-2 py-0.5 text-[10px] font-black uppercase tracking-wider text-amber-900 border border-amber-300/60">
                    <Sparkles className="h-2.5 w-2.5 text-amber-600" />
                    <span>{banner.badge}</span>
                  </span>
                )}
                <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-widest">
                  Sponsored Partner
                </span>
              </div>

              <h4 className="text-xs sm:text-sm font-black text-slate-900 leading-tight truncate">
                {banner.title}
              </h4>

              {banner.subtitle && (
                <p className="text-[11px] sm:text-xs text-slate-600 leading-snug line-clamp-1 mt-0.5 font-medium">
                  {banner.subtitle}
                </p>
              )}
            </div>
          </div>

          {/* Right: CTA button */}
          <div className="w-full sm:w-auto shrink-0">
            <a
              href={banner.targetUrl}
              target="_blank"
              rel={banner.relSponsored !== false ? "noopener noreferrer sponsored" : "noopener noreferrer"}
              className="flex items-center justify-center gap-1.5 w-full sm:w-auto rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 px-4 py-2 text-xs font-black text-slate-950 shadow-xs hover:from-amber-600 hover:to-orange-600 active:scale-98 transition-all"
            >
              <span>{banner.ctaText || "Check Offer ➔"}</span>
              <ExternalLink className="h-3.5 w-3.5" />
            </a>
          </div>
        </div>
      </div>
    );
  }

  // ── 3. GOOGLE ADSENSE UNIT ──
  if (slot.type === "adsense") {
    const pubId = config.publisherId || process.env.NEXT_PUBLIC_ADSENSE_ID;
    return (
      <div className={`w-full overflow-hidden rounded-2xl border border-slate-200 bg-slate-50/80 p-2.5 sm:p-3 text-center ${className}`}>
        <div className="flex items-center justify-between text-[9px] font-bold uppercase tracking-wider text-slate-400 mb-1.5 px-1">
          <span>Advertisement</span>
          <span className="flex items-center gap-1 text-[8px] text-slate-400">
            <span>AdChoices</span>
            <Info className="h-2.5 w-2.5 text-blue-500" />
          </span>
        </div>
        <div className="min-h-[90px] flex items-center justify-center bg-white rounded-xl border border-slate-200/60 p-2 text-slate-400 text-xs shadow-2xs">
          {pubId && slot.adsenseSlotId ? (
            <ins
              className="adsbygoogle"
              style={{ display: "block", width: "100%" }}
              data-ad-client={pubId}
              data-ad-slot={slot.adsenseSlotId}
              data-ad-format="auto"
              data-full-width-responsive="true"
            />
          ) : (
            <div className="py-3 text-center">
              <p className="text-xs font-bold text-slate-700">Google AdSense Responsive Unit</p>
              <p className="text-[10px] text-slate-400 mt-0.5">Slot ID: {slot.adsenseSlotId || "Configured in Admin"}</p>
            </div>
          )}
        </div>
      </div>
    );
  }

  // ── 4. CUSTOM HTML / SCRIPT EMBED ──
  if (slot.type === "html" && slot.customHtml) {
    return (
      <div
        className={`w-full overflow-hidden rounded-2xl ${className}`}
        dangerouslySetInnerHTML={{ __html: slot.customHtml }}
      />
    );
  }

  return null;
}
