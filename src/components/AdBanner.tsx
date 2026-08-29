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
      <div className={`my-4 overflow-hidden rounded-2xl border border-dashed border-amber-300/80 bg-gradient-to-r from-amber-50/70 via-orange-50/40 to-yellow-50/60 p-3 sm:p-4 shadow-2xs ${className}`}>
        {/* AdSense Standard Tag Header */}
        <div className="flex items-center justify-between text-[10px] font-bold text-amber-800/80 mb-2 border-b border-amber-200/50 pb-1.5 px-1">
          <span className="flex items-center gap-1">
            <span className="h-1.5 w-1.5 rounded-full bg-amber-500" />
            <span>ADVERTISEMENT • Google Ads Preview</span>
          </span>
          <span className="flex items-center gap-1 text-[9px] text-gray-500 bg-white px-1.5 py-0.5 rounded-md border border-gray-200">
            <span>AdChoices</span>
            <Info className="h-2.5 w-2.5 text-blue-600" />
          </span>
        </div>

        {/* Ad Creative Box */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-white p-3.5 rounded-xl border border-amber-200/60 shadow-2xs">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-blue-600 to-indigo-700 text-white shadow-xs font-black text-xs">
              AD
            </div>
            <div className="text-left">
              <h4 className="text-xs sm:text-sm font-extrabold text-gray-900 leading-snug">
                SSC CGL 2026 Complete All-India Mock Test Series &amp; Video Solutions
              </h4>
              <p className="text-[11px] font-medium text-gray-500 mt-0.5">
                Join 50,000+ Aspirants. 100+ Full Mocks with Detailed Analytics. 
              </p>
            </div>
          </div>

          <div className="shrink-0 w-full sm:w-auto">
            <button className="w-full sm:w-auto flex items-center justify-center gap-1.5 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 px-4 py-2 text-xs font-black text-gray-950 shadow-xs hover:bg-amber-400 cursor-pointer">
              <span>Visit Site</span>
              <ExternalLink className="h-3 w-3" />
            </button>
          </div>
        </div>
      </div>
    );
  }

  return null;
}
