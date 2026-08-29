"use client";

import React from "react";
import Link from "next/link";
import {
  Sparkles,
  Keyboard,
  Trophy,
  BookOpen,
  Wrench,
  ShieldCheck,
  Zap,
  CheckCircle2,
  Heart,
  FileText
} from "lucide-react";

export default function Footer() {
  return (
    <footer className="bg-slate-900 border-t border-slate-800 text-slate-300 font-sans pt-12 pb-24 lg:pb-12 mt-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 pb-10 border-b border-slate-800">
          
          {/* BRAND COLUMN */}
          <div className="space-y-4">
            <Link href="/" className="flex items-center gap-2 text-2xl font-black text-white tracking-tight">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-600 text-white shadow-md">
                <Sparkles className="h-5 w-5 text-amber-300 fill-amber-300" />
              </div>
              <span>SSC<span className="text-amber-400">Zone</span></span>
            </Link>
            <p className="text-xs text-slate-400 leading-relaxed">
              India's #1 Syllabus-Wise Practice & Test Series Portal for SSC CGL, CHSL, CPO, MTS, Stenographer & Railways Exams.
            </p>
            <div className="flex items-center gap-2 text-xs text-slate-400 font-semibold">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              <span>100% Free & Authentic SSC TCS Exam Pattern</span>
            </div>
          </div>

          {/* QUICK LINKS */}
          <div>
            <h4 className="text-xs font-black uppercase tracking-wider text-slate-200 mb-4 flex items-center gap-1.5">
              <Zap className="w-3.5 h-3.5 text-amber-400" /> Practice Zones
            </h4>
            <ul className="space-y-2.5 text-xs text-slate-400 font-medium">
              <li><Link href="/papers" className="hover:text-amber-400 transition-colors">Previous Year Papers (PYQs)</Link></li>
              <li><Link href="/mocks" className="hover:text-amber-400 transition-colors">Full-Length Mock Tests</Link></li>
              <li><Link href="/speed-test" className="hover:text-amber-400 transition-colors">15-Min Speed Tests</Link></li>
              <li><Link href="/daily-quiz" className="hover:text-amber-400 transition-colors">Daily Free Quiz</Link></li>
              <li><Link href="/notes" className="hover:text-amber-400 transition-colors">Subject Notes & PDFs</Link></li>
            </ul>
          </div>

          {/* SSC TOOLKIT */}
          <div>
            <h4 className="text-xs font-black uppercase tracking-wider text-slate-200 mb-4 flex items-center gap-1.5">
              <Wrench className="w-3.5 h-3.5 text-blue-400" /> Candidate Toolkit
            </h4>
            <ul className="space-y-2.5 text-xs text-slate-400 font-medium">
              <li><Link href="/toolkit/rank-predictor" className="hover:text-amber-400 transition-colors">Rank Predictor & Marks</Link></li>
              <li><Link href="/toolkit/age-calculator" className="hover:text-amber-400 transition-colors">Age & Post Eligibility</Link></li>
              <li><Link href="/toolkit/photo-resizer" className="hover:text-amber-400 transition-colors">SSC Photo & Signature Resizer</Link></li>
              <li><Link href="/typing" className="hover:text-amber-400 transition-colors">136-Word Typing Test Console</Link></li>
            </ul>
          </div>

          {/* EXAM PREPARATION */}
          <div>
            <h4 className="text-xs font-black uppercase tracking-wider text-slate-200 mb-4 flex items-center gap-1.5">
              <Trophy className="w-3.5 h-3.5 text-emerald-400" /> Targeted Exams
            </h4>
            <ul className="space-y-2.5 text-xs text-slate-400 font-medium">
              <li><Link href="/exams/ssc-cgl" className="hover:text-amber-400 transition-colors">SSC CGL 2025 Test Series</Link></li>
              <li><Link href="/exams/ssc-chsl" className="hover:text-amber-400 transition-colors">SSC CHSL LDC / DEO Portal</Link></li>
              <li><Link href="/exams/ssc-cpo" className="hover:text-amber-400 transition-colors">SSC CPO Sub-Inspector</Link></li>
              <li><Link href="/blog" className="hover:text-amber-400 transition-colors">Exam Dates & Cutoff Blog</Link></li>
            </ul>
          </div>

        </div>

        {/* COPYRIGHT & CREDITS */}
        <div className="pt-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500 font-medium">
          <p>© {new Date().getFullYear()} SSCZone. Official Exam Syllabus Practice Portal.</p>
          <div className="flex items-center gap-1 text-slate-400">
            <span>Crafted with</span>
            <Heart className="w-3.5 h-3.5 text-red-500 fill-red-500" />
            <span>for SSC Aspirants across India</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
