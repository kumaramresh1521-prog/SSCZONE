"use client";

import React from "react";
import Link from "next/link";
import BrandLogo from "@/components/BrandLogo";

export default function Footer() {
  return (
    <footer className="w-full max-w-full overflow-hidden bg-slate-900 border-t border-slate-800 text-slate-400 font-sans pt-12 pb-24 lg:pb-12 mt-16">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8 pb-10 border-b border-slate-800">
          
          {/* Brand info */}
          <div className="lg:col-span-2 space-y-3">
            <BrandLogo variant="white" size="lg" />

            <p className="text-xs text-slate-400 leading-relaxed max-w-sm">
              Syllabus-wise MCQ practice and official previous year test series portal for SSC CGL, CHSL, CPO, MTS, and Railways examinations.
            </p>

            <p className="text-[11px] text-slate-500">
              Authentic questions aligned with official Staff Selection Commission notifications.
            </p>
          </div>

          {/* Practice */}
          <div>
            <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-200 mb-3">
              Practice
            </h4>
            <ul className="space-y-2 text-xs font-normal">
              <li><Link href="/exams" className="hover:text-white transition-colors">Syllabus Questions</Link></li>
              <li><Link href="/papers" className="hover:text-white transition-colors">Previous Year Papers</Link></li>
              <li><Link href="/mocks" className="hover:text-white transition-colors">Mock Test Series</Link></li>
              <li><Link href="/typing" className="hover:text-white transition-colors">136-WPM Typing Test</Link></li>
              <li><Link href="/speed-test" className="hover:text-white transition-colors">Speed Drills</Link></li>
            </ul>
          </div>

          {/* Target Exams */}
          <div>
            <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-200 mb-3">
              Exams
            </h4>
            <ul className="space-y-2 text-xs font-normal">
              <li><Link href="/exams/ssc-cgl" className="hover:text-white transition-colors">SSC CGL</Link></li>
              <li><Link href="/exams/ssc-chsl" className="hover:text-white transition-colors">SSC CHSL</Link></li>
              <li><Link href="/exams/ssc-cpo" className="hover:text-white transition-colors">SSC CPO</Link></li>
              <li><Link href="/exams/ssc-mts" className="hover:text-white transition-colors">SSC MTS</Link></li>
              <li><Link href="/exams/ssc-gd" className="hover:text-white transition-colors">SSC GD</Link></li>
            </ul>
          </div>

          {/* Tools & Legal */}
          <div>
            <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-200 mb-3">
              Tools & Info
            </h4>
            <ul className="space-y-2 text-xs font-normal">
              <li><Link href="/toolkit/rank-predictor" className="hover:text-white transition-colors">Rank Predictor</Link></li>
              <li><Link href="/toolkit/age-calculator" className="hover:text-white transition-colors">Age Calculator</Link></li>
              <li><Link href="/toolkit/photo-resizer" className="hover:text-white transition-colors">Photo Resizer</Link></li>
              <li><Link href="/about" className="hover:text-white transition-colors">About Us</Link></li>
              <li><Link href="/contact" className="hover:text-white transition-colors">Contact Support</Link></li>
            </ul>
          </div>

        </div>

        {/* Bottom Bar */}
        <div className="pt-6 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-500">
          <p>© {new Date().getFullYear()} SSCZone. All rights reserved.</p>

          <div className="flex items-center gap-4">
            <Link href="/privacy" className="hover:text-slate-400 transition-colors">Privacy Policy</Link>
            <Link href="/terms" className="hover:text-slate-400 transition-colors">Terms</Link>
            <Link href="/refund" className="hover:text-slate-400 transition-colors">Refund</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
