"use client";

import React from "react";
import { ShieldAlert } from "lucide-react";

export default function TopGovernmentDisclaimer() {
  return (
    <aside
      aria-label="Government Affiliation Disclaimer"
      className="w-full max-w-full overflow-x-clip bg-slate-950 text-slate-200 border-b border-slate-800 py-2 px-3 sm:px-6 relative z-50 text-[11px] sm:text-xs antialiased selection:bg-amber-400 selection:text-slate-950"
    >
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-center gap-1.5 md:gap-2.5 text-center leading-snug">
        <div className="inline-flex items-center gap-1.5 shrink-0">
          <ShieldAlert className="h-3.5 w-3.5 text-amber-400" />
          <span className="font-black uppercase tracking-wider text-amber-400 text-[10px] sm:text-[11px] bg-amber-400/10 border border-amber-400/30 px-2 py-0.5 rounded-full">
            Official Disclaimer
          </span>
        </div>

        <p className="text-slate-300 font-normal">
          <strong className="text-white font-bold">This website &amp; app is an independent educational portal</strong> and is{" "}
          <strong className="text-amber-300 font-bold underline decoration-amber-400/50 underline-offset-2">
            NOT affiliated with, authorized, endorsed by, or in any way officially connected with the Staff Selection Commission (SSC), Government of India, or any government entity
          </strong>
          . / <span className="text-slate-400">यह एक स्वतंत्र निजी शैक्षणिक मंच है, किसी भी सरकारी निकाय से संबद्ध नहीं है।</span>
        </p>
      </div>
    </aside>
  );
}
