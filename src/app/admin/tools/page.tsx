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
  CheckCircle2, 
  RotateCcw, 
  Sparkles, 
  FileText, 
  ShieldCheck,
  Trophy,
  Calendar,
  Image as ImageIcon,
  Keyboard,
  CheckSquare,
  ArrowUp,
  ArrowDown,
  ExternalLink,
  Save,
  Globe,
  Sliders,
  Check,
  AlertCircle,
  Upload,
  Code
} from "lucide-react";
import { CandidateTool, DEFAULT_CANDIDATE_TOOLS } from "@/lib/candidate-tools-store";

// Icon options mapping
const ICON_OPTIONS = [
  { name: "CheckSquare", label: "CheckSquare (Syllabus/Checklist)", icon: CheckSquare },
  { name: "Trophy", label: "Trophy (Rank Predictor)", icon: Trophy },
  { name: "Image", label: "Image (Photo/Signature Resizer)", icon: ImageIcon },
  { name: "Keyboard", label: "Keyboard (Typing Test)", icon: Keyboard },
  { name: "Calendar", label: "Calendar (Age Calculator)", icon: Calendar },
  { name: "Wrench", label: "Wrench (Utility/Toolkit)", icon: Wrench },
  { name: "Sparkles", label: "Sparkles (AI/Special Tool)", icon: Sparkles },
  { name: "Zap", label: "Zap (Rapid/Speed Tool)", icon: Zap },
  { name: "FileText", label: "FileText (Notes/PDF Tool)", icon: FileText },
  { name: "ShieldCheck", label: "ShieldCheck (Gate/Security)", icon: ShieldCheck },
];

// Gradient presets
const GRADIENT_PRESETS = [
  { label: "Purple to Indigo (Syllabus)", value: "from-purple-600 to-indigo-600" },
  { label: "Blue to Indigo (Rank)", value: "from-blue-600 to-indigo-600" },
  { label: "Teal to Emerald (Photo)", value: "from-teal-600 to-emerald-600" },
  { label: "Amber to Orange (Typing)", value: "from-amber-600 to-orange-600" },
  { label: "Indigo to Purple (Age)", value: "from-indigo-600 to-purple-600" },
  { label: "Rose to Red (Alert)", value: "from-rose-600 to-red-600" },
  { label: "Cyan to Blue (Tech)", value: "from-cyan-600 to-blue-600" },
];

// Badge color presets
const BADGE_COLOR_PRESETS = [
  { label: "Purple (Flagship)", value: "bg-purple-600 text-white" },
  { label: "Blue (Popular)", value: "bg-blue-600 text-white" },
  { label: "Teal (Zero Upload)", value: "bg-teal-600 text-white" },
  { label: "Amber (Exam Hall)", value: "bg-amber-600 text-white" },
  { label: "Indigo (Accurate)", value: "bg-indigo-600 text-white" },
  { label: "Emerald (Verified)", value: "bg-emerald-600 text-white" },
  { label: "Red (Hot / Live)", value: "bg-red-600 text-white" },
];

