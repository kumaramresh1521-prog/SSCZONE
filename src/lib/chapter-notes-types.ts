export interface ChapterNote {
  id: string;
  slug: string;
  title: string;
  hindi_title?: string;
  excerpt: string;
  content: string; // Rich HTML/Markdown formatted content
  type: "chapter_note" | "educational_guide";
  subject_id: string; // e.g. "physics", "chemistry", "polity", "maths", etc.
  subject_name: string; // e.g. "Physics (भौतिक विज्ञान)"
  chapter_number?: number;
  chapter_title?: string;
  read_time: string; // e.g. "6 min read"
  image_url?: string;
  is_active: boolean; // ON / OFF control
  is_featured?: boolean;
  sort_order: number;
  exam_tag?: string; // "SSC CGL", "All SSC Exams", etc.
  created_at: string;
  updated_at: string;
}

export interface SubjectMeta {
  id: string;
  name: string;
  hindi_name: string;
  category: "General Awareness" | "Science" | "Quantitative Aptitude" | "Reasoning" | "English" | "Computer" | "Special";
  color: string;
  icon: string;
  description: string;
}

export const ALL_SUBJECTS: SubjectMeta[] = [
  {
    id: "physics",
    name: "Physics",
    hindi_name: "भौतिक विज्ञान",
    category: "Science",
    color: "blue",
    icon: "Atom",
    description: "Mechanics, Optics, Thermodynamics, Electricity & Modern Physics formulas and concepts.",
  },
  {
    id: "chemistry",
    name: "Chemistry",
    hindi_name: "रसायन विज्ञान",
    category: "Science",
    color: "emerald",
    icon: "FlaskConical",
    description: "Periodic Table, Chemical Reactions, Acids & Bases, Organic compounds for SSC.",
  },
  {
    id: "biology",
    name: "Biology",
    hindi_name: "जीव विज्ञान",
    category: "Science",
    color: "teal",
    icon: "Dna",
    description: "Human Physiology, Cytology, Diseases & Genetics high-yield SSC theory.",
  },
  {
    id: "polity",
    name: "Indian Polity & Constitution",
    hindi_name: "भारतीय राजव्यवस्था एवं संविधान",
    category: "General Awareness",
    color: "indigo",
    icon: "Scale",
    description: "Articles, Amendments, President, Parliament & Judicial hierarchy notes.",
  },
  {
    id: "history",
    name: "Indian History",
    hindi_name: "भारतीय इतिहास",
    category: "General Awareness",
    color: "amber",
    icon: "Landmark",
    description: "Ancient civilizations, Medieval dynasties, Modern Freedom Struggle & Movements.",
  },
  {
    id: "geography",
    name: "Geography (World & India)",
    hindi_name: "भूगोल",
    category: "General Awareness",
    color: "cyan",
    icon: "Globe2",
    description: "Rivers, Mountain systems, Climate zones, Mineral resources & Mapping notes.",
  },
  {
    id: "economy",
    name: "Indian Economy",
    hindi_name: "भारतीय अर्थव्यवस्था",
    category: "General Awareness",
    color: "rose",
    icon: "TrendingUp",
    description: "National Income, Budget, Inflation, Banking System & Five-Year Plans.",
  },
  {
    id: "maths",
    name: "Quantitative Aptitude",
    hindi_name: "गणित",
    category: "Quantitative Aptitude",
    color: "purple",
    icon: "Calculator",
    description: "Arithmetic shortcuts, Advanced algebra, Trigonometry & Geometry theorems.",
  },
  {
    id: "reasoning",
    name: "Reasoning & Mental Ability",
    hindi_name: "तर्कशक्ति",
    category: "Reasoning",
    color: "violet",
    icon: "Brain",
    description: "Syllogism, Blood Relations, Coding-Decoding & Non-Verbal patterns.",
  },
  {
    id: "english",
    name: "English Comprehension",
    hindi_name: "अंग्रेजी भाषा",
    category: "English",
    color: "orange",
    icon: "BookA",
    description: "120 Grammar Rules, Idioms & Phrases, One-Word Substitution & Vocab roots.",
  },
  {
    id: "static-gk",
    name: "Static GK & Culture",
    hindi_name: "स्टैटिक सामान्य ज्ञान व संस्कृति",
    category: "General Awareness",
    color: "yellow",
    icon: "Sparkles",
    description: "Folk Dances, National Parks, Classical Music Gharanas, Festivals & Awards.",
  },
  {
    id: "computer",
    name: "Computer Knowledge (Tier-2 Qualifying)",
    hindi_name: "कंप्यूटर ज्ञान",
    category: "Computer",
    color: "sky",
    icon: "Laptop",
    description: "MS Office 365, CPU architecture, Networking protocols & Cybersecurity basics.",
  },
  {
    id: "general",
    name: "Quick Revision & Guides",
    hindi_name: "क्विक रिवीजन व एजुकेशनल गाइड्स",
    category: "Special",
    color: "pink",
    icon: "Flame",
    description: "Random high-yield cheat sheets, strategy breakdowns & mnemonic trick guides.",
  },
];
