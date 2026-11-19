import type { Metadata } from "next";
import { buildPageMetadata } from "@/lib/seo-store";

export async function generateMetadata(): Promise<Metadata> {
  return buildPageMetadata("/mocks", {
    title: "SSC CGL 2026 Free Mock Test Series — 100 Questions Full CBT Practice",
    description:
      "Attempt full-length SSC CGL 2026 mock tests with official 60-minute countdown, sectional navigation palette, bilingual Hindi & English questions, and instant negative marking analysis.",
    keywords: [
      "SSC CGL Mock Test 2026",
      "Free SSC Mock Test Series",
      "SSC CGL Tier 1 Online Test",
      "SSC CBT Full-Length Practice",
      "100 Questions Mock Test",
      "SSC Tier 1 Mock Test with Solution",
    ],
  });
}

export default function MocksLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}