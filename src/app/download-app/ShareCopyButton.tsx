"use client";

import React, { useState } from "react";
import { Share2, Check } from "lucide-react";

export default function ShareCopyButton({ url }: { url: string }) {
  const [copied, setCopied] = useState(false);

  const handleShareOrCopy = async () => {
    try {
      if (typeof navigator !== "undefined" && navigator.share) {
        await navigator.share({
          title: "SSCZone Android App",
          text: "Practice SSC CGL/CHSL PYQs, Speed Tests & Syllabus Tracker on the official SSCZone Android App:",
          url,
        });
        return;
      }
      if (typeof navigator !== "undefined" && navigator.clipboard) {
        await navigator.clipboard.writeText(url);
        setCopied(true);
        setTimeout(() => setCopied(false), 2500);
      }
    } catch {
      // Ignore cancel errors
    }
  };

  return (
    <button
      type="button"
      onClick={handleShareOrCopy}
      className="inline-flex items-center justify-center gap-1.5 rounded-2xl border border-white/20 bg-white/5 hover:bg-white/15 px-4 py-4 text-xs font-bold text-blue-100 transition-all cursor-pointer"
      title="Copy app download link to send to phone"
    >
      {copied ? (
        <>
          <Check className="h-4 w-4 text-emerald-400" />
          <span className="text-emerald-300">Link Copied!</span>
        </>
      ) : (
        <>
          <Share2 className="h-4 w-4" />
          <span>Send to Phone</span>
        </>
      )}
    </button>
  );
}
