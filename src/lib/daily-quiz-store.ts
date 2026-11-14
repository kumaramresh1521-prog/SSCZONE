import fs from "fs";
import path from "path";

export interface DailyQuizQuestion {
  id: string;
  question_text: string;
  question_text_hi?: string;
  option_a: string;
  option_b: string;
  option_c: string;
  option_d: string;
  correct_answer: "A" | "B" | "C" | "D";
  explanation?: string;
  source?: string;
  source_type?: "pyq" | "bank";
  section_key?: string;
  section_name?: string;
}

export interface DailyQuiz {
  id: string;
  title: string;
  date: string; // YYYY-MM-DD
  subject: string;
  subject_key: "quant" | "reasoning" | "english" | "ga" | "mixed";
  target_exam: string;
  duration_minutes: number;
  total_questions: number;
  is_active: boolean;
  status?: "draft" | "approved"; // Admin approval workflow: "draft" (unpublished) vs "approved" (published live)
  approved_at?: string | null;
  created_at: string;
  updated_at: string;
  questions: DailyQuizQuestion[];
}

const DATA_DIR = path.join(process.cwd(), "src", "data");
const FILE_PATH = path.join(DATA_DIR, "daily_quizzes.json");

// Default initial seed data for Daily Free Quizzes
const DEFAULT_QUIZZES: DailyQuiz[] = [
  {
    id: "dq_20261106_quant",
    title: "Daily Free Quiz: Quantitative Aptitude Speed Drill",
    date: "2026-11-06",
    subject: "Quantitative Aptitude",
    subject_key: "quant",
    target_exam: "SSC CGL / CHSL 2026",
    duration_minutes: 10,
    total_questions: 10,
    is_active: true,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    questions: [
      {
        id: "q_1",
        question_text: "If a sum of money doubles itself in 5 years at simple interest, in how many years will it become 4 times?",
        option_a: "10 years",
        option_b: "12 years",
        option_c: "15 years",
        option_d: "20 years",
        correct_answer: "C",
        explanation: "Simple interest for 1P = 5 years. To become 4P, required interest = 3P. Time required = 3 × 5 = 15 years."
      },
      {
        id: "q_2",
        question_text: "The price of sugar is increased by 20%. By how much percent must a family reduce its consumption so as not to increase the expenditure?",
        option_a: "16.67%",
        option_b: "20%",
        option_c: "15%",
        option_d: "25%",
        correct_answer: "A",
        explanation: "Percentage reduction = [r / (100 + r)] × 100 = [20 / 120] × 100 = 16.67% or 16 2/3%."
      },
      {
        id: "q_3",
        question_text: "A train 240 m long passes a pole in 24 seconds. How long will it take to pass a platform 650 m long?",
        option_a: "65 sec",
        option_b: "89 sec",
        option_c: "100 sec",
        option_d: "85 sec",
        correct_answer: "B",
        explanation: "Speed of train = 240 / 24 = 10 m/s. Total distance for platform = 240 + 650 = 890 m. Time = 890 / 10 = 89 seconds."
      },
      {
        id: "q_4",
        question_text: "Find the value of (sin 30° + cos 60°) / (tan 45°).",
        option_a: "0.5",
        option_b: "1.0",
        option_c: "1.5",
        option_d: "2.0",
        correct_answer: "B",
        explanation: "sin 30° = 1/2, cos 60° = 1/2, tan 45° = 1. (1/2 + 1/2) / 1 = 1 / 1 = 1.0."
      },
      {
        id: "q_5",
        question_text: "The average of 5 consecutive odd numbers is 27. What is the product of the smallest and largest numbers?",
        option_a: "713",
        option_b: "725",
        option_c: "735",
        option_d: "741",
        correct_answer: "A",
        explanation: "The consecutive odd numbers with average 27 are: 23, 25, 27, 29, 31. Smallest = 23, Largest = 31. Product = 23 × 31 = 713."
      }
    ]
  },
  {
    id: "dq_20261106_reasoning",
    title: "Daily Free Quiz: General Intelligence & Reasoning Drill",
    date: "2026-11-06",
    subject: "General Intelligence & Reasoning",
    subject_key: "reasoning",
    target_exam: "SSC CGL / CHSL 2026",
    duration_minutes: 10,
    total_questions: 5,
    is_active: true,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    questions: [
      {
        id: "r_1",
        question_text: "Select the related word from the given alternatives: Mekong : Tibet :: Amazon : ?",
        option_a: "Chile",
        option_b: "Peru",
        option_c: "Colombia",
        option_d: "Ecuador",
        correct_answer: "B",
        explanation: "Mekong river originates from Tibet plateau. Similarly, Amazon river originates from the Andes in Peru."
      },
      {
        id: "r_2",
        question_text: "Select the number that can replace the question mark (?) in the following series: 7, 11, 19, 31, 47, ?",
        option_a: "63",
        option_b: "65",
        option_c: "67",
        option_d: "69",
        correct_answer: "C",
        explanation: "Differences between terms: 11 - 7 = 4, 19 - 11 = 8, 31 - 19 = 12, 47 - 31 = 16. Next difference = 20. 47 + 20 = 67."
      },
      {
        id: "r_3",
        question_text: "If 'P' denotes 'addition', 'D' denotes 'subtraction', 'S' denotes 'multiplication', and 'V' denotes 'division', then what will be 15 S 4 P 20 V 4 D 6?",
        option_a: "57",
        option_b: "59",
        option_c: "61",
        option_d: "63",
        correct_answer: "B",
        explanation: "Expression: 15 × 4 + (20 ÷ 4) - 6 = 60 + 5 - 6 = 59."
      }
    ]
  },
  {
    id: "dq_20261106_ga",
    title: "Daily Free Quiz: General Awareness & Static GK Challenge",
    date: "2026-11-06",
    subject: "General Awareness",
    subject_key: "ga",
    target_exam: "SSC CGL / CPO / MTS 2026",
    duration_minutes: 8,
    total_questions: 5,
    is_active: true,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    questions: [
      {
        id: "ga_1",
        question_text: "Which Article of the Indian Constitution empowers the President to declare Financial Emergency?",
        option_a: "Article 352",
        option_b: "Article 356",
        option_c: "Article 360",
        option_d: "Article 368",
        correct_answer: "C",
        explanation: "Article 360 deals with Financial Emergency. Article 352 is National Emergency, and Article 356 is President's Rule."
      },
      {
        id: "ga_2",
        question_text: "Who among the following was the founder of the Brahmo Samaj in 1828?",
        option_a: "Swami Vivekananda",
        option_b: "Raja Ram Mohan Roy",
        option_c: "Dayanand Saraswati",
        option_d: "Ishwar Chandra Vidyasagar",
        correct_answer: "B",
        explanation: "Raja Ram Mohan Roy founded Brahmo Sabha in 1828, which later became the Brahmo Samaj."
      }
    ]
  }
];

