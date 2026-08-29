"use client";

import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { 
  Sparkles, 
  Plus, 
  Trash2, 
  Edit3, 
  Eye, 
  CheckCircle2, 
  Clock, 
  Zap, 
  Link as LinkIcon, 
  Tag, 
  Radio,
  Layers,
  Volume2
} from "lucide-react";

export default function AdminTickerManagerPage() {
  const [tickers, setTickers] = useState<any[]>([
    {
      id: 1,
      title: "SSC CGL Tier 2 Exam Date Announced: 28 Days Remaining!",
      badge: "⏳ COUNTDOWN",
      link: "/exams/ssc-cgl",
      is_active: true,
      badgeColor: "bg-red-500 text-white",
    },
    {
      id: 2,
      title: "SSC CHSL Tier 1 Official Answer Key & Response Sheet Released",
      badge: "🔴 LIVE",
      link: "/papers",
      is_active: true,
      badgeColor: "bg-emerald-500 text-white",
    },
    {
      id: 3,
      title: "SSC CPO 2026 Notification Out — 4,000+ Vacancies Announced",
      badge: "🟢 NEW",
      link: "/exams/ssc-cpo",
      is_active: true,
      badgeColor: "bg-amber-500 text-gray-950",
    },
  ]);

  // Form State
  const [editingId, setEditingId] = useState<number | null>(null);
  const [title, setTitle] = useState("");
  const [badge, setBadge] = useState("🔴 LIVE");
  const [link, setLink] = useState("/exams");
  const [isActive, setIsActive] = useState(true);

  useEffect(() => {
    const saved = localStorage.getItem("ssczone_live_tickers");
    if (saved) {
      try {
        setTickers(JSON.parse(saved));
      } catch (e) {}
    }
  }, []);

  function saveTickersToStorage(items: any[]) {
    setTickers(items);
    localStorage.setItem("ssczone_live_tickers", JSON.stringify(items));
  }

  function handleSaveTicker(e: React.FormEvent) {
    e.preventDefault();
    if (!title.trim()) {
      toast.error("Title input karna zaroori hai!");
      return;
    }

    if (editingId) {
      const updated = tickers.map((t) =>
        t.id === editingId ? { ...t, title, badge, link, is_active: isActive } : t
      );
      saveTickersToStorage(updated);
      toast.success("Ticker Announcement Update Ho Gaya!");
      setEditingId(null);
    } else {
      const newItem = {
        id: Date.now(),
        title,
        badge,
        link,
        is_active: isActive,
        badgeColor: "bg-blue-600 text-white",
      };
      saveTickersToStorage([newItem, ...tickers]);
      toast.success("Naya Live Ticker Add Ho Gaya!");
    }

    resetForm();
  }

  function handleEdit(item: any) {
    setEditingId(item.id);
    setTitle(item.title);
    setBadge(item.badge);
    setLink(item.link);
    setIsActive(item.is_active);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function handleDelete(id: number) {
    if (confirm("Kya aap is ticker announcement ko delete karna chahte hain?")) {
      const updated = tickers.filter((t) => t.id !== id);
      saveTickersToStorage(updated);
      toast.success("Ticker Deleted!");
    }
  }

  function toggleActive(id: number) {
    const updated = tickers.map((t) =>
      t.id === id ? { ...t, is_active: !t.is_active } : t
    );
    saveTickersToStorage(updated);
    toast.success("Status Toggled!");
  }

  function resetForm() {
    setEditingId(null);
    setTitle("");
    setBadge("🔴 LIVE");
    setLink("/exams");
    setIsActive(true);
  }

  const activeTickers = tickers.filter((t) => t.is_active);

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="rounded-2xl bg-gradient-to-r from-blue-900 via-indigo-900 to-slate-900 p-6 text-white shadow-xl">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full bg-red-500/20 px-3 py-1 text-xs font-bold text-red-200 border border-red-400/30 mb-2">
              <Radio className="h-3.5 w-3.5 text-red-400 animate-pulse" />
              Real-Time Homepage Ticker Control Center
            </div>
            <h1 className="text-2xl font-black tracking-tight md:text-3xl">Live Exam Ticker & News Manager</h1>
            <p className="mt-1 text-sm text-blue-200/80 max-w-xl">
              Control live exam countdowns, answer key alerts, and top announcements displayed on the homepage ticker bar!
            </p>
          </div>

          <div className="flex items-center gap-2 bg-blue-950/60 border border-blue-400/20 px-4 py-2.5 rounded-xl text-xs font-bold shrink-0">
            <Volume2 className="h-4 w-4 text-emerald-400" />
            <span>Active Tickers: <b className="text-emerald-400 text-sm">{activeTickers.length}</b> / {tickers.length}</span>
          </div>
        </div>
      </div>

      {/* Live Preview Box */}
      <div className="rounded-2xl border border-blue-200 bg-gradient-to-r from-blue-50 to-indigo-50 p-4 shadow-sm space-y-2">
        <div className="flex items-center justify-between">
          <span className="text-xs font-black uppercase text-blue-900 tracking-wider flex items-center gap-1.5">
            <Eye className="h-4 w-4 text-blue-600" /> Live Homepage Ticker Bar Preview
          </span>
          <span className="text-[10px] font-bold text-blue-600 bg-blue-100 px-2 py-0.5 rounded-full">Real-Time Sync</span>
        </div>

        <div className="overflow-hidden rounded-xl border border-blue-200/80 bg-white p-2.5 shadow-xs">
          {activeTickers.length === 0 ? (
            <p className="text-center text-xs font-semibold text-gray-400 py-1">No active ticker announcements</p>
          ) : (
            <div className="flex items-center gap-3 overflow-x-auto whitespace-nowrap custom-scrollbar py-1">
              {activeTickers.map((t) => (
                <div key={t.id} className="flex items-center gap-2 rounded-lg bg-blue-50/70 border border-blue-100 px-3 py-1 text-xs font-extrabold text-blue-950 shrink-0">
                  <span className="rounded-md bg-red-600 px-1.5 py-0.5 text-[9px] font-black text-white">{t.badge}</span>
                  <span>{t.title}</span>
                  <LinkIcon className="h-3 w-3 text-blue-500" />
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Add / Edit Form & Tickers Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left Form */}
        <div className="lg:col-span-5">
          <form onSubmit={handleSaveTicker} className="rounded-2xl border border-gray-800 bg-gray-900 p-5 space-y-4 shadow-xl text-white">
            <h2 className="text-sm font-bold text-amber-400 flex items-center gap-2 border-b border-gray-800 pb-3">
              <Zap className="h-4 w-4" />
              {editingId ? "Edit Ticker Announcement" : "➕ Add New Live Ticker Alert"}
            </h2>

            <div>
              <label className="text-xs font-semibold text-gray-300">Ticker Title / Announcement Text</label>
              <textarea
                rows={3}
                placeholder="e.g. SSC CGL Tier 2 Exam Date Announced: 28 Days Remaining!"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full rounded-xl border border-gray-700 bg-gray-800 p-3 text-xs font-semibold text-white placeholder-gray-500 focus:border-amber-400 focus:outline-hidden"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-semibold text-gray-300">Badge Label</label>
                <select
                  value={badge}
                  onChange={(e) => setBadge(e.target.value)}
                  className="w-full rounded-xl border border-gray-700 bg-gray-800 p-2.5 text-xs font-bold text-white focus:border-amber-400 focus:outline-hidden"
                >
                  <option value="⏳ COUNTDOWN">⏳ COUNTDOWN</option>
                  <option value="🔴 LIVE">🔴 LIVE</option>
                  <option value="🟢 NEW">🟢 NEW</option>
                  <option value="🔥 HOT">🔥 HOT</option>
                  <option value="📋 ANSWER KEY">📋 ANSWER KEY</option>
                  <option value="📢 NOTIFICATION">📢 NOTIFICATION</option>
                </select>
              </div>

            <div>
              <label className="text-xs font-semibold text-gray-300">Select Target Page Link</label>
              <select
                onChange={(e) => {
                  if (e.target.value) setLink(e.target.value);
                }}
                className="w-full mb-2 rounded-xl border border-gray-700 bg-gray-800 p-2.5 text-xs font-bold text-amber-300 focus:border-amber-400 focus:outline-hidden"
              >
                <option value="">-- Choose Quick Target Page --</option>
                <option value="/exams/ssc-cgl">🎯 SSC CGL Exam Page (/exams/ssc-cgl)</option>
                <option value="/exams/ssc-chsl">🎯 SSC CHSL Exam Page (/exams/ssc-chsl)</option>
                <option value="/exams/ssc-cpo">🎯 SSC CPO Exam Page (/exams/ssc-cpo)</option>
                <option value="/exams/ssc-mts">🎯 SSC MTS Exam Page (/exams/ssc-mts)</option>
                <option value="/papers">📄 Previous Year Papers (/papers)</option>
                <option value="/mocks">🏆 Mock Tests (/mocks)</option>
                <option value="/daily-quiz">⚡ Daily Quiz (/daily-quiz)</option>
                <option value="/speed-test">⏱️ Speed Test (/speed-test)</option>
                <option value="/typing">⌨️ Typing Test (/typing)</option>
                <option value="/books">📚 SSC Books (/books)</option>
              </select>

              <label className="text-xs font-semibold text-gray-300">Target Link URL (Or Type Custom Link)</label>
              <input
                type="text"
                placeholder="e.g. /exams/ssc-cgl or https://..."
                value={link}
                onChange={(e) => setLink(e.target.value)}
                className="w-full rounded-xl border border-gray-700 bg-gray-800 px-3 py-2.5 text-xs font-bold text-white focus:border-amber-400 focus:outline-hidden"
              />
            </div>
            </div>

            <div className="flex items-center justify-between border-t border-gray-800 pt-3">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={isActive}
                  onChange={(e) => setIsActive(e.target.checked)}
                  className="h-4 w-4 rounded border-gray-700 bg-gray-800 text-amber-500"
                />
                <span className="text-xs font-bold text-gray-300">Show on Homepage (Active)</span>
              </label>

              <div className="flex gap-2">
                {editingId && (
                  <button
                    type="button"
                    onClick={resetForm}
                    className="rounded-xl border border-gray-700 bg-gray-800 px-3 py-2 text-xs font-bold text-gray-300 hover:bg-gray-700"
                  >
                    Cancel
                  </button>
                )}
                <button
                  type="submit"
                  className="flex items-center gap-1.5 rounded-xl bg-gradient-to-r from-amber-500 to-yellow-500 px-4 py-2 text-xs font-black text-gray-950 shadow-md hover:from-amber-400 hover:to-yellow-400 transition-all"
                >
                  <Plus className="h-4 w-4" />
                  {editingId ? "Update Ticker" : "Save Ticker"}
                </button>
              </div>
            </div>
          </form>
        </div>

        {/* Right Tickers Table / Cards */}
        <div className="lg:col-span-7 space-y-3">
          <div className="flex items-center justify-between rounded-2xl border border-gray-200 bg-white p-4 shadow-xs">
            <h2 className="text-sm font-black text-gray-900">Manage Ticker Items ({tickers.length})</h2>
            <span className="text-xs text-gray-500">Toggle ON/OFF to show/hide on website</span>
          </div>

          <div className="space-y-3 max-h-[calc(100vh-280px)] overflow-y-auto pr-1 custom-scrollbar">
            {tickers.map((t) => (
              <div
                key={t.id}
                className={`rounded-2xl border p-4 transition-all space-y-3 ${
                  t.is_active
                    ? "border-blue-200 bg-white shadow-xs"
                    : "border-gray-200 bg-gray-50/70 opacity-60"
                }`}
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-2">
                    <span className="rounded-md bg-red-600 px-2 py-0.5 text-[10px] font-black text-white">
                      {t.badge}
                    </span>
                    <span className="text-xs font-bold text-gray-900">{t.title}</span>
                  </div>

                  {/* Toggle Active Badge */}
                  <button
                    onClick={() => toggleActive(t.id)}
                    className={`rounded-full px-2.5 py-0.5 text-[10px] font-black border transition-all ${
                      t.is_active
                        ? "bg-emerald-50 text-emerald-700 border-emerald-300"
                        : "bg-gray-200 text-gray-700 border-gray-300"
                    }`}
                  >
                    {t.is_active ? "🟢 ON" : "⚪ OFF"}
                  </button>
                </div>

                <div className="flex items-center justify-between text-xs pt-2 border-t border-gray-100">
                  <span className="font-mono text-[11px] text-gray-500">Link: {t.link}</span>

                  <div className="flex gap-1.5">
                    <button
                      onClick={() => handleEdit(t)}
                      className="rounded-lg border border-gray-200 p-1.5 text-gray-600 hover:bg-gray-100 hover:text-blue-600"
                      title="Edit"
                    >
                      <Edit3 className="h-3.5 w-3.5" />
                    </button>
                    <button
                      onClick={() => handleDelete(t.id)}
                      className="rounded-lg border border-gray-200 p-1.5 text-gray-600 hover:bg-red-50 hover:text-red-600"
                      title="Delete"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
