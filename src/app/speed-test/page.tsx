import type { Metadata } from "next";
import { Suspense } from "react";
import SpeedTestClient from "./SpeedTestClient";
import { buildPageMetadata } from "@/lib/seo-store";

export async function generateMetadata(): Promise<Metadata> {
  return buildPageMetadata("/speed-test", {
    title: "SSC Speed Test Challenge (25 Qs / 15 Mins) | SSCZONE",
    description: "High-speed exam practice test for SSC CGL, CHSL, CPO, and MTS. Practice 25 questions in 15 minutes or 20-second Blitz mode across 12,200+ dynamic PYQ & Question Bank questions.",
    keywords: [
      "SSC Speed Test",
      "SSC CGL Speed Test",
      "25 questions 15 minutes",
      "SSC 20 sec blitz test",
      "SSC PYQ speed test",
      "SSC reasoning speed test",
      "SSC math speed test",
    ],
  });
}

export default function SpeedTestPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-slate-50 flex items-center justify-center text-slate-500 font-bold">Loading Speed Test...</div>}>
      <SpeedTestClient />
    </Suspense>
  );
}
