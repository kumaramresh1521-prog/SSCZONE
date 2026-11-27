export interface TopperTestimonial {
  id: string;
  name: string;
  exam: string; // e.g. "SSC CGL 2024"
  rank: string; // e.g. "AIR 14 - ASO in CSS"
  score?: string; // e.g. "348 / 390"
  photoUrl?: string;
  state?: string; // e.g. "Rajasthan"
  badge?: string; // e.g. "Verified Selection"
  quote: string; // Topper review text
  rating: number; // 1 to 5
  isActive: boolean;
  sortOrder: number;
  createdAt?: string;
  updatedAt?: string;
}

export const DEFAULT_TESTIMONIALS: TopperTestimonial[] = [
  {
    id: "top_cgl_aditya",
    name: "Aditya Sharma",
    exam: "SSC CGL 2024",
    rank: "AIR 14 — Assistant Section Officer (CSS)",
    score: "348 / 390",
    photoUrl: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400&auto=format&fit=crop&q=80",
    state: "Jaipur, Rajasthan",
    badge: "AIR 14 (1st Attempt)",
    quote: "SSCZone's chapter-wise PYQs and realistic exam hall interface were game changers for me. Solving questions with the timer and seeing detailed bilingual explanations eliminated all my calculation silly mistakes.",
    rating: 5,
    isActive: true,
    sortOrder: 1,
    createdAt: new Date().toISOString(),
  },
  {
    id: "top_cgl_priya",
    name: "Priya Ranjan",
    exam: "SSC CGL 2024",
    rank: "AIR 48 — Inspector (CGST & Central Excise)",
    score: "341 / 390",
    photoUrl: "https://images.unsplash.com/photo-1517841905240-472988babdf9?w=400&auto=format&fit=crop&q=80",
    state: "Patna, Bihar",
    badge: "GST Inspector",
    quote: "The speed drill test mode and 25-question sectionals helped me boost my Maths & Reasoning attempt speed from 22 to 25 questions in under 18 minutes. Highest quality platform for serious SSC aspirants!",
    rating: 5,
    isActive: true,
    sortOrder: 2,
    createdAt: new Date().toISOString(),
  },
  {
    id: "top_cgl_vikram",
    name: "Vikram Rathore",
    exam: "SSC CGL 2023",
    rank: "AIR 89 — Sub-Inspector (CBI)",
    score: "336 / 390",
    photoUrl: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&auto=format&fit=crop&q=80",
    state: "Lucknow, Uttar Pradesh",
    badge: "CBI Sub-Inspector",
    quote: "No unnecessary fluff, pure exam-relevant questions. The chapter theory notes and formula summaries made my final 30-day revision effortless. Truly grateful to the SSCZone team.",
    rating: 5,
    isActive: true,
    sortOrder: 3,
    createdAt: new Date().toISOString(),
  },
  {
    id: "top_chsl_sakshi",
    name: "Sakshi Verma",
    exam: "SSC CHSL 2024",
    rank: "AIR 27 — Data Entry Operator (CAG)",
    score: "168.5 / 200 (Tier-1)",
    photoUrl: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=400&auto=format&fit=crop&q=80",
    state: "Bhopal, Madhya Pradesh",
    badge: "DEO Grade A",
    quote: "The interactive typing test software on SSCZone matched the actual exam keyboard layout cleanly. I cleared the typing test comfortably with 2000+ Key Depressions in 15 minutes and zero error.",
    rating: 5,
    isActive: true,
    sortOrder: 4,
    createdAt: new Date().toISOString(),
  },
];
