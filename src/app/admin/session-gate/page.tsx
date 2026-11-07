"use client";

import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import Link from "next/link";
import {
  ShieldAlert,
  Clock,
  Lock,
  CheckCircle2,
  AlertTriangle,
  RotateCcw,
  Sparkles,
  Save,
  Eye,
  Sliders,
  Check,
  X,
  LogIn,
  UserPlus,
  Bookmark,
  Trophy,
} from "lucide-react";
import type { SessionGateConfig } from "@/lib/session-gate-store";

const PRESET_MINUTES = [5, 10, 15, 20, 30, 45, 60];

export default function AdminSessionGatePage() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // Form State
  const [isEnabled, setIsEnabled] = useState(true);
  const [sessionLimitMinutes, setSessionLimitMinutes] = useState(15);
  const [blockTestAttempts, setBlockTestAttempts] = useState(true);
  const [showModalPopup, setShowModalPopup] = useState(true);
  const [modalTitle, setModalTitle] = useState("⏰ Guest Session Limit Reached (15 Mins)");
  const [modalMessage, setModalMessage] = useState(
    "Aapka 15-minute free guest preview complete ho chuka hai. Agla test attempt karne aur apne scorecards & bookmarks save karne ke liye kripya Free Login ya Sign Up karein."
  );
  const [exemptLoggedIn, setExemptLoggedIn] = useState(true);
  const [updatedAt, setUpdatedAt] = useState<string | null>(null);

  // Load config on mount
  useEffect(() => {
    fetchConfig();
  }, []);

  async function fetchConfig() {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/session-gate");
      const data = await res.json();
      if (data.success && data.config) {
        const c: SessionGateConfig = data.config;
        setIsEnabled(c.is_enabled);
        setSessionLimitMinutes(c.session_limit_minutes || 15);
        setBlockTestAttempts(c.block_test_attempts);
        setShowModalPopup(c.show_modal_popup);
        setModalTitle(c.modal_title || "⏰ Guest Session Limit Reached");
        setModalMessage(
          c.modal_message ||
            "Aapka 15-minute free guest preview complete ho chuka hai. Agla test attempt karne aur apne scorecards & bookmarks save karne ke liye kripya Free Login ya Sign Up karein."
        );
        setExemptLoggedIn(c.exempt_logged_in !== false);
        setUpdatedAt(c.updated_at || null);
      }
    } catch (e) {
      toast.error("Failed to load gatekeeper settings");
    } finally {
      setLoading(false);
    }
  }

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    const tid = toast.loading("Saving gatekeeper configuration...");

    try {
      const res = await fetch("/api/admin/session-gate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          is_enabled: isEnabled,
          session_limit_minutes: Number(sessionLimitMinutes) || 15,
          block_test_attempts: blockTestAttempts,
          show_modal_popup: showModalPopup,
          modal_title: modalTitle,
          modal_message: modalMessage,
          exempt_logged_in: exemptLoggedIn,
        }),
      });

      const data = await res.json();
      if (data.success) {
        toast.success("Guest Session Gatekeeper saved & active!", { id: tid });
        setUpdatedAt(data.config?.updated_at || new Date().toISOString());
      } else {
        toast.error(data.error || "Failed to save settings", { id: tid });
      }
    } catch (e: any) {
      toast.error("Network error: " + e.message, { id: tid });
    } finally {
      setSaving(false);
    }
  }

  function handleResetDefaults() {
    if (confirm("Reset to recommended 15-minute guest limits?")) {
      setIsEnabled(true);
      setSessionLimitMinutes(15);
      setBlockTestAttempts(true);
      setShowModalPopup(true);
      setModalTitle("⏰ Guest Session Limit Reached (15 Mins)");
      setModalMessage(
        "Aapka 15-minute free guest preview complete ho chuka hai. Agla test attempt karne aur apne scorecards & bookmarks save karne ke liye kripya Free Login ya Sign Up karein."
      );
      setExemptLoggedIn(true);
      toast.success("Reset to 15-minute defaults. Click 'Save' to apply.");
    }
  }

  if (loading) {
    return (
      <div className="p-8 text-center text-slate-400">
        <Clock className="w-8 h-8 animate-spin mx-auto mb-3 text-sky-400" />
        <p className="text-sm font-semibold">Loading Session Gatekeeper configuration...</p>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-5xl space-y-6 text-slate-100 p-4 sm:p-6 pb-20">
      {/* HEADER SECTION */}
      <section className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/10 pb-6">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-amber-500/10 text-amber-300 border border-amber-500/20 mb-2">
            <ShieldAlert className="w-3.5 h-3.5" />
            <span>Access Control & Student Conversion</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
            Guest Session & IP Gatekeeper
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-1 max-w-2xl leading-relaxed">
            Protect platform resources and boost user registrations. Configure the 15-minute guest limit
            to show login popups and block subsequent test sessions until the student signs in.
          </p>
        </div>

        <div className="flex items-center gap-2.5 self-start sm:self-auto">
          <button
            type="button"
            onClick={handleResetDefaults}
            className="px-3.5 py-2 rounded-xl border border-white/10 bg-white/5 hover:bg-white/10 text-xs font-bold text-slate-300 flex items-center gap-1.5 transition-colors cursor-pointer"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Reset Defaults</span>
          </button>
        </div>
      </section>

      {/* OVERVIEW METRIC TILES */}
      <section className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Tile 1: Status */}
        <div className="bg-slate-800/80 rounded-2xl border border-white/10 p-4 space-y-1">
          <div className="flex items-center justify-between text-xs text-slate-400 font-semibold">
            <span>Gatekeeper Status</span>
            <ShieldAlert className={`w-4 h-4 ${isEnabled ? "text-emerald-400" : "text-slate-500"}`} />
          </div>
          <div className={`text-xl font-black ${isEnabled ? "text-emerald-400" : "text-rose-400"}`}>
            {isEnabled ? "ACTIVE (ON)" : "PAUSED (OFF)"}
          </div>
          <p className="text-[11px] text-slate-400">
            {isEnabled ? "Enforcing session limits" : "All guests browse freely"}
          </p>
        </div>

        {/* Tile 2: Limit */}
        <div className="bg-slate-800/80 rounded-2xl border border-white/10 p-4 space-y-1">
          <div className="flex items-center justify-between text-xs text-slate-400 font-semibold">
            <span>Time Threshold</span>
            <Clock className="w-4 h-4 text-amber-400" />
          </div>
          <div className="text-xl font-black text-white">{sessionLimitMinutes} Minutes</div>
          <p className="text-[11px] text-slate-400">Continuous guest browsing time</p>
        </div>

        {/* Tile 3: Blocking Next Sessions */}
        <div className="bg-slate-800/80 rounded-2xl border border-white/10 p-4 space-y-1">
          <div className="flex items-center justify-between text-xs text-slate-400 font-semibold">
            <span>Block Next Tests</span>
            <Lock className="w-4 h-4 text-sky-400" />
          </div>
          <div className="text-xl font-black text-white">
            {blockTestAttempts ? "ENFORCED" : "ALLOW ATTEMPTS"}
          </div>
          <p className="text-[11px] text-slate-400">Speed tests & CBT drills blocked</p>
        </div>

        {/* Tile 4: Logged In Exemption */}
        <div className="bg-slate-800/80 rounded-2xl border border-white/10 p-4 space-y-1">
          <div className="flex items-center justify-between text-xs text-slate-400 font-semibold">
            <span>Logged-In Exemption</span>
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="text-xl font-black text-emerald-400">100% UNLIMITED</div>
          <p className="text-[11px] text-slate-400">Registered users never gated</p>
        </div>
      </section>

      {/* MAIN CONFIGURATION FORM */}
      <form onSubmit={handleSave} className="space-y-6">
        <div className="bg-slate-800/80 rounded-3xl border border-white/10 p-6 sm:p-8 space-y-6">
          <div className="flex items-center justify-between border-b border-white/10 pb-4">
            <div>
              <h2 className="text-lg font-bold text-white flex items-center gap-2">
                <Sliders className="w-5 h-5 text-sky-400" />
                <span>Gatekeeper Controls & Thresholds</span>
              </h2>
              <p className="text-xs text-slate-400 mt-0.5">
                Configure how and when the 15-minute guest restriction triggers.
              </p>
            </div>

            {/* Master Toggle */}
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={isEnabled}
                onChange={(e) => setIsEnabled(e.target.checked)}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-slate-700 peer-focus:outline-hidden rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-500"></div>
              <span className="ml-3 text-xs font-bold text-slate-300">
                {isEnabled ? "Feature Enabled" : "Feature Disabled"}
              </span>
            </label>
          </div>

          {/* Time Limit Setting */}
          <div className="space-y-3">
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-300">
              Guest Session Time Limit (Minutes)
            </label>
            <p className="text-xs text-slate-400">
              Select or type how many minutes an unauthenticated visitor from an IP can practice before the login gate triggers.
            </p>

            <div className="flex items-center gap-2 flex-wrap">
              {PRESET_MINUTES.map((mins) => (
                <button
                  key={mins}
                  type="button"
                  onClick={() => setSessionLimitMinutes(mins)}
                  className={`px-3.5 py-2 rounded-xl text-xs font-bold border transition-all cursor-pointer ${
                    sessionLimitMinutes === mins
                      ? "bg-amber-500 text-slate-950 border-amber-400 shadow-md font-extrabold"
                      : "bg-slate-900 border-white/10 text-slate-300 hover:bg-slate-700"
                  }`}
                >
                  {mins === 15 ? "⭐ 15 Mins (Default)" : `${mins} Mins`}
                </button>
              ))}

              <div className="flex items-center gap-2 ml-auto">
                <span className="text-xs text-slate-400 font-semibold">Custom:</span>
                <input
                  type="number"
                  min="1"
                  max="1440"
                  value={sessionLimitMinutes}
                  onChange={(e) => setSessionLimitMinutes(Math.max(1, parseInt(e.target.value) || 15))}
                  className="w-24 px-3 py-1.5 rounded-xl border border-white/10 bg-slate-900 text-white font-mono text-xs font-bold focus:border-sky-400 focus:outline-hidden"
                />
                <span className="text-xs text-slate-400">mins</span>
              </div>
            </div>
          </div>

          {/* Enforcement Toggles */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-4 border-t border-white/10">
            {/* Toggle 1: Block Test Attempts */}
            <div className="bg-slate-900/80 rounded-2xl p-4 border border-white/10 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-white flex items-center gap-1.5">
                  <Lock className="w-4 h-4 text-rose-400" />
                  Block Next Attempts
                </span>
                <input
                  type="checkbox"
                  checked={blockTestAttempts}
                  onChange={(e) => setBlockTestAttempts(e.target.checked)}
                  className="w-4 h-4 accent-sky-500 rounded cursor-pointer"
                />
              </div>
              <p className="text-[11px] text-slate-400 leading-relaxed">
                Prevents guests from launching Speed Tests, Daily Quizzes, or CBT Mock Exams after their 15 minutes is reached.
              </p>
            </div>

            {/* Toggle 2: Show Modal Popup */}
            <div className="bg-slate-900/80 rounded-2xl p-4 border border-white/10 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-white flex items-center gap-1.5">
                  <Clock className="w-4 h-4 text-amber-400" />
                  Show Modal Popup
                </span>
                <input
                  type="checkbox"
                  checked={showModalPopup}
                  onChange={(e) => setShowModalPopup(e.target.checked)}
                  className="w-4 h-4 accent-sky-500 rounded cursor-pointer"
                />
              </div>
              <p className="text-[11px] text-slate-400 leading-relaxed">
                Displays the high-converting login prompt automatically once the visitor passes the time limit.
              </p>
            </div>

            {/* Toggle 3: Exempt Logged-in Users */}
            <div className="bg-slate-900/80 rounded-2xl p-4 border border-white/10 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-white flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                  Exempt Logged-In Users
                </span>
                <input
                  type="checkbox"
                  checked={exemptLoggedIn}
                  onChange={(e) => setExemptLoggedIn(e.target.checked)}
                  className="w-4 h-4 accent-sky-500 rounded cursor-pointer"
                />
              </div>
              <p className="text-[11px] text-slate-400 leading-relaxed">
                Registered users (free & VIP) are completely exempt and have unlimited practice sessions.
              </p>
            </div>
          </div>

          {/* Modal Content Customization */}
          <div className="space-y-4 pt-4 border-t border-white/10">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-300">
              Modal Popup Messaging & Content
            </h3>

            <div>
              <label className="block text-xs font-bold text-slate-400 mb-1">Modal Heading</label>
              <input
                type="text"
                value={modalTitle}
                onChange={(e) => setModalTitle(e.target.value)}
                placeholder="e.g. ⏰ Guest Session Limit Reached (15 Mins)"
                className="w-full px-4 py-2.5 rounded-xl border border-white/10 bg-slate-900 text-white text-xs sm:text-sm font-semibold focus:border-sky-400 focus:outline-hidden"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-400 mb-1">
                Modal Message / Explanation (Hindi / English)
              </label>
              <textarea
                rows={3}
                value={modalMessage}
                onChange={(e) => setModalMessage(e.target.value)}
                placeholder="Message explaining that 15 minutes guest preview has completed..."
                className="w-full px-4 py-2.5 rounded-xl border border-white/10 bg-slate-900 text-white text-xs sm:text-sm font-medium focus:border-sky-400 focus:outline-hidden leading-relaxed"
              />
            </div>
          </div>

          {/* LIVE VISUAL PREVIEW OF POPUP */}
          <div className="pt-4 border-t border-white/10 space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-300 flex items-center gap-1.5">
                <Eye className="w-4 h-4 text-amber-400" />
                Live Student-Facing Popup Preview
              </h3>
              <span className="text-[11px] text-slate-400">How the popup appears on website</span>
            </div>

            {/* Preview Box Container */}
            <div className="p-4 sm:p-6 rounded-2xl bg-slate-950/90 border border-slate-700/60 flex items-center justify-center">
              <div className="w-full max-w-md bg-white rounded-2xl p-5 shadow-2xl text-slate-900 space-y-4 border border-slate-200">
                <div className="flex items-center justify-between">
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-amber-50 border border-amber-200 text-amber-800 text-[11px] font-bold">
                    <Clock className="w-3 h-3 text-amber-600 animate-pulse" />
                    <span>{sessionLimitMinutes}-Minute Free Guest Session Complete</span>
                  </span>
                  <X className="w-4 h-4 text-slate-400" />
                </div>

                <div>
                  <h4 className="text-base font-extrabold text-slate-950">{modalTitle}</h4>
                  <p className="text-xs text-slate-600 mt-1 leading-relaxed">{modalMessage}</p>
                </div>

                <div className="bg-slate-50 rounded-xl p-3 border border-slate-200 text-xs space-y-1.5 font-semibold text-slate-700">
                  <div className="flex items-center gap-1.5">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                    <span>Save your speed drills & test scorecards to Dashboard</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <Bookmark className="w-3.5 h-3.5 text-amber-500 shrink-0" />
                    <span>Collect tricky questions & formulas for last-minute revision</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <Trophy className="w-3.5 h-3.5 text-blue-600 shrink-0" />
                    <span>Unlimited access to Speed Test Drills & Daily Free Quizzes</span>
                  </div>
                </div>

                <div className="flex gap-2 pt-1">
                  <div className="flex-1 py-2 rounded-xl bg-blue-600 text-white font-bold text-xs text-center flex items-center justify-center gap-1">
                    <LogIn className="w-3.5 h-3.5" />
                    <span>Login to Account</span>
                  </div>
                  <div className="flex-1 py-2 rounded-xl bg-emerald-600 text-white font-bold text-xs text-center flex items-center justify-center gap-1">
                    <UserPlus className="w-3.5 h-3.5" />
                    <span>Create Free Account</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* SAVE BUTTON */}
          <div className="pt-4 border-t border-white/10 flex items-center justify-between flex-wrap gap-3">
            <p className="text-xs text-slate-400">
              {updatedAt ? `Last published: ${new Date(updatedAt).toLocaleString("en-IN")}` : "Unsaved changes"}
            </p>

            <button
              type="submit"
              disabled={saving}
              className="px-6 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 active:scale-95 disabled:opacity-50 text-white font-bold text-xs sm:text-sm flex items-center gap-2 shadow-lg transition-all cursor-pointer"
            >
              <Save className="w-4 h-4" />
              <span>{saving ? "Saving..." : "Save & Publish Gate Settings"}</span>
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}
