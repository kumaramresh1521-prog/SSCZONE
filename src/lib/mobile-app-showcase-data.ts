export interface AppScreenshotSlide {
  id: string;
  src: string;
  tabLabel: string;
  headline: string;
  subheadline: string;
  badge: string;
  highlights: string[];
  /** Raw phone screenshots without Play-Store promo framing get a sleek phone bezel wrapper */
  isRawScreen?: boolean;
}

export const APP_SCREENSHOT_SLIDES: AppScreenshotSlide[] = [
  {
    id: "hub",
    src: "/app-showcase/01-one-app-hub.jpg",
    tabLabel: "Home Hub",
    headline: "Everything for SSC CGL. One App.",
    subheadline: "Resume where you left off with 125 PYQ Papers, 21 Notes PDFs, 20,480+ MCQs & Timed Speed Drills.",
    badge: "All-in-One Prep",
    highlights: [
      "125+ Real Shift PYQ Papers with CBT & Study modes",
      "20,480+ Verified Chapter-Wise MCQs",
      "Continue where you left off + Daily Streak XP",
    ],
  },
  {
    id: "syllabus",
    src: "/app-showcase/02-syllabus-checklist.jpg",
    tabLabel: "Syllabus",
    headline: "Track Every Chapter of the Syllabus",
    subheadline: "Mark Theory, PYQs & Revisions for every chapter across Quant, Reasoning, English & General Awareness.",
    badge: "3-Pillar Mastery",
    highlights: [
      "High-weightage chapters highlighted automatically",
      "Tag each chapter as Weak, Medium, or Strong",
      "1-Tap jump from syllabus chapter straight to Practice Drills",
    ],
  },
  {
    id: "speed",
    src: "/app-showcase/03-speed-test-drills.jpg",
    tabLabel: "Speed Tests",
    headline: "Beat the Clock with Custom Speed Drills",
    subheadline: "Pick your subject (Mixed, Quant, Reasoning, English, GK/GA) and question count (10 / 15 / 25 Qs).",
    badge: "Timed Sprints",
    highlights: [
      "Custom 10 Qs, 15 Qs (12 min) & 25 Qs rapid drills",
      "Fresh randomized PYQs on every attempt",
      "Instant accuracy % & score history tracking",
    ],
  },
  {
    id: "readiness",
    src: "/app-showcase/04-exam-readiness.jpg",
    tabLabel: "Readiness",
    headline: "Know Your Exam Readiness & Mastery",
    subheadline: "Track live accuracy, seconds-per-question pace, subject mastery bars, and 7-test progression.",
    badge: "Smart Analytics",
    highlights: [
      "Overall Readiness % + Best Accuracy & Speed (s/Q)",
      "Identifies strongest section & weak subjects to boost",
      "AI-suggested next drill based on your score gaps",
    ],
  },
  {
    id: "daily-quiz",
    src: "/app-showcase/05-daily-quiz-streak.jpg",
    tabLabel: "Daily Quiz",
    headline: "Daily Free Quiz & Step-by-Step Solutions",
    subheadline: "Fresh CGL-style timed quizzes every day with detailed explanations, Save option & daily streaks.",
    badge: "Daily Habit +XP",
    highlights: [
      "10 fresh exam-pattern questions every single day",
      "Clear shortcut solutions right below every answer",
      "Save tricky questions directly to your Cloud Vault",
    ],
  },
  {
    id: "tracker-live",
    src: "/app-showcase/06-syllabus-tracker-live.jpg",
    tabLabel: "Live Tracker",
    headline: "Cloud-Synced 3-Pillar Syllabus Tracker",
    subheadline: "Filter Pending, High-Weightage, or Mastered topics across SSC CGL, CHSL, CPO & MTS — synced with Web.",
    badge: "Cloud Synced",
    highlights: [
      "Track Theory, 50+ PYQs, High-Yield & Revision counts",
      "Add custom chapters or subjects tailored to your plan",
      "Arithmetic & Advance Maths instant section filters",
    ],
    isRawScreen: true,
  },
];

export const DEFAULT_APK_CDN_URL = "https://doc.ssczone.com/apk/SSCZone.apk";
