"use client";

import { useEffect } from "react";
import { Sparkles, ExternalLink, Info } from "lucide-react";

export default function AdBanner({
  slot,
  format = "auto",
  responsive = "true",
  className = "",
  style = {},
  preview = false // Hidden by default until live AdSense ID is configured
}: {
  slot?: string;
  format?: "auto" | "leaderboard" | "in-feed" | "rectangle";
  responsive?: string;
  className?: string;
  style?: React.CSSProperties;
  preview?: boolean;
}) {
  const adsensePublisherId = process.env.NEXT_PUBLIC_ADSENSE_ID;

  useEffect(() => {
    try {
      if (typeof window !== "undefined" && adsensePublisherId) {
        // @ts-ignore
        (window.adsbygoogle = window.adsbygoogle || []).push({});
      }
    } catch (e) {
      console.error("AdSense Script Error:", e);
    }
  }, [adsensePublisherId]);

  // If live Publisher ID is configured in production, render real Google AdSense tag
  if (adsensePublisherId) {
    return (
      <div className={`my-4 flex justify-center text-center overflow-hidden ${className}`}>
        <ins
          className="adsbygoogle"
          style={{ display: "block", width: "100%", ...style }}
          data-ad-client={adsensePublisherId}
          data-ad-slot={slot || "1234567890"}
          data-ad-format={format}
          data-full-width-responsive={responsive}
        />
      </div>
    );
  }

  // Realistic Trial / Preview Ad for Demo
  if (preview) {
    return (
      <div className={`my-2 sm:my-3.5 overflow-hidden rounded-xl sm:rounded-2xl border border-dashed border-amber-300/80 bg-gradient-to-r from-amber-50/70 via-orange-50/40 to-yellow-50/60 p-2 sm:p-3 shadow-2xs ${className}`}>
        {/* AdSense Standard Tag Header */}
        <div className="flex items-center justify-between text-[9px] sm:text-[10px] font-bold text-amber-800/80 mb-1.5 border-b border-amber-200/50 pb-1 px-0.5">
          <span className="flex items-center gap-1">
            <span className="h-1.5 w-1.5 rounded-full bg-amber-500" />
            <span>ADVERTISEMENT • Google Ads</span>
          </span>
          <span className="flex items-center gap-1 text-[8px] sm:text-[9px] text-gray-500 bg-white px-1.5 py-0.5 rounded-md border border-gray-200">
            <span>AdChoices</span>
            <Info className="h-2 w-2 sm:h-2.5 sm:w-2.5 text-blue-600" />
          </span>
        </div>

        {/* Ad Creative Box */}
        <div className="flex items-center justify-between gap-2.5 bg-white p-2 sm:p-3 rounded-lg sm:rounded-xl border border-amber-200/60 shadow-2xs">
          <div className="flex items-center gap-2 sm:gap-3 flex-1 min-w-0">
            <div className="flex h-8 w-8 sm:h-10 sm:w-10 shrink-0 items-center justify-center rounded-lg sm:rounded-xl bg-gradient-to-br from-blue-600 to-indigo-700 text-white shadow-xs font-black text-[10px] sm:text-xs">
              AD
            </div>
            <div className="text-left flex-1 min-w-0">
              <h4 className="text-xs sm:text-sm font-extrabold text-gray-900 leading-snug line-clamp-1">
                SSC CGL 2026 Complete All-India Mock Test Series &amp; Video Solutions
              </h4>
              <p className="hidden sm:block text-[11px] font-medium text-gray-500 mt-0.5 line-clamp-1">
                Join 50,000+ Aspirants. 100+ Full Mocks with Detailed Analytics. 
              </p>
            </div>
          </div>

          <div className="shrink-0">
            <button className="flex items-center justify-center gap-1 sm:gap-1.5 rounded-lg sm:rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 px-2.5 py-1.5 sm:px-4 sm:py-2 text-[11px] sm:text-xs font-black text-gray-950 shadow-xs hover:bg-amber-400 cursor-pointer whitespace-nowrap">
              <span>Visit Site</span>
              <ExternalLink className="h-3 w-3 sm:h-3.5 sm:w-3.5 shrink-0" />
            </button>
          </div>
        </div>
      </div>
    );
  }

  return null;
}
