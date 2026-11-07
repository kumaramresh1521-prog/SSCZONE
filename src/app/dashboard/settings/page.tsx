"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { useRouter } from "next/navigation";
import Link from "next/link";
import toast from "react-hot-toast";
import {
  ArrowLeft,
  KeyRound,
  Mail,
  Phone,
  Save,
  ShieldCheck,
  User,
  LogOut,
  Sparkles,
} from "lucide-react";

export default function SettingsPage() {
  const [user, setUser] = useState<any>(null);
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  useEffect(() => {
    supabase.auth.getUser().then(async ({ data: { user } }) => {
      if (!user) return router.push("/login");
      setUser(user);
      const { data: profile } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", user.id)
        .single();
      if (profile) {
        setName(profile.full_name || "");
        setPhone(profile.phone || "");
      }
    });
  }, [router]);

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    const { error } = await supabase
      .from("profiles")
      .update({ full_name: name, phone })
      .eq("id", user.id);
    if (error) {
      toast.error(error.message);
      setLoading(false);
      return;
    }
    toast.success("Profile updated successfully!");
    setLoading(false);
  }

  async function handleSignOut() {
    await supabase.auth.signOut();
    toast.success("Signed out successfully");
    router.push("/login");
  }

  const initials = (name || user?.email?.split("@")[0] || "A")
    .split(" ")
    .map((w: string) => w[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 font-sans antialiased py-10 px-4 sm:px-6">
      <div className="mx-auto max-w-2xl space-y-6">
        
        {/* Breadcrumb & Navigation */}
        <div className="flex items-center justify-between">
          <Link
            href="/dashboard"
            className="inline-flex items-center gap-2 text-xs font-bold text-slate-500 hover:text-blue-600 transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
            <span>Back to Student Dashboard</span>
          </Link>

          <span className="inline-flex items-center gap-1 text-[11px] font-bold text-blue-700 bg-blue-50 px-2.5 py-1 rounded-full border border-blue-200">
            <Sparkles className="h-3 w-3" />
            Account Settings
          </span>
        </div>

        {/* Profile Header Card */}
        <div className="rounded-3xl border border-slate-200/90 bg-white p-6 shadow-xs flex items-center gap-4">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-blue-600 to-indigo-600 text-white flex items-center justify-center font-black text-2xl shadow-md shadow-blue-500/20 shrink-0">
            {initials}
          </div>
          <div>
            <h1 className="text-xl font-black text-slate-900 tracking-tight">
              {name || "SSC Aspirant"}
            </h1>
            <p className="text-xs text-slate-500 font-medium mt-0.5">{user?.email}</p>
            <p className="text-[11px] text-emerald-600 font-semibold mt-1 flex items-center gap-1">
              <ShieldCheck className="h-3.5 w-3.5" />
              Verified Student Account
            </p>
          </div>
        </div>

        {/* Personal Details Form */}
        <div className="rounded-3xl border border-slate-200/90 bg-white p-6 sm:p-8 shadow-xs space-y-6">
          <div className="border-b border-slate-100 pb-3">
            <h2 className="text-sm font-black text-slate-900 uppercase tracking-wider">
              Personal Information
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Update your name and contact details for test reports and score notifications.
            </p>
          </div>

          <form onSubmit={handleSave} className="space-y-4">
            <div>
              <label className="text-xs font-bold text-slate-700 flex items-center gap-1.5 mb-1.5">
                <User className="h-3.5 w-3.5 text-blue-600" />
                Full Name
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Enter your full name"
                className="w-full rounded-xl border border-slate-200 px-3.5 py-2.5 text-xs text-slate-900 focus:outline-none focus:border-blue-600 focus:ring-1 focus:ring-blue-600"
              />
            </div>

            <div>
              <label className="text-xs font-bold text-slate-700 flex items-center gap-1.5 mb-1.5">
                <Phone className="h-3.5 w-3.5 text-blue-600" />
                Phone Number
              </label>
              <input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="+91 9876543210"
                className="w-full rounded-xl border border-slate-200 px-3.5 py-2.5 text-xs text-slate-900 focus:outline-none focus:border-blue-600 focus:ring-1 focus:ring-blue-600"
              />
            </div>

            <div>
              <label className="text-xs font-bold text-slate-700 flex items-center gap-1.5 mb-1.5">
                <Mail className="h-3.5 w-3.5 text-slate-400" />
                Email Address (Read-only)
              </label>
              <input
                type="email"
                value={user?.email || ""}
                disabled
                className="w-full rounded-xl border border-slate-200 bg-slate-100 px-3.5 py-2.5 text-xs text-slate-500 cursor-not-allowed"
              />
            </div>

            <div className="pt-2">
              <button
                type="submit"
                disabled={loading}
                className="inline-flex items-center justify-center gap-2 rounded-xl bg-blue-600 hover:bg-blue-700 px-5 py-2.5 text-xs font-bold text-white shadow-xs transition-colors disabled:opacity-50 cursor-pointer"
              >
                <Save className="h-3.5 w-3.5" />
                <span>{loading ? "Saving Changes..." : "Save Profile Details"}</span>
              </button>
            </div>
          </form>
        </div>

        {/* Security & Password Card */}
        <div className="rounded-3xl border border-slate-200/90 bg-white p-6 sm:p-8 shadow-xs space-y-3">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-sm font-black text-slate-900 flex items-center gap-2">
                <KeyRound className="h-4 w-4 text-blue-600" />
                Password & Security
              </h2>
              <p className="text-xs text-slate-500 mt-1">
                Protect your account with a secure password or request a reset link.
              </p>
            </div>

            <Link
              href="/update-password"
              className="px-3.5 py-2 rounded-xl border border-slate-200 bg-slate-50 hover:bg-slate-100 text-xs font-bold text-slate-700 transition-colors"
            >
              Change Password &rarr;
            </Link>
          </div>
        </div>

        {/* Logout Card */}
        <div className="rounded-3xl border border-rose-100 bg-rose-50/50 p-6 shadow-xs flex items-center justify-between">
          <div>
            <h3 className="text-sm font-black text-rose-900">Sign Out</h3>
            <p className="text-xs text-rose-600 mt-0.5">End your current session on this device.</p>
          </div>

          <button
            onClick={handleSignOut}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold shadow-xs transition-colors cursor-pointer"
          >
            <LogOut className="h-3.5 w-3.5" />
            <span>Logout</span>
          </button>
        </div>

      </div>
    </div>
  );
}
