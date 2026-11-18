import type { Metadata } from "next";
import { buildPageMetadata } from "@/lib/seo-store";

export async function generateMetadata(): Promise<Metadata> {
  return buildPageMetadata("/papers", {
    title: "SSC PYQ Shift Papers 2026 Live — Official Shift Papers CBT Test | SSCZone",
    description: "Attempt official SSC CGL, CHSL, CPO previous year shift papers in online CBT exam mode with instant scorecards and detailed solutions.",
    keywords: [
      "SSC PYQ Papers",
      "SSC CGL 2024 Tier 1 Shift Papers",
      "SSC CHSL Previous Year Papers",
      "SSC CPO Question Papers",
      "SSC CBT Mock Test Online",
    ],
  });
}

export default function PapersLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
