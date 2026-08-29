"use client";

import { useState } from "react";
import { HelpCircle, ChevronDown, ChevronUp, Sparkles, MessageSquare } from "lucide-react";

export default function FAQPage() {
  const [openIdx, setOpenIdx] = useState<number | null>(0);

  const faqs = [
    {
      q: "What is SSCZone?",
      a: "SSCZone is an online test preparation portal that offers syllabus-wise MCQ practice and previous year question (PYQ) test papers for competitive exams such as SSC CGL, CHSL, UPSC CSAT, Railways, and State PSCs."
    },
    {
      q: "How does the Left Syllabus Navigation work?",
      a: "When you open any chapter for practice, a left sidebar displays the complete syllabus tree for that exam. You can expand subjects and click on any chapter to jump directly without going back."
    },
    {
      q: "Are free topics available?",
      a: "Yes! Every subject includes free practice chapters so you can test our platform before subscribing to a premium pass."
    },
    {
      q: "How can Admin upload new questions or papers?",
      a: "Admin users can go to /admin/questions or /admin/papers to upload MCQs in bulk using CSV files, JSON files, or text copy-paste. Downloadable CSV/JSON templates are provided in the admin portal."
    },
    {
      q: "What payment methods are supported for Pass subscription?",
      a: "We support UPI (GPay, PhonePe, Paytm), Credit Cards, Debit Cards, Netbanking, and Wallets securely via Razorpay payment gateway."
    }
  ];

  return (
    <div className="min-h-screen bg-gray-50/60">
      
      <section className="bg-gradient-to-r from-blue-900 via-indigo-900 to-slate-900 text-white py-14 px-4 text-center">
        <div className="mx-auto max-w-4xl">
          <div className="inline-flex items-center gap-2 rounded-full bg-blue-500/20 px-3 py-1 text-xs font-semibold text-blue-200 border border-blue-400/20 mb-3">
            <Sparkles className="h-3.5 w-3.5 text-amber-400" />
            Clear Your Doubts
          </div>
          <h1 className="text-3xl font-extrabold md:text-5xl">Frequently Asked Questions</h1>
          <p className="mt-2 text-sm text-blue-100 max-w-lg mx-auto">
            Everything you need to know about SSCZone practice modules, pass subscriptions, and test papers.
          </p>
        </div>
      </section>

      <section className="mx-auto max-w-3xl px-4 py-12">
        <div className="space-y-4">
          {faqs.map((faq, idx) => {
            const isOpen = openIdx === idx;
            return (
              <div key={idx} className="rounded-2xl border border-gray-200 bg-white overflow-hidden shadow-xs">
                <button
                  onClick={() => setOpenIdx(isOpen ? null : idx)}
                  className="flex w-full items-center justify-between p-5 text-left text-base font-bold text-gray-900 hover:bg-gray-50"
                >
                  <span className="flex items-center gap-3">
                    <HelpCircle className="h-5 w-5 text-blue-600 shrink-0" />
                    {faq.q}
                  </span>
                  {isOpen ? <ChevronUp className="h-5 w-5 text-gray-500" /> : <ChevronDown className="h-5 w-5 text-gray-500" />}
                </button>

                {isOpen && (
                  <div className="border-t border-gray-100 bg-gray-50/50 p-5 text-sm text-gray-600 leading-relaxed">
                    {faq.a}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </section>
    </div>
  );
}
