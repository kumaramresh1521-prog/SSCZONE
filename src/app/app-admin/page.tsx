"use client";

import React from "react";
import MobileAppAdminPage from "../admin/mobile-app/page";
import Link from "next/link";
import { ArrowLeft, ShieldCheck } from "lucide-react";

export default function StandaloneAppAdminPage() {
  return (
    <div className="min-h-screen bg-slate-950 text-slate-100">
      <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
        <div className="mb-6 flex items-center justify-between border-b border-slate-800 pb-4">
          <Link
            href="/"
            className="flex items-center gap-2 text-xs font-bold text-slate-400 transition-colors hover:text-white"
          >
            <ArrowLeft className="h-4 w-4" /> Back to Website
          </Link>
          <div className="flex items-center gap-2 rounded-full border border-slate-800 bg-slate-900 px-3 py-1 text-xs text-slate-300">
            <ShieldCheck className="h-3.5 w-3.5 text-emerald-400" />
            <span>Standalone Mobile App Command Center</span>
          </div>
        </div>

        <MobileAppAdminPage />
      </div>
    </div>
  );
}
