"use client";

import { useEffect, useState } from "react";
import { Flame, Target, Trophy, Sparkles, CheckCircle2, Zap } from "lucide-react";
import Link from "next/link";

export default function DailyStreakWidget() {
  const [streak, setStreak] = useState(1);
  const [todaySolved, setTodaySolved] = useState(0);
  const [dailyGoal, setDailyGoal] = useState(20);
  const [xpPoints, setXpPoints] = useState(120);
  const [levelName, setLevelName] = useState("Aspirant");

  useEffect(() => {
    try {
      const today = new Date().toISOString().split("T")[0];
      const savedDate = localStorage.getItem("ssczone_streak_date");
      const savedStreak = parseInt(localStorage.getItem("ssczone_streak_count") || "1", 10);
      const savedSolved = parseInt(localStorage.getItem(`ssczone_solved_${today}`) || "0", 10);
      const savedXP = parseInt(localStorage.getItem("ssczone_user_xp") || "120", 10);

      if (savedDate !== today) {
        // New day visit
        const yesterday = new Date(Date.now() - 86400000).toISOString().split("T")[0];
        if (savedDate === yesterday) {
          const newStreak = savedStreak + 1;
          setStreak(newStreak);
          localStorage.setItem("ssczone_streak_count", newStreak.toString());
        } else if (!savedDate) {
          localStorage.setItem("ssczone_streak_count", "1");
        }
        localStorage.setItem("ssczone_streak_date", today);
      } else {
        setStreak(savedStreak);
      }

      setTodaySolved(savedSolved);
      setXpPoints(savedXP);

      if (savedXP > 500) setLevelName("Pro Ranker 🏆");
      else if (savedXP > 200) setLevelName("Scholar ⚡");
      else setLevelName("Active Aspirant 🎯");
    } catch (e) {}
  }, []);

  const progress = Math.min(100, Math.round((todaySolved / dailyGoal) * 100));

  return (
    <div className="rounded-2xl border border-blue-100 bg-gradient-to-r from-blue-50/90 via-indigo-50/50 to-white p-4 shadow-xs">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        
        {/* Left: Streak & Level */}
        <div className="flex items-center gap-3">
          {/* Flame Streak Badge */}
          <div className="flex items-center gap-1.5 rounded-xl bg-gradient-to-tr from-amber-500 to-rose-500 text-white px-3 py-1.5 shadow-sm">
            <Flame className="h-4 w-4 fill-white animate-bounce" />
            <span className="text-xs font-black tracking-tight">{streak} Day{streak > 1 ? "s" : ""} Streak!</span>
          </div>

          <div className="text-xs text-left">
            <div className="flex items-center gap-1.5 font-extrabold text-gray-900">
              <span>{levelName}</span>
              <span className="rounded-md bg-blue-100 px-1.5 py-0.2 text-[10px] font-black text-blue-700">
                {xpPoints} XP
              </span>
            </div>
            <p className="text-[11px] text-gray-500">Daily Target: {todaySolved}/{dailyGoal} MCQs</p>
          </div>
        </div>

        {/* Right: Progress bar & Action */}
        <div className="flex items-center gap-3">
          <div className="w-28 sm:w-36 text-left">
            <div className="flex items-center justify-between text-[10px] font-bold text-gray-500 mb-1">
              <span>Today's Goal</span>
              <span>{progress}%</span>
            </div>
            <div className="h-2 w-full rounded-full bg-gray-200 overflow-hidden">
              <div 
                className="h-full bg-gradient-to-r from-blue-600 to-emerald-500 transition-all duration-300"
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>

          <Link
            href="/exams"
            className="rounded-xl bg-blue-600 px-3.5 py-1.5 text-xs font-black text-white hover:bg-blue-700 shadow-xs transition-all shrink-0"
          >
            Solve +5 MCQs
          </Link>
        </div>

      </div>
    </div>
  );
}
