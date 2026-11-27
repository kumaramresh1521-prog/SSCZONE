export interface HomepageConfig {
  hero: {
    badgeText: string;
    headline: string;
    highlightText: string;
    description: string;
    primaryBtnText: string;
    primaryBtnLink: string;
    secondaryBtnText: string;
    secondaryBtnLink: string;
  };
  stats: Array<{ label: string; value: string }>;
  targetExamsSection: {
    enabled: boolean;
    title: string;
    subtitle: string;
    showUpcomingRoadmap: boolean;
    upcomingBadgeText: string;
    upcomingFooterText: string;
    maxUpcomingDisplay: number; // 0 means show all
  };
  examsSection?: {
    title: string;
    subtitle: string;
    cards: Array<{ name: string; desc: string; link: string; badge: string }>;
  };
  stepsSection: {
    title: string;
    subtitle: string;
    steps: Array<{ title: string; desc: string }>;
  };
  ctaBanner: {
    enabled: boolean;
    title: string;
    subtitle: string;
    buttonText: string;
    buttonLink: string;
  };
  updatedAt?: string;
}

export const DEFAULT_HOMEPAGE_CONFIG: HomepageConfig = {
  hero: {
    badgeText: "Exam Syllabus Based Practice Platform",
    headline: "Crack Competitive Exams With",
    highlightText: "SSCZone",
    description: "Practice topic-wise MCQs from standard reference books, attempt previous year test papers, and track your accuracy chapter by chapter.",
    primaryBtnText: "Explore All Exams",
    primaryBtnLink: "/exams",
    secondaryBtnText: "Attempt PYQ Papers",
    secondaryBtnLink: "/papers",
  },
  stats: [
    { label: "Topic-wise MCQs", value: "10,000+" },
    { label: "Previous Papers", value: "100+ PYQs" },
    { label: "Detailed Solutions", value: "100% Explanations" },
    { label: "Syllabus Covered", value: "Complete SSC Exams" },
  ],
  targetExamsSection: {
    enabled: true,
    title: "SSC Target Examinations",
    subtitle: "Active exams are open for practice. Upcoming exams are progressively unlocked as shift papers are curated.",
    showUpcomingRoadmap: true,
    upcomingBadgeText: "⏳ Launching Soon",
    upcomingFooterText: "Curating shift questions",
    maxUpcomingDisplay: 0, // 0 = all
  },
  examsSection: {
    title: "Target Competitive Exams",
    subtitle: "Select an exam and start syllabus-wise preparation",
    cards: [
      { name: "SSC CGL", desc: "Combined Graduate Level Tier-1 & Tier-2", link: "/exams", badge: "Graduation Level" },
      { name: "SSC CHSL", desc: "Combined Higher Secondary Level Tier-1", link: "/exams", badge: "10+2 Level" },
      { name: "SSC CPO & MTS", desc: "Central Police Organisation & Multi-Tasking Staff Practice", link: "/exams", badge: "All Levels" },
    ],
  },
  stepsSection: {
    title: "3 Simple Steps to Master Any Exam",
    subtitle: "Our structured approach ensures you never miss a single topic from the exam syllabus.",
    steps: [
      {
        title: "1. Select Exam Syllabus",
        desc: "Browse through exam syllabi categorized neatly into subjects and topic chapters.",
      },
      {
        title: "2. Practice Chapter-by-Chapter",
        desc: "Solve MCQs from standard reference books with instant answer explanations and solution hints.",
      },
      {
        title: "3. Attempt Real Exam Papers",
        desc: "Test your speed and accuracy in timed mock test environment with actual previous year papers.",
      },
    ],
  },
  ctaBanner: {
    enabled: true,
    title: "Ready to Crack SSC CGL / CHSL 2026?",
    subtitle: "Start practicing syllabus-wise questions now. Free access to all topic chapters & solutions.",
    buttonText: "Start Free Practice Now",
    buttonLink: "/exams",
  },
};
