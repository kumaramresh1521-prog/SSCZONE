"use client";

import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import Link from "next/link";
import { 
  Wrench, 
  Radio, 
  FileSpreadsheet, 
  Layers, 
  Plus, 
  Trash2, 
  Edit3, 
  Eye, 
  Zap, 
  Link as LinkIcon, 
  CheckCircle2, 
  HelpCircle,
  RotateCcw,
  Sparkles,
  FileText,
  ShieldCheck
} from "lucide-react";

export default function AdminToolsPage() {
  const [activeToolTab, setActiveToolTab] = useState<"ticker" | "pdf" | "reindex">("ticker");

  // Live Ticker State
  const [tickers, setTickers] = useState<any[]>([
    { id: 1, title: "SSC CGL Tier 2 Exam Date Announced: 28 Days Remaining!", badge: "⏳ COUNTDOWN", link: "/exams/ssc-cgl", is_active: true },
    { id: 2, title: "SSC CHSL Tier 1 Official Answer Key & Response Sheet Released", badge: "🔴 LIVE", link: "/papers", is_active: true },
    { id: 3, title: "SSC CPO 2026 Notification Out — 4,000+ Vacancies Announced", badge: "🟢 NEW", link: "/exams/ssc-cpo", is_active: true },
  ]);

  const [editingId, setEditingId] = useState<number | null>(null);
  const [title, setTitle] = useState("");
  const [badge, setBadge] = useState("🔴 LIVE");
  const [link, setLink] = useState("/exams/ssc-cgl");
  const [isActive, setIsActive] = useState(true);

  useEffect(() => {
    const saved = localStorage.getItem("ssczone_live_tickers");
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) setTickers(parsed);
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
      toast.error("Ticker title is required!");
      return;
    }

    if (editingId) {
      const updated = tickers.map((t) =>
        t.id === editingId ? { ...t, title, badge, link, is_active: isActive } : t
      );
      saveTickersToStorage(updated);
      toast.success("Live Ticker Updated!");
      setEditingId(null);
    } else {
      const newItem = { id: Date.now(), title, badge, link, is_active: isActive };
      saveTickersToStorage([newItem, ...tickers]);
      toast.success("New Live Ticker Alert Added!");
    }
    resetForm();
  }

  function handleEdit(t: any) {
    setEditingId(t.id);
    setTitle(t.title);
    setBadge(t.badge);
    setLink(t.link);
    setIsActive(t.is_active);
  }

  function handleDelete(id: number) {
    if (confirm("Delete this ticker alert?")) {
      const updated = tickers.filter((t) => t.id !== id);
      saveTickersToStorage(updated);
      toast.success("Ticker Alert Deleted!");
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
    setLink("/exams/ssc-cgl");
    setIsActive(true);
  }

  const activeTickers = tickers.filter((t) => t.is_active);

  return (
    <div className="space-y-6 text-white max-w-7xl mx-auto">
      
      {/* Page Header */}
      <div className="rounded-3xl bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 border border-indigo-500/20 p-6 shadow-2xl">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full bg-amber-500/20 px-3 py-1 text-xs font-bold text-amber-300 border border-amber-400/30 mb-2">
              <Wrench className="h-3.5 w-3.5 text-amber-400" />
              Admin Tools & Utilities Control Center
            </div>
            <h1 className="text-2xl font-black text-white tracking-tight md:text-3xl">Admin Utility Tools</h1>
            <p className="mt-1 text-xs text-indigo-200/80 max-w-xl">
              Dedicated tools for live news tickers, target page links, PDF exam paper parsing, and topic re-indexing.
            </p>
          </div>

          <div className="flex items-center gap-2 bg-slate-950/80 border border-white/10 px-4 py-2.5 rounded-2xl text-xs font-bold shrink-0">
            <Radio className="h-4 w-4 text-red-500 animate-pulse" />
            <span>Active Live Alerts: <b className="text-amber-400 text-sm">{activeTickers.length}</b></span>
          </div>
        </div>

        {/* Tools Section Selector Tabs */}
        <div className="mt-6 flex flex-wrap gap-2 border-t border-white/10 pt-4">
          <button
            onClick={() => setActiveToolTab("ticker")}
            className={`flex items-center gap-2 rounded-xl px-4 py-2.5 text-xs font-black transition-all ${
              activeToolTab === "ticker"
                ? "bg-red-600 text-white shadow-lg"
                : "bg-white/5 text-gray-400 hover:bg-white/10 hover:text-white"
            }`}
          >
            <Radio className="h-4 w-4 text-amber-300" />
            Tool 1: Live News Ticker & Link Editor ({tickers.length})
          </button>

          <button
            onClick={() => setActiveToolTab("pdf")}
            className={`flex items-center gap-2 rounded-xl px-4 py-2.5 text-xs font-black transition-all ${
              activeToolTab === "pdf"
                ? "bg-blue-600 text-white shadow-lg"
                : "bg-white/5 text-gray-400 hover:bg-white/10 hover:text-white"
            }`}
          >
            <FileSpreadsheet className="h-4 w-4 text-cyan-300" />
            Tool 2: PDF Question Parser
          </button>

          <button
            onClick={() => setActiveToolTab("reindex")}
            className={`flex items-center gap-2 rounded-xl px-4 py-2.5 text-xs font-black transition-all ${
              activeToolTab === "reindex"
                ? "bg-indigo-600 text-white shadow-lg"
                : "bg-white/5 text-gray-400 hover:bg-white/10 hover:text-white"
            }`}
          >
            <Layers className="h-4 w-4 text-purple-300" />
            Tool 3: Topic Sequence Re-Indexer
          </button>
        </div>
      </div>

      {/* TOOL 1: LIVE NEWS TICKER & LINK CUSTOMIZER */}
      {activeToolTab === "ticker" && (
        <div className="space-y-6">
          {/* Live Preview Bar */}
          <div className="rounded-2xl border border-blue-500/30 bg-slate-900 p-4 space-y-2">
            <div className="flex items-center justify-between border-b border-gray-800 pb-2">
              <span className="text-xs font-black uppercase text-blue-400 flex items-center gap-1.5">
                <Eye className="h-4 w-4" /> Live Homepage Ticker Bar Preview
              </span>
              <span className="text-[10px] bg-blue-500/20 text-blue-300 px-2 py-0.5 rounded-full font-bold">Auto Sync</span>
            </div>

            <div className="rounded-xl border border-gray-800 bg-slate-950 p-3 overflow-x-auto whitespace-nowrap custom-scrollbar">
              <div className="inline-flex items-center gap-4">
                {activeTickers.map((t) => (
                  <div key={t.id} className="inline-flex items-center gap-2 rounded-lg bg-white/10 px-3 py-1 text-xs font-bold text-white shrink-0">
                    <span className="rounded-md bg-red-600 px-1.5 py-0.5 text-[9px] font-black text-white">{t.badge}</span>
                    <span>{t.title}</span>
                    <span className="text-amber-400 font-mono text-[10px]">({t.link})</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* Form Left */}
            <div className="lg:col-span-5">
              <form onSubmit={handleSaveTicker} className="rounded-2xl border border-gray-800 bg-gray-900 p-5 space-y-4 shadow-xl">
                <h3 className="text-sm font-bold text-amber-400 flex items-center gap-2 border-b border-gray-800 pb-3">
                  <Zap className="h-4 w-4" />
                  {editingId ? "Edit Live Ticker Alert" : "➕ Add New Live Alert"}
                </h3>

                <div>
                  <label className="text-xs font-semibold text-gray-300">Ticker Announcement Title</label>
                  <textarea
                    rows={3}
                    placeholder="e.g. SSC CGL Tier 2 Exam Date Announced: 28 Days Remaining!"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    className="w-full rounded-xl border border-gray-700 bg-gray-800 p-3 text-xs font-semibold text-white focus:border-amber-400 focus:outline-hidden"
                  />
                </div>

                <div>
                  <label className="text-xs font-semibold text-gray-300">Badge Tag</label>
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
                  </select>
                </div>

                <div>
                  <label className="text-xs font-semibold text-gray-300">Quick Select Target Page Link</label>
                  <select
                    onChange={(e) => { if (e.target.value) setLink(e.target.value); }}
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
                    <option value="/books">📚 SSC Books (/books)</option>
                  </select>

                  <label className="text-xs font-semibold text-gray-300">Target Link URL (Custom)</label>
                  <input
                    type="text"
                    value={link}
                    onChange={(e) => setLink(e.target.value)}
                    className="w-full rounded-xl border border-gray-700 bg-gray-800 p-2.5 text-xs font-bold text-white focus:border-amber-400 focus:outline-hidden"
                  />
                </div>

                <div className="flex items-center justify-between border-t border-gray-800 pt-3">
                  <label className="flex items-center gap-2 cursor-pointer text-xs font-bold text-gray-300">
                    <input
                      type="checkbox"
                      checked={isActive}
                      onChange={(e) => setIsActive(e.target.checked)}
                      className="h-4 w-4 rounded border-gray-700 bg-gray-800 text-amber-500"
                    />
                    Active on Homepage
                  </label>

                  <div className="flex gap-2">
                    {editingId && (
                      <button type="button" onClick={resetForm} className="rounded-xl border border-gray-700 bg-gray-800 px-3 py-2 text-xs font-bold text-gray-300">
                        Cancel
                      </button>
                    )}
                    <button type="submit" className="rounded-xl bg-amber-400 px-4 py-2 text-xs font-black text-gray-950 shadow-md hover:bg-amber-300">
                      {editingId ? "Update Ticker" : "Save Ticker"}
                    </button>
                  </div>
                </div>
              </form>
            </div>

            {/* List Right */}
            <div className="lg:col-span-7 space-y-3">
              <div className="rounded-2xl border border-gray-800 bg-gray-900 p-4">
                <h4 className="text-xs font-black uppercase text-gray-400 tracking-wider">Manage All Tickers ({tickers.length})</h4>
              </div>

              <div className="space-y-3">
                {tickers.map((t) => (
                  <div key={t.id} className="rounded-2xl border border-gray-800 bg-gray-900 p-4 space-y-3 shadow-xs">
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-center gap-2">
                        <span className="rounded-md bg-red-600 px-2 py-0.5 text-[10px] font-black text-white">{t.badge}</span>
                        <span className="text-xs font-bold text-white">{t.title}</span>
                      </div>
                      <button
                        onClick={() => toggleActive(t.id)}
                        className={`rounded-full px-2.5 py-0.5 text-[10px] font-black border ${t.is_active ? "bg-emerald-500/20 text-emerald-300 border-emerald-500/40" : "bg-gray-800 text-gray-400 border-gray-700"}`}
                      >
                        {t.is_active ? "🟢 ON" : "⚪ OFF"}
                      </button>
                    </div>

                    <div className="flex items-center justify-between text-xs pt-2 border-t border-gray-800">
                      <span className="font-mono text-[11px] text-amber-400 font-bold">Target Link: {t.link}</span>
                      <div className="flex gap-2">
                        <button onClick={() => handleEdit(t)} className="rounded-lg border border-gray-700 p-1.5 text-gray-300 hover:text-blue-400">
                          <Edit3 className="h-3.5 w-3.5" />
                        </button>
                        <button onClick={() => handleDelete(t.id)} className="rounded-lg border border-gray-700 p-1.5 text-gray-300 hover:text-red-400">
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
      )}

      {/* TOOL 2: PDF QUESTION PARSER */}
      {activeToolTab === "pdf" && (
        <div className="rounded-2xl border border-gray-800 bg-gray-900 p-6 space-y-4">
          <h3 className="text-base font-extrabold text-white flex items-center gap-2">
            <FileSpreadsheet className="h-5 w-5 text-cyan-400" />
            PDF Question Paper & Solutions Importer Tool
          </h3>
          <p className="text-xs text-gray-400">
            Automated PDF parser module for multi-pass Adda247 question papers with solution merging.
          </p>
          <Link
            href="/admin/questions"
            className="inline-flex items-center gap-2 rounded-xl bg-blue-600 px-5 py-2.5 text-xs font-extrabold text-white hover:bg-blue-500 shadow-md"
          >
            Open Question Bank & PDF Parser ➔
          </Link>
        </div>
      )}

      {/* TOOL 3: TOPIC RE-INDEXER */}
      {activeToolTab === "reindex" && (
        <div className="rounded-2xl border border-gray-800 bg-gray-900 p-6 space-y-4">
          <h3 className="text-base font-extrabold text-white flex items-center gap-2">
            <Layers className="h-5 w-5 text-purple-400" />
            Topic Sequence Re-Indexer Utility
          </h3>
          <p className="text-xs text-gray-400">
            Re-indexes all 245+ topics across the master database in ascending sort order (1, 2, 3...).
          </p>
          <Link
            href="/admin/topics"
            className="inline-flex items-center gap-2 rounded-xl bg-indigo-600 px-5 py-2.5 text-xs font-extrabold text-white hover:bg-indigo-500 shadow-md"
          >
            Open Topic Re-Indexer ➔
          </Link>
        </div>
      )}
    </div>
  );
}
