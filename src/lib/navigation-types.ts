export interface SubMenuItemConfig {
  id: string;
  name: string;
  href: string;
  icon?: string;
  badge?: string;
  target?: "_self" | "_blank";
  is_active: boolean;
  is_custom?: boolean;
  sort_order: number;
}

export interface MenuItemConfig {
  id: string;
  name: string;
  href?: string;
  icon?: string;
  badge?: string;
  target?: "_self" | "_blank";
  is_active: boolean;
  is_custom?: boolean;
  is_dropdown?: boolean;
  sort_order: number;
  sub_items?: SubMenuItemConfig[];
}

export interface NavigationConfig {
  items: MenuItemConfig[];
  updatedAt?: string;
}

export const DEFAULT_NAVIGATION_CONFIG: NavigationConfig = {
  items: [
    {
      id: "exams",
      name: "Question Bank",
      href: "/exams",
      icon: "Target",
      is_dropdown: true,
      is_active: true,
      sort_order: 1,
      sub_items: [
        { id: "sub-exams-cgl", name: "SSC CGL", href: "/exams/ssc-cgl", icon: "Target", is_active: true, sort_order: 1 },
        { id: "sub-exams-chsl", name: "SSC CHSL", href: "/exams/ssc-chsl", icon: "Target", is_active: true, sort_order: 2 },
        { id: "sub-exams-cpo", name: "SSC CPO", href: "/exams/ssc-cpo", icon: "Target", is_active: true, sort_order: 3 },
        { id: "sub-exams-mts", name: "SSC MTS", href: "/exams/ssc-mts", icon: "Target", is_active: true, sort_order: 4 },
        { id: "sub-exams-gd", name: "SSC GD Constable", href: "/exams/ssc-gd", icon: "Target", is_active: true, sort_order: 5 },
        { id: "sub-exams-all", name: "View All Target Exams", href: "/exams", icon: "BookOpen", is_active: true, sort_order: 6 },
      ],
    },
    {
      id: "papers",
      name: "PYQ Papers",
      href: "/papers",
      icon: "FileText",
      badge: "2026 Live",
      is_dropdown: false,
      is_active: true,
      sort_order: 2,
      sub_items: [],
    },
    {
      id: "materials",
      name: "Study Material",
      href: "/notes",
      icon: "GraduationCap",
      is_dropdown: true,
      is_active: true,
      sort_order: 3,
      sub_items: [
        { id: "sub-notes", name: "Subject Notes", href: "/notes", icon: "BookOpen", is_active: true, sort_order: 1 },
        { id: "sub-books", name: "SSC Reference Books", href: "/books", icon: "BookMarked", is_active: true, sort_order: 2 },
      ],
    },
    {
      id: "practice",
      name: "Practice",
      href: "/papers",
      icon: "Zap",
      is_dropdown: true,
      is_active: true,
      sort_order: 4,
      sub_items: [
        { id: "sub-prac-pyq", name: "Previous Year Papers (PYQ)", href: "/papers", icon: "FileText", is_active: true, sort_order: 1 },
        { id: "sub-prac-mocks", name: "Full Mock Tests", href: "/mocks", icon: "Trophy", is_active: true, sort_order: 2 },
        { id: "sub-prac-speed", name: "Speed Test", href: "/speed-test", icon: "Clock", is_active: true, sort_order: 3 },
        { id: "sub-prac-quiz", name: "Daily Free Quiz", href: "/daily-quiz", icon: "Zap", is_active: true, sort_order: 4 },
      ],
    },
    {
      id: "blog",
      name: "Blog & Updates",
      href: "/blog",
      icon: "Newspaper",
      is_dropdown: false,
      is_active: true,
      sort_order: 5,
      sub_items: [],
    },
    {
      id: "typing",
      name: "Typing",
      href: "/typing",
      icon: "Keyboard",
      is_dropdown: false,
      is_active: true,
      sort_order: 6,
      sub_items: [],
    },
    {
      id: "toolkit",
      name: "Candidate Tools",
      href: "/toolkit",
      icon: "Wrench",
      is_dropdown: true,
      is_active: true,
      sort_order: 7,
      sub_items: [
        { id: "sub-tool-rank", name: "Rank Predictor & Marks", href: "/toolkit/rank-predictor", icon: "Trophy", is_active: true, sort_order: 1 },
        { id: "sub-tool-age", name: "Age & Post Eligibility", href: "/toolkit/age-calculator", icon: "Calendar", is_active: true, sort_order: 2 },
        { id: "sub-tool-photo", name: "Photo & Signature Resizer", href: "/toolkit/photo-resizer", icon: "Image", is_active: true, sort_order: 3 },
      ],
    },
  ],
};
