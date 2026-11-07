import type { Metadata } from "next";
import { buildPageMetadata } from "@/lib/seo-store";

export async function generateMetadata(): Promise<Metadata> {
  return buildPageMetadata("/papers", {
    title: "SSC PYQ Shift Papers 2026 Live — Download PDF & Attempt CBT Test | SSCZone",
    description: "Download clean official SSC CGL, CHSL, CPO shift paper PDFs with SSC Zone branding and attempt online CBT mock tests with instant scorecards.",
    keywords: [
      "SSC PYQ Papers",
      "SSC CGL 2024 Tier 1 Shift Papers",
      "SSC CHSL Previous Year Paper PDF",
      "SSC CPO Question Papers",
      "SSC CBT Mock Test Online",
    ],
  });
}

export default function PapersLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
