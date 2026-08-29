"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function DashboardPage() {
  const [user, setUser] = useState<any>(null);
  const [profile, setProfile] = useState<any>(null);
  const [subscription, setSubscription] = useState<any>(null);
  const [stats, setStats] = useState({ attempted: 0, correct: 0, tests: 0, bookmarks: 0 });
  const router = useRouter();

  useEffect(() => {
    supabase.auth.getSession().then(async ({ data: { session } }) => {
      const user = session?.user;
      if (!user) return router.replace("/login");
      setUser(user);

      const { data: prof } = await supabase.from("profiles").select("*").eq("id", user.id).maybeSingle();
      setProfile(prof);

      const { data: subs } = await supabase
        .from("subscriptions")
        .select("*, packages(title)")
        .eq("user_id", user.id)
        .eq("status", "active")
        .gte("expires_at", new Date().toISOString())
        .order("created_at", { ascending: false })
        .limit(1)
        .maybeSingle();
      setSubscription(subs);

      const { data: attempts } = await supabase
        .from("test_attempts")
        .select("score, total_questions")
        .eq("user_id", user.id)
        .eq("status", "completed");

      const { count: bookmarkCount } = await supabase
        .from("bookmarks")
        .select("id", { count: "exact", head: true })
        .eq("user_id", user.id);

      const completedAttempts = attempts || [];
      setStats({
        attempted: completedAttempts.reduce((s, a) => s + (a.total_questions || 0), 0),
        correct: completedAttempts.reduce((s, a) => s + (a.score || 0), 0),
        tests: completedAttempts.length,
        bookmarks: bookmarkCount || 0,
      });
    });
  }, [router]);

  if (!user) return null;

  return (
    <div className="min-h-screen bg-gray-50">
            <section className="mx-auto max-w-5xl px-4 py-12">
        <h1 className="text-3xl font-bold">Dashboard</h1>
          <div className="flex items-center justify-between">
            <div>
              <p className="mt-1 text-gray-600">Welcome back, {profile?.full_name || user.email}</p>
            </div>
            <Link href="/dashboard/settings" className="text-sm text-gray-500 hover:text-primary">Settings</Link>
          </div>

        <div className="mt-8 grid gap-6 md:grid-cols-4">
          <div className="rounded-xl bg-white p-6 shadow-sm">
            <p className="text-sm text-gray-500">Questions Practiced</p>
            <p className="mt-1 text-3xl font-bold">{stats.attempted}</p>
          </div>
          <div className="rounded-xl bg-white p-6 shadow-sm">
            <p className="text-sm text-gray-500">Correct Answers</p>
            <p className="mt-1 text-3xl font-bold text-green-600">{stats.correct}</p>
          </div>
          <div className="rounded-xl bg-white p-6 shadow-sm">
            <p className="text-sm text-gray-500">Tests Taken</p>
            <p className="mt-1 text-3xl font-bold">{stats.tests}</p>
          </div>
          <Link
            href="/dashboard/bookmarks"
            className="rounded-xl bg-white p-6 shadow-sm transition-shadow hover:shadow-md"
          >
            <p className="text-sm text-gray-500">Saved Questions</p>
            <p className="mt-1 text-3xl font-bold text-amber-600">{stats.bookmarks}</p>
          </Link>
        </div>

        <div className="mt-8 rounded-xl bg-white p-6 shadow-sm">
          <h2 className="text-lg font-semibold">Subscription</h2>
          {subscription ? (
            <div className="mt-2">
              <p className="text-green-600 font-medium">Active</p>
              <p className="text-sm text-gray-500">{subscription.packages?.title} — expires {new Date(subscription.expires_at).toLocaleDateString()}</p>
            </div>
          ) : (
            <div className="mt-2">
              <p className="text-gray-500">No active subscription</p>
              <Link href="/pricing" className="mt-2 inline-block text-sm font-medium text-primary hover:underline">View Plans</Link>
            </div>
          )}
        </div>

          <div className="mt-6 flex flex-wrap gap-4">
          <Link href="/exams" className="rounded-lg bg-primary px-6 py-2 text-white">Practice Now</Link>
          <Link href="/papers" className="rounded-lg border border-primary px-6 py-2 text-primary">Previous Papers</Link>
          <Link href="/dashboard/bookmarks" className="rounded-lg border px-6 py-2 text-gray-700">Saved Questions</Link>
        </div>
      </section>
    </div>
  );
}
