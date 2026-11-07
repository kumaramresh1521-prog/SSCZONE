import type { Metadata } from "next";
import { buildPageMetadata } from "@/lib/seo-store";

export async function generateMetadata(): Promise<Metadata> {
  return buildPageMetadata("/typing", {
    title: "SSC Typing Test & Speed Drill Simulator — CGL & CHSL TCS Interface | SSCZone",
    description: "Practice SSC CGL, CHSL, and Steno typing test passages with real-time gross/net WPM, accuracy, error calculation, and TCS-pattern exam simulation.",
    keywords: [
      "SSC Typing Test",
      "SSC CGL Typing Speed Test",
      "SSC CHSL Typing Practice Online",
      "TCS Pattern Typing Test",
      "WPM Accuracy Calculator",
    ],
  });
}

export default function TypingLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
