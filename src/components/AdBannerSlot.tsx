"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { ExternalLink, Sparkles, Tag } from "lucide-react";
import { SiteAdsConfig, AdSlotConfig } from "@/lib/ads-types";

interface AdBannerSlotProps {
  slotKey: string;
  className?: string;
  /**
   * Optional inline fallback or override
   */
  fallback?: React.ReactNode;
}

export default function AdBannerSlot({ slotKey, className = "", fallback = null }: AdBannerSlotProps) {
  const [config, setConfig] = useState<SiteAdsConfig | null>(null);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    let isMounted = true;
    fetch("/api/ads")
      .then((res) => res.json())
      .then((data) => {
        if (isMounted && data.success && data.config) {
          setConfig(data.config);
        }
      })
      .catch(() => {
        // Silently handle error
      })
      .finally(() => {
        if (isMounted) setLoaded(true);
      });

    return () => {
      isMounted = false;
    };
  }, []);

  if (!loaded || !config) return null;
  if (!config.enabledGlobally) return null;

  const slot: AdSlotConfig | undefined = config.slots?.[slotKey];
  if (!slot || !slot.enabled) {
    return <>{fallback}</>;
  }

  // Type 1: Affiliate Banner
  if (slot.type === "affiliate" && slot.affiliateBanner) {
    const banner = slot.affiliateBanner;
    return (
      <div
        className={`w-full overflow-hidden rounded-2xl border border-amber-200/80 bg-gradient-to-r from-amber-50/70 via-orange-50/40 to-amber-100/60 p-3 sm:p-4 shadow-xs transition-all hover:border-amber-300 hover:shadow-md ${className}`}
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
                  <span className="inline-flex items-center gap-1 rounded-md bg-amber-500/15 px-2 py-0.5 text-[10px] font-black uppercase tracking-wider text-amber-800 border border-amber-300/60">
                    <Sparkles className="h-2.5 w-2.5 text-amber-600" />
                    <span>{banner.badge}</span>
                  </span>
                )}
                <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-widest">
                  Sponsored Partner
                </span>
              </div>

              <h4 className="text-xs sm:text-sm font-bold text-slate-900 leading-tight truncate">
                {banner.title}
              </h4>

              {banner.subtitle && (
                <p className="text-[11px] sm:text-xs text-slate-600 leading-snug line-clamp-1 mt-0.5">
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
              <span>{banner.ctaText || "Check Offer"}</span>
              <ExternalLink className="h-3.5 w-3.5" />
            </a>
          </div>
        </div>
      </div>
    );
  }

  // Type 2: Google AdSense Unit
  if (slot.type === "adsense" && slot.adsenseSlotId) {
    return (
      <div className={`w-full overflow-hidden rounded-xl border border-slate-200 bg-slate-50/70 p-2 sm:p-3 text-center ${className}`}>
        <div className="text-[9px] font-bold uppercase tracking-wider text-slate-400 mb-1.5">
          Advertisement
        </div>
        <div className="min-h-[90px] flex items-center justify-center bg-white rounded-lg border border-slate-200/60 p-2 text-slate-400 text-xs">
          {/* Standard AdSense Unit Script Hook */}
          <ins
            className="adsbygoogle"
            style={{ display: "block" }}
            data-ad-client={config.publisherId}
            data-ad-slot={slot.adsenseSlotId}
            data-ad-format="auto"
            data-full-width-responsive="true"
          />
          <span className="text-[11px] text-slate-400">
            [Google AdSense Unit: {slot.adsenseSlotId}]
          </span>
        </div>
      </div>
    );
  }

  // Type 3: Custom HTML
  if (slot.type === "html" && slot.customHtml) {
    return (
      <div
        className={`w-full ${className}`}
        dangerouslySetInnerHTML={{ __html: slot.customHtml }}
      />
    );
  }

  return null;
}