export function getDailyQuizzes(): DailyQuiz[] {
  try {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }
    if (!fs.existsSync(FILE_PATH)) {
      fs.writeFileSync(FILE_PATH, JSON.stringify(DEFAULT_QUIZZES, null, 2), "utf8");
      return DEFAULT_QUIZZES;
    }
    const raw = fs.readFileSync(FILE_PATH, "utf8");
    const data = JSON.parse(raw);
    return Array.isArray(data) ? data : DEFAULT_QUIZZES;
  } catch (err) {
    console.error("Error reading daily_quizzes.json:", err);
    return DEFAULT_QUIZZES;
  }
}

export function saveDailyQuizzes(quizzes: DailyQuiz[]): boolean {
  try {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }
    fs.writeFileSync(FILE_PATH, JSON.stringify(quizzes, null, 2), "utf8");
    return true;
  } catch (err) {
    console.error("Error writing daily_quizzes.json:", err);
    return false;
  }
}

export function getDailyQuizById(id: string): DailyQuiz | null {
  const all = getDailyQuizzes();
  return all.find((q) => q.id === id) || null;
}

export function upsertDailyQuiz(quiz: DailyQuiz): boolean {
  const all = getDailyQuizzes();
  const idx = all.findIndex((q) => q.id === quiz.id);
  quiz.updated_at = new Date().toISOString();
  if (idx >= 0) {
    all[idx] = quiz;
  } else {
    all.unshift(quiz);
  }
  return saveDailyQuizzes(all);
}

export function deleteDailyQuiz(id: string): boolean {
  const all = getDailyQuizzes();
  const filtered = all.filter((q) => q.id !== id);
  return saveDailyQuizzes(filtered);
}