export default function AdminToolsPage() {
  const [activeToolTab, setActiveToolTab] = useState<"candidate-tools" | "ticker" | "pdf" | "reindex">("candidate-tools");

  // ==========================================
  // CANDIDATE TOOLS CMS STATE (SUPABASE)
  // ==========================================
  const [candidateTools, setCandidateTools] = useState<CandidateTool[]>([]);
  const [loadingTools, setLoadingTools] = useState(true);
  const [savingTools, setSavingTools] = useState(false);
  const [editingToolId, setEditingToolId] = useState<string | null>(null);

  // Form State for Tool
  const [toolId, setToolId] = useState("");
  const [toolTitle, setToolTitle] = useState("");
  const [toolDescription, setToolDescription] = useState("");
  const [toolHref, setToolHref] = useState("");
  const [toolIconName, setToolIconName] = useState("Wrench");
  const [toolBadge, setToolBadge] = useState("⚡ NEW");
  const [toolBadgeColor, setToolBadgeColor] = useState("bg-blue-600 text-white");
  const [toolGradient, setToolGradient] = useState("from-blue-600 to-indigo-600");
  const [toolCategory, setToolCategory] = useState<"calculator" | "utility" | "practice" | "checklist">("utility");
  const [toolFeaturesText, setToolFeaturesText] = useState("");
  const [toolContentMd, setToolContentMd] = useState("");
  const [toolHasCustomPage, setToolHasCustomPage] = useState(false);
  const [toolIsActive, setToolIsActive] = useState(true);
  const [toolSortOrder, setToolSortOrder] = useState<number>(1);

  // Load tools from API / Supabase
  useEffect(() => {
    fetchCandidateTools();
  }, []);

  async function fetchCandidateTools() {
    setLoadingTools(true);
    try {
      const res = await fetch("/api/candidate-tools?all=true");
      const json = await res.json();
      if (json?.tools && Array.isArray(json.tools) && json.tools.length > 0) {
        setCandidateTools(json.tools);
      } else {
        setCandidateTools(DEFAULT_CANDIDATE_TOOLS);
      }
    } catch (e) {
      console.warn("Failed to fetch candidate tools:", e);
      setCandidateTools(DEFAULT_CANDIDATE_TOOLS);
    } finally {
      setLoadingTools(false);
    }
  }

  // Save full tool list to Supabase via API
  async function saveToolsToSupabase(toolsToSave: CandidateTool[]) {
    setSavingTools(true);
    try {
      const res = await fetch("/api/candidate-tools", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ tools: toolsToSave }),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        toast.success("Candidate tools synced to Supabase site_settings!");
        setCandidateTools(toolsToSave);
      } else {
        toast.error(data.error || "Failed to save tools to Supabase");
      }
    } catch (err: any) {
      toast.error(err?.message || "Network error saving tools");
    } finally {
      setSavingTools(false);
    }
  }

  function handleSaveToolForm(e: React.FormEvent) {
    e.preventDefault();
    if (!toolTitle.trim()) {
      toast.error("Tool title is required!");
      return;
    }
    if (!toolHref.trim()) {
      toast.error("Target route / URL is required!");
      return;
    }

    const cleanFeatures = toolFeaturesText
      .split("\n")
      .map((f) => f.trim())
      .filter((f) => f.length > 0);

    const generatedId =
      toolId.trim() ||
      toolTitle
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/^-|-$/g, "");

    const newOrUpdatedTool: CandidateTool = {
      id: generatedId,
      title: toolTitle.trim(),
      description: toolDescription.trim(),
      href: toolHref.trim(),
      iconName: toolIconName,
      badge: toolBadge.trim(),
      badgeColor: toolBadgeColor,
      gradient: toolGradient,
      category: toolCategory,
      features: cleanFeatures.length > 0 ? cleanFeatures : ["High Precision Candidate Tool", "Official SSC Aligned"],
      isActive: toolIsActive,
      sortOrder: toolSortOrder || candidateTools.length + 1,
      content_md: toolContentMd.trim() || undefined,
      hasCustomPage: toolHasCustomPage,
    };

    let updatedList: CandidateTool[];
    if (editingToolId) {
      updatedList = candidateTools.map((t) => (t.id === editingToolId ? newOrUpdatedTool : t));
      toast.success(`Updated "${toolTitle}"! Click "Save to Supabase" to make live.`);
    } else {
      updatedList = [...candidateTools, newOrUpdatedTool];
      toast.success(`Added "${toolTitle}"! Click "Save to Supabase" to make live.`);
    }

    // Sort by sortOrder
    updatedList.sort((a, b) => (a.sortOrder || 0) - (b.sortOrder || 0));
    setCandidateTools(updatedList);
    resetToolForm();
  }

  function handleEditTool(t: CandidateTool) {
    setEditingToolId(t.id);
    setToolId(t.id);
    setToolTitle(t.title);
    setToolDescription(t.description);
    setToolHref(t.href);
    setToolIconName(t.iconName || "Wrench");
    setToolBadge(t.badge || "");
    setToolBadgeColor(t.badgeColor || "bg-blue-600 text-white");
    setToolGradient(t.gradient || "from-blue-600 to-indigo-600");
    setToolCategory(t.category || "utility");
    setToolFeaturesText(t.features?.join("\n") || "");
    setToolContentMd(t.content_md || "");
    setToolHasCustomPage(t.hasCustomPage || false);
    setToolIsActive(t.isActive !== false);
    setToolSortOrder(t.sortOrder || 1);
  }

  function handleDeleteTool(id: string) {
    if (confirm("Are you sure you want to delete this tool from the hub?")) {
      const updated = candidateTools.filter((t) => t.id !== id);
      setCandidateTools(updated);
      toast.success("Tool removed from list. Click 'Save to Supabase' to confirm.");
      if (editingToolId === id) resetToolForm();
    }
  }

  function handleToggleToolActive(id: string) {
    const updated = candidateTools.map((t) =>
      t.id === id ? { ...t, isActive: !t.isActive } : t
    );
    setCandidateTools(updated);
    toast.success("Tool visibility updated!");
  }

  function handleMoveTool(index: number, direction: "up" | "down") {
    const targetIndex = direction === "up" ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= candidateTools.length) return;

    const list = [...candidateTools];
    const temp = list[index];
    list[index] = list[targetIndex];
    list[targetIndex] = temp;

    // Re-assign sortOrder
    const reordered = list.map((item, idx) => ({ ...item, sortOrder: idx + 1 }));
    setCandidateTools(reordered);
    toast.success("Reordered! Click 'Save to Supabase' to publish order.");
  }

  function handleRestoreDefaults() {
    if (confirm("Restore all candidate tools to the 5 official default tools?")) {
      setCandidateTools(DEFAULT_CANDIDATE_TOOLS);
      saveToolsToSupabase(DEFAULT_CANDIDATE_TOOLS);
    }
  }

  function resetToolForm() {
    setEditingToolId(null);
    setToolId("");
    setToolTitle("");
    setToolDescription("");
    setToolHref("");
    setToolIconName("Wrench");
    setToolBadge("⚡ NEW");
    setToolBadgeColor("bg-blue-600 text-white");
    setToolGradient("from-blue-600 to-indigo-600");
    setToolCategory("utility");
    setToolFeaturesText("");
    setToolContentMd("");
    setToolHasCustomPage(false);
    setToolIsActive(true);
    setToolSortOrder(candidateTools.length + 1);
  }

  function handleTitleChange(val: string) {
    setToolTitle(val);
    if (!editingToolId) {
      const slug = val
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/^-|-$/g, "");
      setToolId(slug);
      if (!toolHref || toolHref.startsWith("/toolkit/")) {
        setToolHref(slug ? `/toolkit/${slug}` : "");
      }
    }
  }

  function handleContentFileUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      if (content) {
        setToolContentMd(content);
        toast.success(`Loaded "${file.name}" (${(file.size / 1024).toFixed(1)} KB)`);
      }
    };
    reader.onerror = () => {
      toast.error("Failed to read uploaded file");
    };
    reader.readAsText(file);
    e.target.value = "";
  }

  // Get current form icon component
  const FormIconComp = ICON_OPTIONS.find((o) => o.name === toolIconName)?.icon || Wrench;

  // ==========================================
  // LIVE NEWS TICKER STATE (LEGACY/STORAGE)
  // ==========================================
  const [tickers, setTickers] = useState<any[]>([
    { id: 1, title: "SSC CGL Tier 2 Exam Date Announced: 28 Days Remaining!", badge: "⏳ COUNTDOWN", link: "/exams/ssc-cgl", is_active: true },
    { id: 2, title: "SSC CHSL Tier 1 Official Answer Key & Response Sheet Released", badge: "🔴 LIVE", link: "/papers", is_active: true },
    { id: 3, title: "SSC CPO 2026 Notification Out — 4,000+ Vacancies Announced", badge: "🟢 NEW", link: "/exams/ssc-cpo", is_active: true },
  ]);
  const [editingTickerId, setEditingTickerId] = useState<number | null>(null);
  const [tickerTitle, setTickerTitle] = useState("");
  const [tickerBadge, setTickerBadge] = useState("🔴 LIVE");
  const [tickerLink, setTickerLink] = useState("/exams/ssc-cgl");
  const [tickerIsActive, setTickerIsActive] = useState(true);

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
    if (!tickerTitle.trim()) {
      toast.error("Ticker title is required!");
      return;
    }

    if (editingTickerId) {
      const updated = tickers.map((t) =>
        t.id === editingTickerId ? { ...t, title: tickerTitle, badge: tickerBadge, link: tickerLink, is_active: tickerIsActive } : t
      );
      saveTickersToStorage(updated);
      toast.success("Live Ticker Updated!");
      setEditingTickerId(null);
    } else {
      const newItem = { id: Date.now(), title: tickerTitle, badge: tickerBadge, link: tickerLink, is_active: tickerIsActive };
      saveTickersToStorage([newItem, ...tickers]);
      toast.success("New Live Ticker Alert Added!");
    }
    resetTickerForm();
  }

  function handleEditTicker(t: any) {
    setEditingTickerId(t.id);
    setTickerTitle(t.title);
    setTickerBadge(t.badge);
    setTickerLink(t.link);
    setTickerIsActive(t.is_active);
  }

  function handleDeleteTicker(id: number) {
    if (confirm("Delete this ticker alert?")) {
      const updated = tickers.filter((t) => t.id !== id);
      saveTickersToStorage(updated);
      toast.success("Ticker Alert Deleted!");
    }
  }

  function toggleTickerActive(id: number) {
    const updated = tickers.map((t) =>
      t.id === id ? { ...t, is_active: !t.is_active } : t
    );
    saveTickersToStorage(updated);
    toast.success("Status Toggled!");
  }

  function resetTickerForm() {
    setEditingTickerId(null);
    setTickerTitle("");
    setTickerBadge("🔴 LIVE");
    setTickerLink("/exams/ssc-cgl");
    setTickerIsActive(true);
  }

  const activeTickers = tickers.filter((t) => t.is_active);
  const activeCandidateTools = candidateTools.filter((t) => t.isActive !== false);

  return (
    <div className="space-y-6 text-white max-w-7xl mx-auto pb-16">
      
      {/* Top Header Banner */}
      <div className="rounded-3xl bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 border border-indigo-500/20 p-6 shadow-2xl">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full bg-amber-500/20 px-3 py-1 text-xs font-bold text-amber-300 border border-amber-400/30 mb-2">
              <Wrench className="h-3.5 w-3.5 text-amber-400" />
              Admin Tools & Utilities Control Center
            </div>
            <h1 className="text-2xl font-black text-white tracking-tight md:text-3xl">Admin Utility Tools & Candidate Hub CMS</h1>
            <p className="mt-1 text-xs text-indigo-200/80 max-w-2xl">
              Dynamically publish and manage candidate tools on <code className="bg-black/40 px-1 py-0.5 rounded text-amber-300">/toolkit</code> with Supabase synchronization, manage live news alerts, parse question PDFs, and configure SEO.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <Link
              href="/toolkit"
              target="_blank"
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-blue-600/30 border border-blue-400/40 text-blue-200 text-xs font-black hover:bg-blue-600/50 transition-all"
            >
              <Eye className="h-3.5 w-3.5 text-blue-300" />
              <span>View Public /toolkit</span>
              <ExternalLink className="h-3 w-3" />
            </Link>

            <Link
              href="/admin/seo"
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-purple-600/30 border border-purple-400/40 text-purple-200 text-xs font-black hover:bg-purple-600/50 transition-all"
            >
              <Globe className="h-3.5 w-3.5 text-purple-300" />
              <span>Manage Tools SEO</span>
            </Link>
          </div>
        </div>

        {/* Section Tabs */}
        <div className="mt-6 flex flex-wrap gap-2 border-t border-white/10 pt-4">
          <button
            onClick={() => setActiveToolTab("candidate-tools")}
            className={`flex items-center gap-2 rounded-xl px-4 py-2.5 text-xs font-black transition-all ${
              activeToolTab === "candidate-tools"
                ? "bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-lg ring-2 ring-blue-400/40"
                : "bg-white/5 text-gray-400 hover:bg-white/10 hover:text-white"
            }`}
          >
            <Wrench className="h-4 w-4 text-amber-300" />
            <span>🛠️ Candidate Tools CMS (Supabase Dynamic)</span>
            <span className="ml-1 px-1.5 py-0.5 rounded-full text-[10px] bg-black/40 font-bold text-amber-300">
              {activeCandidateTools.length}/{candidateTools.length}
            </span>
          </button>

          <button
            onClick={() => setActiveToolTab("ticker")}
            className={`flex items-center gap-2 rounded-xl px-4 py-2.5 text-xs font-black transition-all ${
              activeToolTab === "ticker"
                ? "bg-red-600 text-white shadow-lg"
                : "bg-white/5 text-gray-400 hover:bg-white/10 hover:text-white"
            }`}
          >
            <Radio className="h-4 w-4 text-amber-300" />
            <span>Live News Ticker ({tickers.length})</span>
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
            <span>PDF Question Parser</span>
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
            <span>Topic Sequence Re-Indexer</span>
          </button>

          <Link
            href="/admin/session-gate"
            className="flex items-center gap-2 rounded-xl px-4 py-2.5 text-xs font-black transition-all bg-amber-500/10 border border-amber-500/30 text-amber-300 hover:bg-amber-500/20"
          >
            <ShieldCheck className="h-4 w-4 text-amber-400" />
            <span>Guest Session Gate (15 Min Limit) &rarr;</span>
          </Link>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* TAB 1: CANDIDATE TOOLS CMS (SUPABASE DYNAMIC PUBLISHING)                  */}
      {/* ========================================================================= */}
      {activeToolTab === "candidate-tools" && (
        <div className="space-y-6">
          
          {/* Top Actions & Sync Bar */}
          <div className="rounded-2xl border border-blue-500/30 bg-slate-900/90 p-4 flex flex-col sm:flex-row items-center justify-between gap-4 shadow-xl">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-blue-600/30 border border-blue-500/40 flex items-center justify-center text-blue-400 font-black">
                <Wrench className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-sm font-black text-white flex items-center gap-2">
                  <span>Candidate Tools Manager</span>
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                    Supabase Connected
                  </span>
                </h3>
                <p className="text-xs text-slate-400">
                  Publish new tools or edit existing ones. Changes sync directly to the <code className="text-amber-300">site_settings</code> database table.
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2.5 w-full sm:w-auto justify-end">
              <button
                type="button"
                onClick={handleRestoreDefaults}
                className="px-3.5 py-2.5 rounded-xl border border-gray-700 bg-gray-800 text-xs font-bold text-gray-300 hover:text-white hover:bg-gray-700 flex items-center gap-1.5 transition-all"
                title="Restore original 5 tools"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Reset Defaults</span>
              </button>

              <button
                type="button"
                onClick={() => saveToolsToSupabase(candidateTools)}
                disabled={savingTools}
                className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 text-white text-xs font-black shadow-lg shadow-emerald-600/20 hover:opacity-95 flex items-center gap-2 disabled:opacity-50 transition-all cursor-pointer"
              >
                {savingTools ? (
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                ) : (
                  <Save className="w-4 h-4" />
                )}
                <span>Save All Changes to Supabase</span>
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            
            {/* Form Column (Left: 5 cols) */}
            <div className="lg:col-span-5 space-y-4">
              <form onSubmit={handleSaveToolForm} className="rounded-3xl border border-gray-800 bg-gray-900/90 p-5 space-y-4 shadow-xl">
                <div className="flex items-center justify-between border-b border-gray-800 pb-3">
                  <h3 className="text-sm font-black text-amber-400 flex items-center gap-2">
                    <Sparkles className="h-4 w-4" />
                    <span>{editingToolId ? `Edit Tool: ${toolTitle || editingToolId}` : "➕ Publish New Candidate Tool"}</span>
                  </h3>
                  {editingToolId && (
                    <button
                      type="button"
                      onClick={resetToolForm}
                      className="text-xs text-gray-400 hover:text-white underline cursor-pointer"
                    >
                      Cancel Edit
                    </button>
                  )}
                </div>

                {/* Title */}
                <div>
                  <label className="text-xs font-bold text-gray-300 mb-1 block">
                    Tool Title <span className="text-red-400">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. SSC Photo & Signature Resizer Tool"
                    value={toolTitle}
                    onChange={(e) => handleTitleChange(e.target.value)}
                    className="w-full rounded-xl border border-gray-700 bg-gray-800 p-2.5 text-xs font-semibold text-white focus:border-blue-500 focus:outline-hidden"
                  />
                </div>

                {/* Route / URL */}
                <div>
                  <label className="text-xs font-bold text-gray-300 mb-1 block">
                    Target Route / URL <span className="text-red-400">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. /toolkit/photo-resizer or /typing"
                    value={toolHref}
                    onChange={(e) => setToolHref(e.target.value)}
                    className="w-full rounded-xl border border-gray-700 bg-gray-800 p-2.5 text-xs font-mono font-bold text-amber-300 focus:border-blue-500 focus:outline-hidden"
                  />
                  <p className="text-[10px] text-gray-400 mt-1">Can be internal (e.g. /toolkit/xyz) or external.</p>
                </div>

                {/* Description */}
                <div>
                  <label className="text-xs font-bold text-gray-300 mb-1 block">Short Description</label>
                  <textarea
                    rows={2}
                    placeholder="Describe what this tool does for the candidate..."
                    value={toolDescription}
                    onChange={(e) => setToolDescription(e.target.value)}
                    className="w-full rounded-xl border border-gray-700 bg-gray-800 p-2.5 text-xs font-semibold text-white focus:border-blue-500 focus:outline-hidden"
                  />
                </div>

                {/* Icon & Category Row */}
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs font-bold text-gray-300 mb-1 block">Tool Icon</label>
                    <select
                      value={toolIconName}
                      onChange={(e) => setToolIconName(e.target.value)}
                      className="w-full rounded-xl border border-gray-700 bg-gray-800 p-2 text-xs font-bold text-white focus:border-blue-500 focus:outline-hidden"
                    >
                      {ICON_OPTIONS.map((opt) => (
                        <option key={opt.name} value={opt.name}>
                          {opt.label}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="text-xs font-bold text-gray-300 mb-1 block">Category</label>
                    <select
                      value={toolCategory}
                      onChange={(e) => setToolCategory(e.target.value as any)}
                      className="w-full rounded-xl border border-gray-700 bg-gray-800 p-2 text-xs font-bold text-white focus:border-blue-500 focus:outline-hidden"
                    >
                      <option value="utility">Utility / Converter</option>
                      <option value="calculator">Calculator / Rank</option>
                      <option value="practice">Practice / Simulation</option>
                      <option value="checklist">Syllabus / Checklist</option>
                    </select>
                  </div>
                </div>

                {/* Badge Text & Color */}
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs font-bold text-gray-300 mb-1 block">Badge Label</label>
                    <input
                      type="text"
                      placeholder="e.g. 🔥 POPULAR or ⭐ 2026"
                      value={toolBadge}
                      onChange={(e) => setToolBadge(e.target.value)}
                      className="w-full rounded-xl border border-gray-700 bg-gray-800 p-2 text-xs font-bold text-white focus:border-blue-500 focus:outline-hidden"
                    />
                  </div>

                  <div>
                    <label className="text-xs font-bold text-gray-300 mb-1 block">Badge Color</label>
                    <select
                      value={toolBadgeColor}
                      onChange={(e) => setToolBadgeColor(e.target.value)}
                      className="w-full rounded-xl border border-gray-700 bg-gray-800 p-2 text-xs font-bold text-white focus:border-blue-500 focus:outline-hidden"
                    >
                      {BADGE_COLOR_PRESETS.map((p) => (
                        <option key={p.value} value={p.value}>
                          {p.label}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Gradient Theme */}
                <div>
                  <label className="text-xs font-bold text-gray-300 mb-1 block">Card Gradient Theme</label>
                  <select
                    value={toolGradient}
                    onChange={(e) => setToolGradient(e.target.value)}
                    className="w-full rounded-xl border border-gray-700 bg-gray-800 p-2 text-xs font-bold text-white focus:border-blue-500 focus:outline-hidden"
                  >
                    {GRADIENT_PRESETS.map((g) => (
                      <option key={g.value} value={g.value}>
                        {g.label}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Features (One per line) */}
                <div>
                  <label className="text-xs font-bold text-gray-300 mb-1 block">
                    Key Features / Bullets (One per line)
                  </label>
                  <textarea
                    rows={3}
                    placeholder={"Exact 3.5x4.5 cm Photo & 4x2 cm Signature\nClient-Side 100% Private (No Upload to Server)\n1-Click Direct Download Form-Ready JPEG"}
                    value={toolFeaturesText}
                    onChange={(e) => setToolFeaturesText(e.target.value)}
                    className="w-full rounded-xl border border-gray-700 bg-gray-800 p-2.5 text-xs font-semibold text-white focus:border-blue-500 focus:outline-hidden"
                  />
                </div>

                {/* Tool Page Content (Markdown / HTML) */}
                <div className="rounded-2xl border border-indigo-500/30 bg-slate-950/70 p-4 space-y-3">
                  <div className="flex items-center justify-between flex-wrap gap-2">
                    <div>
                      <label className="text-xs font-black text-indigo-300 flex items-center gap-1.5">
                        <FileText className="w-3.5 h-3.5 text-indigo-400" />
                        <span>Tool Page Content (Markdown / HTML)</span>
                      </label>
                      <p className="text-[10px] text-slate-400 mt-0.5">
                        Content rendered on <code className="text-amber-300 font-mono">{toolHref || "/toolkit/[slug]"}</code>
                      </p>
                    </div>

                    {/* File Upload Button (.md / .html) */}
                    <label className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-indigo-600/30 border border-indigo-400/40 text-indigo-200 text-xs font-bold hover:bg-indigo-600/50 cursor-pointer transition-all">
                      <Upload className="w-3.5 h-3.5 text-indigo-300" />
                      <span>Upload .md / .html</span>
                      <input
                        type="file"
                        accept=".md,.markdown,.html,.htm,.txt"
                        className="hidden"
                        onChange={handleContentFileUpload}
                      />
                    </label>
                  </div>

                  <textarea
                    rows={8}
                    placeholder={"# SSC Tool Heading\n\nEnter tool instructions, guidelines, eligibility criteria, or rules here...\n\n### Important Instructions\n- Point 1\n- Point 2\n\nSupports full Markdown (#, **, lists) and raw HTML tags!"}
                    value={toolContentMd}
                    onChange={(e) => setToolContentMd(e.target.value)}
                    className="w-full rounded-xl border border-gray-700 bg-gray-900 p-3 text-xs font-mono text-slate-200 focus:border-indigo-500 focus:outline-hidden"
                  />

                  <div className="flex items-center justify-between text-[10px] text-slate-400">
                    <span className="flex items-center gap-1">
                      <Code className="w-3 h-3 text-indigo-400" />
                      Markdown &amp; HTML supported
                    </span>
                    <span>{toolContentMd.length} characters</span>
                  </div>

                  {/* Custom Hardcoded Page Option */}
                  <div className="pt-2 border-t border-gray-800">
                    <label className="flex items-center gap-2 cursor-pointer text-xs text-gray-300">
                      <input
                        type="checkbox"
                        checked={toolHasCustomPage}
                        onChange={(e) => setToolHasCustomPage(e.target.checked)}
                        className="h-4 w-4 rounded border-gray-700 bg-gray-800 text-indigo-500"
                      />
                      <span>This tool uses a custom hardcoded route (e.g. /typing, /toolkit/photo-resizer)</span>
                    </label>
                  </div>
                </div>

                {/* Active Toggle & Order */}
                <div className="flex items-center justify-between border-t border-gray-800 pt-3">
                  <label className="flex items-center gap-2 cursor-pointer text-xs font-bold text-gray-300">
                    <input
                      type="checkbox"
                      checked={toolIsActive}
                      onChange={(e) => setToolIsActive(e.target.checked)}
                      className="h-4 w-4 rounded border-gray-700 bg-gray-800 text-blue-500"
                    />
                    <span>Visible on /toolkit Hub</span>
                  </label>

                  <div className="flex items-center gap-2">
                    <label className="text-xs text-gray-400 font-bold">Sort Order:</label>
                    <input
                      type="number"
                      min={1}
                      max={99}
                      value={toolSortOrder}
                      onChange={(e) => setToolSortOrder(Number(e.target.value))}
                      className="w-14 rounded-lg border border-gray-700 bg-gray-800 p-1 text-xs font-black text-center text-white"
                    />
                  </div>
                </div>

                {/* Submit Button */}
                <div className="pt-2">
                  <button
                    type="submit"
                    className="w-full py-3 rounded-2xl bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-black text-xs shadow-lg hover:opacity-95 transition-all flex items-center justify-center gap-2"
                  >
                    <Save className="w-4 h-4" />
                    <span>{editingToolId ? "Update Tool in List" : "Add Tool to List"}</span>
                  </button>
                </div>
              </form>

              {/* LIVE CARD PREVIEW */}
              <div className="rounded-3xl border border-gray-800 bg-gray-900 p-5 space-y-3">
                <span className="text-[10px] font-black uppercase tracking-wider text-gray-400 flex items-center gap-1.5">
                  <Eye className="w-3.5 h-3.5 text-blue-400" />
                  Live Preview of Tool Card (How it appears on /toolkit)
                </span>

                <div className="bg-white border border-slate-200 rounded-3xl p-5 text-slate-900 shadow-lg">
                  <div className="flex items-center justify-between mb-3">
                    <div className={`w-10 h-10 rounded-2xl bg-gradient-to-tr ${toolGradient} text-white flex items-center justify-center shadow-md`}>
                      <FormIconComp className="w-5 h-5" />
                    </div>
                    {toolBadge && (
                      <span className={`px-2.5 py-1 rounded-full text-[10px] font-black uppercase ${toolBadgeColor}`}>
                        {toolBadge}
                      </span>
                    )}
                  </div>
                  <h4 className="text-base font-black text-slate-900 mb-1">
                    {toolTitle || "Tool Title Preview"}
                  </h4>
                  <p className="text-xs text-slate-600 mb-3 line-clamp-2">
                    {toolDescription || "Tool description preview will appear here..."}
                  </p>
                  <div className="space-y-1 mb-4 pt-2 border-t border-slate-100">
                    {(toolFeaturesText ? toolFeaturesText.split("\n").filter(Boolean) : ["Sample Feature 1", "Sample Feature 2"]).slice(0, 3).map((feat, idx) => (
                      <div key={idx} className="flex items-center gap-2 text-[11px] font-semibold text-slate-700">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                        <span className="truncate">{feat}</span>
                      </div>
                    ))}
                  </div>
                  <div className={`w-full py-2.5 rounded-xl bg-gradient-to-r ${toolGradient} text-white font-extrabold text-xs text-center shadow-xs`}>
                    Open Tool &rarr;
                  </div>
                </div>
              </div>
            </div>

            {/* List Column (Right: 7 cols) */}
            <div className="lg:col-span-7 space-y-4">
              <div className="rounded-2xl border border-gray-800 bg-gray-900 p-4 flex items-center justify-between">
                <div>
                  <h4 className="text-xs font-black uppercase text-gray-300 tracking-wider">
                    Published Candidate Tools ({candidateTools.length})
                  </h4>
                  <p className="text-[11px] text-gray-400">
                    {activeCandidateTools.length} Active / {candidateTools.length - activeCandidateTools.length} Hidden
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={fetchCandidateTools}
                    className="p-1.5 rounded-lg border border-gray-700 text-gray-300 hover:text-white hover:bg-gray-800"
                    title="Reload from server"
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              {loadingTools ? (
                <div className="flex justify-center p-12">
                  <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" />
                </div>
              ) : (
                <div className="space-y-3">
                  {candidateTools.map((t, idx) => {
                    const IconComponent =
                      ICON_OPTIONS.find((o) => o.name === t.iconName)?.icon || Wrench;
                    const isFirst = idx === 0;
                    const isLast = idx === candidateTools.length - 1;

                    return (
                      <div
                        key={t.id}
                        className={`rounded-2xl border p-4 space-y-3 transition-all ${
                          editingToolId === t.id
                            ? "border-blue-500 bg-blue-950/20 ring-2 ring-blue-500/30"
                            : t.isActive === false
                            ? "border-gray-800 bg-gray-950/40 opacity-70"
                            : "border-gray-800 bg-gray-900 hover:border-gray-700"
                        }`}
                      >
                        <div className="flex items-start justify-between gap-3">
                          <div className="flex items-center gap-3">
                            <span className="w-6 h-6 rounded-lg bg-gray-800 text-[11px] font-black text-gray-400 flex items-center justify-center shrink-0">
                              #{idx + 1}
                            </span>
                            <div className={`w-9 h-9 rounded-xl bg-gradient-to-tr ${t.gradient || "from-blue-600 to-indigo-600"} text-white flex items-center justify-center font-black shrink-0 shadow-md`}>
                              <IconComponent className="w-4 h-4" />
                            </div>
                            <div>
                              <div className="flex items-center gap-2 flex-wrap">
                                <span className="text-xs font-black text-white">{t.title}</span>
                                {t.badge && (
                                  <span className={`px-2 py-0.5 rounded-full text-[9px] font-black uppercase ${t.badgeColor || "bg-blue-600 text-white"}`}>
                                    {t.badge}
                                  </span>
                                )}
                                <span className="px-2 py-0.5 rounded-md text-[9px] font-bold uppercase bg-gray-800 text-gray-300">
                                  {t.category || "utility"}
                                </span>
                              </div>
                              <p className="text-[11px] text-gray-400 line-clamp-1 mt-0.5">
                                {t.description}
                              </p>
                            </div>
                          </div>

                          <div className="flex items-center gap-1.5 shrink-0">
                            {/* Reorder Buttons */}
                            <button
                              type="button"
                              disabled={isFirst}
                              onClick={() => handleMoveTool(idx, "up")}
                              className="p-1 rounded-lg border border-gray-700 text-gray-300 hover:text-white disabled:opacity-30 cursor-pointer"
                              title="Move Up"
                            >
                              <ArrowUp className="w-3.5 h-3.5" />
                            </button>
                            <button
                              type="button"
                              disabled={isLast}
                              onClick={() => handleMoveTool(idx, "down")}
                              className="p-1 rounded-lg border border-gray-700 text-gray-300 hover:text-white disabled:opacity-30 cursor-pointer"
                              title="Move Down"
                            >
                              <ArrowDown className="w-3.5 h-3.5" />
                            </button>

                            {/* Active Toggle */}
                            <button
                              type="button"
                              onClick={() => handleToggleToolActive(t.id)}
                              className={`px-2.5 py-1 rounded-full text-[10px] font-black border transition-all ${
                                t.isActive !== false
                                  ? "bg-emerald-500/20 text-emerald-300 border-emerald-500/40"
                                  : "bg-gray-800 text-gray-400 border-gray-700"
                              }`}
                            >
                              {t.isActive !== false ? "🟢 Active" : "⚪ Hidden"}
                            </button>
                          </div>
                        </div>

                        {/* Features Preview */}
                        {t.features && t.features.length > 0 && (
                          <div className="flex flex-wrap gap-1.5 pt-2 border-t border-gray-800/80">
                            {t.features.map((feat, fIdx) => (
                              <span
                                key={fIdx}
                                className="inline-flex items-center gap-1 text-[10px] bg-gray-800/80 text-gray-300 px-2 py-0.5 rounded-md"
                              >
                                <CheckCircle2 className="w-2.5 h-2.5 text-emerald-400" />
                                <span className="truncate max-w-[220px]">{feat}</span>
                              </span>
                            ))}
                          </div>
                        )}

                        {/* Footer Route & Actions */}
                        <div className="flex items-center justify-between text-xs pt-2 border-t border-gray-800">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="font-mono text-[11px] text-amber-400 font-bold">{t.href}</span>
                            {t.content_md ? (
                              <span className="px-1.5 py-0.5 rounded text-[9px] font-bold bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                                📄 Content Added
                              </span>
                            ) : t.hasCustomPage ? (
                              <span className="px-1.5 py-0.5 rounded text-[9px] font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30">
                                ⚡ Built-in
                              </span>
                            ) : (
                              <span className="px-1.5 py-0.5 rounded text-[9px] font-bold bg-red-500/20 text-red-300 border border-red-500/30">
                                ⚠️ No Content
                              </span>
                            )}
                            <Link
                              href={t.href}
                              target="_blank"
                              className="text-gray-400 hover:text-blue-400"
                              title="Open in new tab"
                            >
                              <ExternalLink className="w-3 h-3" />
                            </Link>
                          </div>

                          <div className="flex gap-2">
                            <button
                              type="button"
                              onClick={() => handleEditTool(t)}
                              className="px-2.5 py-1 rounded-lg border border-gray-700 text-gray-300 hover:text-blue-400 hover:border-blue-500 text-xs font-bold flex items-center gap-1"
                            >
                              <Edit3 className="h-3 w-3" />
                              <span>Edit</span>
                            </button>
                            <button
                              type="button"
                              onClick={() => handleDeleteTool(t.id)}
                              className="px-2.5 py-1 rounded-lg border border-gray-700 text-gray-300 hover:text-red-400 hover:border-red-500 text-xs font-bold flex items-center gap-1"
                            >
                              <Trash2 className="h-3 w-3" />
                              <span>Delete</span>
                            </button>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 2: LIVE NEWS TICKER & LINK CUSTOMIZER                                 */}
      {/* ========================================================================= */}
      {activeToolTab === "ticker" && (
        <div className="space-y-6">
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
            <div className="lg:col-span-5">
              <form onSubmit={handleSaveTicker} className="rounded-2xl border border-gray-800 bg-gray-900 p-5 space-y-4 shadow-xl">
                <h3 className="text-sm font-bold text-amber-400 flex items-center gap-2 border-b border-gray-800 pb-3">
                  <Zap className="h-4 w-4" />
                  {editingTickerId ? "Edit Live Ticker Alert" : "➕ Add New Live Alert"}
                </h3>

                <div>
                  <label className="text-xs font-semibold text-gray-300">Ticker Announcement Title</label>
                  <textarea
                    rows={3}
                    placeholder="e.g. SSC CGL Tier 2 Exam Date Announced: 28 Days Remaining!"
                    value={tickerTitle}
                    onChange={(e) => setTickerTitle(e.target.value)}
                    className="w-full rounded-xl border border-gray-700 bg-gray-800 p-3 text-xs font-semibold text-white focus:border-amber-400 focus:outline-hidden"
                  />
                </div>

                <div>
                  <label className="text-xs font-semibold text-gray-300">Badge Tag</label>
                  <select
                    value={tickerBadge}
                    onChange={(e) => setTickerBadge(e.target.value)}
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
                    onChange={(e) => { if (e.target.value) setTickerLink(e.target.value); }}
                    className="w-full mb-2 rounded-xl border border-gray-700 bg-gray-800 p-2.5 text-xs font-bold text-amber-300 focus:border-amber-400 focus:outline-hidden"
                  >
                    <option value="">-- Choose Quick Target Page --</option>
                    <option value="/exams/ssc-cgl">🎯 SSC CGL Exam Page (/exams/ssc-cgl)</option>
                    <option value="/exams/ssc-chsl">🎯 SSC CHSL Exam Page (/exams/ssc-chsl)</option>
                    <option value="/exams/ssc-cpo">🎯 SSC CPO Exam Page (/exams/ssc-cpo)</option>
                    <option value="/exams/ssc-mts">🎯 SSC MTS Exam Page (/exams/ssc-mts)</option>
                    <option value="/papers">📄 Previous Year Papers (/papers)</option>
                    <option value="/toolkit">🛠️ Candidate Toolkit Hub (/toolkit)</option>
                    <option value="/toolkit/photo-resizer">🖼️ Photo Resizer (/toolkit/photo-resizer)</option>
                    <option value="/typing">⌨️ SSC Typing Test (/typing)</option>
                  </select>

                  <label className="text-xs font-semibold text-gray-300">Target Link URL (Custom)</label>
                  <input
                    type="text"
                    value={tickerLink}
                    onChange={(e) => setTickerLink(e.target.value)}
                    className="w-full rounded-xl border border-gray-700 bg-gray-800 p-2.5 text-xs font-bold text-white focus:border-amber-400 focus:outline-hidden"
                  />
                </div>

                <div className="flex items-center justify-between border-t border-gray-800 pt-3">
                  <label className="flex items-center gap-2 cursor-pointer text-xs font-bold text-gray-300">
                    <input
                      type="checkbox"
                      checked={tickerIsActive}
                      onChange={(e) => setTickerIsActive(e.target.checked)}
                      className="h-4 w-4 rounded border-gray-700 bg-gray-800 text-amber-500"
                    />
                    Active on Homepage
                  </label>

                  <div className="flex gap-2">
                    {editingTickerId && (
                      <button type="button" onClick={resetTickerForm} className="rounded-xl border border-gray-700 bg-gray-800 px-3 py-2 text-xs font-bold text-gray-300">
                        Cancel
                      </button>
                    )}
                    <button type="submit" className="rounded-xl bg-amber-400 px-4 py-2 text-xs font-black text-gray-950 shadow-md hover:bg-amber-300">
                      {editingTickerId ? "Update Ticker" : "Save Ticker"}
                    </button>
                  </div>
                </div>
              </form>
            </div>

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
                        onClick={() => toggleTickerActive(t.id)}
                        className={`rounded-full px-2.5 py-0.5 text-[10px] font-black border ${t.is_active ? "bg-emerald-500/20 text-emerald-300 border-emerald-500/40" : "bg-gray-800 text-gray-400 border-gray-700"}`}
                      >
                        {t.is_active ? "🟢 ON" : "⚪ OFF"}
                      </button>
                    </div>

                    <div className="flex items-center justify-between text-xs pt-2 border-t border-gray-800">
                      <span className="font-mono text-[11px] text-amber-400 font-bold">Target Link: {t.link}</span>
                      <div className="flex gap-2">
                        <button onClick={() => handleEditTicker(t)} className="rounded-lg border border-gray-700 p-1.5 text-gray-300 hover:text-blue-400">
                          <Edit3 className="h-3.5 w-3.5" />
                        </button>
                        <button onClick={() => handleDeleteTicker(t.id)} className="rounded-lg border border-gray-700 p-1.5 text-gray-300 hover:text-red-400">
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

      {/* ========================================================================= */}
      {/* TAB 3: PDF QUESTION PARSER                                                */}
      {/* ========================================================================= */}
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

      {/* ========================================================================= */}
      {/* TAB 4: TOPIC RE-INDEXER                                                   */}
      {/* ========================================================================= */}
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
