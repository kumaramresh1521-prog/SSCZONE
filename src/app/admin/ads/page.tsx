"use client";

import { useEffect, useState } from "react";
import {
  DollarSign,
  ToggleLeft,
  ToggleRight,
  Save,
  CheckCircle2,
  AlertCircle,
  Eye,
  Layers,
  Sparkles,
  Smartphone,
  Monitor,
  ExternalLink,
  Info,
  Code,
  Tag,
  Image as ImageIcon,
  Link2,
  RefreshCw,
  ShoppingBag,
  Send,
  Keyboard,
  Target,
  Trophy,
  BookOpen,
  Flame,
  Plus,
  Trash2,
  HelpCircle,
  Check
} from "lucide-react";
import toast from "react-hot-toast";
import { SiteAdsConfig, AdSlotConfig, DEFAULT_ADS_CONFIG, AdType } from "@/lib/ads-types";
import { AD_PRESETS, AdPreset } from "@/lib/ads-presets";
import AdBannerSlot from "@/components/AdBannerSlot";

export default function AdminAdsPage() {
  const [settings, setSettings] = useState<SiteAdsConfig>(DEFAULT_ADS_CONFIG);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [activePreviewDevice, setActivePreviewDevice] = useState<"desktop" | "mobile">("desktop");
  const [selectedCategory, setSelectedCategory] = useState<string>("question_bank");
  const [activeSlotKey, setActiveSlotKey] = useState<string>("qb_inline");
  const [showNewSlotModal, setShowNewSlotModal] = useState(false);
  const [newSlotId, setNewSlotId] = useState("");
  const [newSlotName, setNewSlotName] = useState("");

  // Load from API
  useEffect(() => {
    fetch("/api/admin/ads")
      .then((res) => res.json())
      .then((data) => {
        if (data.success && data.config) {
          // Merge with DEFAULT_ADS_CONFIG so new default slots are always available
          setSettings({
            ...DEFAULT_ADS_CONFIG,
            ...data.config,
            slots: {
              ...DEFAULT_ADS_CONFIG.slots,
              ...(data.config.slots || {}),
            },
          });
        }
      })
      .catch((e) => {
        console.warn("Failed to load ad settings from API:", e);
      })
      .finally(() => {
        setLoading(false);
      });
  }, []);

  async function handleSave() {
    setSaving(true);
    try {
      const res = await fetch("/api/admin/ads", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(settings),
      });
      const data = await res.json();
      if (data.success) {
        setSettings(data.config);
        toast.success("Ad slots & presets saved & live across website! 🚀", {
          icon: "💰",
          style: { borderRadius: "12px", background: "#065f46", color: "#fff" },
        });
      } else {
        throw new Error(data.error || "Save failed");
      }
    } catch (e: any) {
      toast.error(e?.message || "Failed to save settings");
    } finally {
      setSaving(false);
    }
  }

  function updateSlot(slotKey: string, updates: Partial<AdSlotConfig>) {
    setSettings((prev) => ({
      ...prev,
      slots: {
        ...prev.slots,
        [slotKey]: {
          ...prev.slots[slotKey],
          ...updates,
        },
      },
    }));
  }

  function applyPresetToActiveSlot(preset: AdPreset) {
    if (!currentSlot) return;
    updateSlot(activeSlotKey, {
      ...preset.config,
    });
    toast.success(`Preset "${preset.name}" applied to ${currentSlot.name}!`, {
      icon: "⚡",
      style: { borderRadius: "12px", background: "#1e1b4b", color: "#fff" },
    });
  }

  function handleCreateCustomSlot() {
    if (!newSlotId.trim() || !newSlotName.trim()) {
      toast.error("Please provide both Slot ID and Name");
      return;
    }
    const cleanId = newSlotId.trim().toLowerCase().replace(/[^a-z0-9_-]/g, "_");
    if (settings.slots[cleanId]) {
      toast.error("A slot with this ID already exists");
      return;
    }

    const newSlot: AdSlotConfig = {
      id: cleanId,
      name: newSlotName.trim(),
      category: "custom",
      description: "Custom user-configured page placement",
      enabled: true,
      type: "promo_card",
      promoCard: {
        id: `promo_${cleanId}`,
        title: "SSC CGL 2026 Test Pass Pro",
        subtitle: "500+ Full CBT Mock Tests & Live Sectional Rank",
        badge: "Special 50% Off",
        ctaText: "Enroll Now ➔",
        targetUrl: "/mocks",
        theme: "indigo",
        icon: "target",
      },
    };

    setSettings((prev) => ({
      ...prev,
      slots: {
        ...prev.slots,
        [cleanId]: newSlot,
      },
    }));

    setActiveSlotKey(cleanId);
    setSelectedCategory("custom");
    setNewSlotId("");
    setNewSlotName("");
    setShowNewSlotModal(false);
    toast.success(`New Slot "${newSlotName}" created! Remember to Save.`);
  }

  function handleDeleteSlot(slotKey: string) {
    if (confirm(`Are you sure you want to delete slot "${settings.slots[slotKey]?.name || slotKey}"?`)) {
      setSettings((prev) => {
        const nextSlots = { ...prev.slots };
        delete nextSlots[slotKey];
        return { ...prev, slots: nextSlots };
      });
      const remainingKeys = Object.keys(settings.slots).filter((k) => k !== slotKey);
      if (remainingKeys.length > 0) setActiveSlotKey(remainingKeys[0]);
      toast.success("Slot removed");
    }
  }

  const currentSlot = settings.slots[activeSlotKey] || Object.values(settings.slots)[0];

  const categories = [
    { id: "all", label: "All Slots" },
    { id: "question_bank", label: "Question Bank" },
    { id: "blog", label: "Blog Articles" },
    { id: "notes", label: "Subject Notes" },
    { id: "global", label: "Global Banners" },
    { id: "custom", label: "Custom Slots" },
  ];

  const filteredSlots = Object.values(settings.slots || {}).filter((s) => {
    if (selectedCategory === "all") return true;
    return s.category === selectedCategory;
  });

  return (
    <div className="space-y-6 max-w-6xl pb-20 text-slate-100">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-5">
        <div>
          <h1 className="text-2xl font-black text-white flex items-center gap-2.5">
            <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-600/20 text-emerald-400 border border-emerald-500/30 shadow-xs">
              <DollarSign className="h-5 w-5" />
            </span>
            <span>Ads &amp; Promotions Engine</span>
          </h1>
          <p className="text-xs text-slate-400 mt-1 max-w-2xl">
            Control Google AdSense, Mock Test promos, Telegram communities, and Affiliate book banners across Question Bank, Blog articles, and Subject Notes without touching code.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => setShowNewSlotModal(true)}
            className="flex items-center gap-1.5 rounded-xl border border-slate-700 bg-slate-800 hover:bg-slate-700 px-4 py-2.5 text-xs font-bold text-white transition-all cursor-pointer"
          >
            <Plus className="h-4 w-4 text-emerald-400" />
            <span>Add Custom Slot</span>
          </button>

          <button
            onClick={handleSave}
            disabled={saving}
            className="flex items-center justify-center gap-2 rounded-xl bg-emerald-600 px-6 py-2.5 text-xs sm:text-sm font-black text-white shadow-md hover:bg-emerald-700 active:scale-98 transition-all disabled:opacity-50 cursor-pointer"
          >
            {saving ? <RefreshCw className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
            <span>{saving ? "Saving Changes..." : "Save All Ad Settings"}</span>
          </button>
        </div>
      </div>

      {/* Global Engine Switches */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Master Global Switch */}
        <div
          className={`rounded-2xl border p-4.5 transition-all ${
            settings.enabledGlobally
              ? "border-emerald-500/50 bg-emerald-950/20 shadow-xs"
              : "border-slate-800 bg-slate-900"
          }`}
        >
          <div className="flex items-center justify-between gap-3">
            <div>
              <div className="flex items-center gap-2">
                <span
                  className={`h-2.5 w-2.5 rounded-full ${
                    settings.enabledGlobally ? "bg-emerald-400 animate-pulse" : "bg-slate-500"
                  }`}
                />
                <h3 className="text-sm font-black text-white">Master Ads Toggle</h3>
              </div>
              <p className="text-[11px] text-slate-400 mt-0.5">
                {settings.enabledGlobally ? "Ads are LIVE across website" : "All ads are currently paused"}
              </p>
            </div>

            <button
              onClick={() => setSettings((p) => ({ ...p, enabledGlobally: !p.enabledGlobally }))}
              className={`p-1.5 rounded-xl transition-colors cursor-pointer ${
                settings.enabledGlobally ? "text-emerald-400 bg-emerald-950/50" : "text-slate-500 bg-slate-800"
              }`}
            >
              {settings.enabledGlobally ? (
                <ToggleRight className="h-8 w-8 text-emerald-400" />
              ) : (
                <ToggleLeft className="h-8 w-8 text-slate-500" />
              )}
            </button>
          </div>
        </div>

        {/* Google AdSense Publisher ID */}
        <div className="rounded-2xl border border-slate-800 bg-slate-900 p-4.5">
          <label className="text-xs font-bold text-slate-300 flex items-center justify-between mb-1.5">
            <span>Google AdSense Client ID</span>
            <span className="text-[10px] text-slate-500">ca-pub-XXXXXXXX</span>
          </label>
          <input
            type="text"
            placeholder="ca-pub-1234567890123456"
            value={settings.publisherId || ""}
            onChange={(e) => setSettings((p) => ({ ...p, publisherId: e.target.value }))}
            className="w-full rounded-xl border border-slate-700 bg-slate-800/80 px-3 py-1.5 text-xs text-white placeholder-slate-500 focus:border-emerald-500 focus:outline-none"
          />
        </div>

        {/* Question Bank Inline Interval */}
        <div className="rounded-2xl border border-slate-800 bg-slate-900 p-4.5">
          <label className="text-xs font-bold text-slate-300 flex items-center justify-between mb-1.5">
            <span>Question Bank Ad Frequency</span>
            <span className="text-[10px] text-emerald-400 font-bold">Every {settings.inlineInterval || 5} Questions</span>
          </label>
          <select
            value={settings.inlineInterval || 5}
            onChange={(e) => setSettings((p) => ({ ...p, inlineInterval: parseInt(e.target.value) || 5 }))}
            className="w-full rounded-xl border border-slate-700 bg-slate-800/80 px-3 py-1.5 text-xs text-white focus:border-emerald-500 focus:outline-none"
          >
            <option value="3">Every 3 Questions (High)</option>
            <option value="5">Every 5 Questions (Recommended)</option>
            <option value="8">Every 8 Questions (Moderate)</option>
            <option value="10">Every 10 Questions (Low)</option>
          </select>
        </div>
      </div>

      {/* ── 1-CLICK VARIETY PRESETS LIBRARY ── */}
      <div className="rounded-2xl border border-indigo-900/50 bg-gradient-to-r from-indigo-950/40 via-slate-900 to-indigo-950/30 p-5 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-indigo-900/40 pb-3 mb-4">
          <div>
            <h3 className="text-sm font-black text-white flex items-center gap-2">
              <Sparkles className="h-4 w-4 text-amber-400" />
              <span>1-Click Variety Presets</span>
              <span className="text-[10px] font-bold bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 px-2 py-0.5 rounded-full">
                Click any preset to apply to: {currentSlot?.name || activeSlotKey}
              </span>
            </h3>
            <p className="text-[11px] text-slate-400 mt-0.5">
              Select any pre-designed template below to instantly load it into the active slot. You can edit text &amp; links anytime.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
          {AD_PRESETS.map((preset) => (
            <button
              key={preset.id}
              onClick={() => applyPresetToActiveSlot(preset)}
              className="flex flex-col text-left p-3 rounded-xl border border-slate-800 bg-slate-900/90 hover:border-indigo-500 hover:bg-indigo-950/30 transition-all cursor-pointer group shadow-2xs"
            >
              <div className="flex items-center justify-between w-full mb-1">
                <span className="text-xs font-black text-white group-hover:text-indigo-300 transition-colors">
                  {preset.name}
                </span>
                <span className="text-[10px] font-bold text-indigo-400 bg-indigo-950/60 border border-indigo-800/50 px-1.5 py-0.5 rounded-md">
                  Apply ➔
                </span>
              </div>
              <p className="text-[10px] text-slate-400 leading-snug line-clamp-2">
                {preset.description}
              </p>
            </button>
          ))}
        </div>
      </div>

      {/* ── MAIN WORKSPACE: SLOTS & EDITOR ── */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Category Filter & Slot Selector (4 cols) */}
        <div className="lg:col-span-4 space-y-4">
          {/* Category Tabs */}
          <div className="flex flex-wrap gap-1.5 p-1 bg-slate-900 rounded-xl border border-slate-800">
            {categories.map((c) => (
              <button
                key={c.id}
                onClick={() => setSelectedCategory(c.id)}
                className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-all cursor-pointer ${
                  selectedCategory === c.id
                    ? "bg-indigo-600 text-white shadow-xs"
                    : "text-slate-400 hover:text-white"
                }`}
              >
                {c.label}
              </button>
            ))}
          </div>

          {/* Slots List */}
          <div className="space-y-2 max-h-[600px] overflow-y-auto pr-1">
            {filteredSlots.map((slot) => {
              const isActive = activeSlotKey === slot.id;
              return (
                <div
                  key={slot.id}
                  onClick={() => setActiveSlotKey(slot.id)}
                  className={`p-3.5 rounded-xl border transition-all cursor-pointer ${
                    isActive
                      ? "border-indigo-500 bg-indigo-950/40 shadow-xs ring-1 ring-indigo-500/50"
                      : "border-slate-800 bg-slate-900/70 hover:border-slate-700 hover:bg-slate-900"
                  }`}
                >
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-xs font-black text-white truncate">
                      {slot.name}
                    </span>
                    <span
                      className={`text-[9px] font-extrabold uppercase px-2 py-0.5 rounded-md border ${
                        slot.enabled
                          ? "bg-emerald-950/60 text-emerald-400 border-emerald-800"
                          : "bg-slate-800 text-slate-400 border-slate-700"
                      }`}
                    >
                      {slot.enabled ? "Active" : "Disabled"}
                    </span>
                  </div>

                  <p className="text-[11px] text-slate-400 line-clamp-1 mt-1">
                    {slot.description}
                  </p>

                  <div className="flex items-center gap-2 mt-2 pt-2 border-t border-slate-800/60 text-[10px] text-slate-500">
                    <span className="font-mono bg-slate-800 px-1.5 py-0.5 rounded text-slate-400">
                      #{slot.id}
                    </span>
                    <span>•</span>
                    <span className="uppercase text-indigo-400 font-bold">{slot.type}</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right Column: Slot Detail Editor & Live Preview (8 cols) */}
        {currentSlot && (
          <div className="lg:col-span-8 space-y-6">
            {/* Slot Settings Card */}
            <div className="rounded-2xl border border-slate-800 bg-slate-900 p-5 sm:p-6 space-y-5">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800 pb-4">
                <div>
                  <div className="flex items-center gap-2">
                    <h2 className="text-lg font-black text-white">{currentSlot.name}</h2>
                    <span className="text-[10px] font-mono bg-slate-800 text-slate-400 px-2 py-0.5 rounded-md border border-slate-700">
                      key: {currentSlot.id}
                    </span>
                  </div>
                  <p className="text-xs text-slate-400 mt-0.5">{currentSlot.description}</p>
                </div>

                <div className="flex items-center gap-3">
                  {currentSlot.category === "custom" && (
                    <button
                      onClick={() => handleDeleteSlot(currentSlot.id)}
                      className="p-2 text-rose-400 hover:text-rose-300 hover:bg-rose-950/30 rounded-xl transition-all cursor-pointer"
                      title="Delete Slot"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  )}

                  <button
                    onClick={() => updateSlot(currentSlot.id, { enabled: !currentSlot.enabled })}
                    className={`flex items-center gap-2 px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer border ${
                      currentSlot.enabled
                        ? "bg-emerald-950/60 text-emerald-400 border-emerald-800"
                        : "bg-slate-800 text-slate-400 border-slate-700"
                    }`}
                  >
                    <span>{currentSlot.enabled ? "Slot is Enabled" : "Slot is Disabled"}</span>
                    {currentSlot.enabled ? (
                      <ToggleRight className="h-5 w-5 text-emerald-400" />
                    ) : (
                      <ToggleLeft className="h-5 w-5 text-slate-500" />
                    )}
                  </button>
                </div>
              </div>

              {/* Ad Type Selector */}
              <div>
                <label className="text-xs font-bold text-slate-300 block mb-2">
                  Ad Format / Variety Type:
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                  {[
                    { id: "promo_card", label: "Interactive Promo Card", icon: Sparkles },
                    { id: "affiliate", label: "Affiliate Product/Book", icon: ShoppingBag },
                    { id: "adsense", label: "Google AdSense Unit", icon: DollarSign },
                    { id: "html", label: "Custom HTML / Script", icon: Code },
                  ].map((t) => {
                    const isSelected = currentSlot.type === t.id;
                    const Icon = t.icon;
                    return (
                      <button
                        key={t.id}
                        type="button"
                        onClick={() => updateSlot(currentSlot.id, { type: t.id as AdType })}
                        className={`flex flex-col items-center justify-center p-3 rounded-xl border text-center transition-all cursor-pointer ${
                          isSelected
                            ? "border-indigo-500 bg-indigo-950/50 text-white shadow-xs ring-1 ring-indigo-500"
                            : "border-slate-800 bg-slate-800/60 text-slate-400 hover:text-white hover:border-slate-700"
                        }`}
                      >
                        <Icon className={`h-4 w-4 mb-1.5 ${isSelected ? "text-indigo-400" : "text-slate-400"}`} />
                        <span className="text-xs font-bold">{t.label}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* ── Sub-Editor 1: PROMO CARD ── */}
              {currentSlot.type === "promo_card" && (
                <div className="space-y-4 pt-3 border-t border-slate-800">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="text-xs font-bold text-slate-300 block mb-1">Headline Title</label>
                      <input
                        type="text"
                        value={currentSlot.promoCard?.title || ""}
                        onChange={(e) =>
                          updateSlot(currentSlot.id, {
                            promoCard: {
                              ...currentSlot.promoCard!,
                              title: e.target.value,
                            },
                          })
                        }
                        placeholder="e.g. SSC CGL 2026 Full CBT Mock Tests"
                        className="w-full rounded-xl border border-slate-700 bg-slate-800 px-3 py-2 text-xs text-white focus:border-indigo-500 focus:outline-none"
                      />
                    </div>

                    <div>
                      <label className="text-xs font-bold text-slate-300 block mb-1">Badge Tag</label>
                      <input
                        type="text"
                        value={currentSlot.promoCard?.badge || ""}
                        onChange={(e) =>
                          updateSlot(currentSlot.id, {
                            promoCard: {
                              ...currentSlot.promoCard!,
                              badge: e.target.value,
                            },
                          })
                        }
                        placeholder="e.g. SPECIAL 50% OFF or FREE COMMUNITY"
                        className="w-full rounded-xl border border-slate-700 bg-slate-800 px-3 py-2 text-xs text-white focus:border-indigo-500 focus:outline-none"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="text-xs font-bold text-slate-300 block mb-1">Subtitle / Description</label>
                    <input
                      type="text"
                      value={currentSlot.promoCard?.subtitle || ""}
                      onChange={(e) =>
                        updateSlot(currentSlot.id, {
                          promoCard: {
                            ...currentSlot.promoCard!,
                            subtitle: e.target.value,
                          },
                        })
                      }
                      placeholder="e.g. 500+ Full-Length Tests, Chapter-Wise Drills & Bilingual Solutions"
                      className="w-full rounded-xl border border-slate-700 bg-slate-800 px-3 py-2 text-xs text-white focus:border-indigo-500 focus:outline-none"
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="text-xs font-bold text-slate-300 block mb-1">Button Text (CTA)</label>
                      <input
                        type="text"
                        value={currentSlot.promoCard?.ctaText || ""}
                        onChange={(e) =>
                          updateSlot(currentSlot.id, {
                            promoCard: {
                              ...currentSlot.promoCard!,
                              ctaText: e.target.value,
                            },
                          })
                        }
                        placeholder="e.g. Attempt Free Test ➔"
                        className="w-full rounded-xl border border-slate-700 bg-slate-800 px-3 py-2 text-xs text-white focus:border-indigo-500 focus:outline-none"
                      />
                    </div>

                    <div>
                      <label className="text-xs font-bold text-slate-300 block mb-1">Destination URL</label>
                      <input
                        type="text"
                        value={currentSlot.promoCard?.targetUrl || ""}
                        onChange={(e) =>
                          updateSlot(currentSlot.id, {
                            promoCard: {
                              ...currentSlot.promoCard!,
                              targetUrl: e.target.value,
                            },
                          })
                        }
                        placeholder="e.g. /mocks or https://t.me/ssczone_official"
                        className="w-full rounded-xl border border-slate-700 bg-slate-800 px-3 py-2 text-xs text-white focus:border-indigo-500 focus:outline-none"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="text-xs font-bold text-slate-300 block mb-1">Color Theme</label>
                      <select
                        value={currentSlot.promoCard?.theme || "indigo"}
                        onChange={(e) =>
                          updateSlot(currentSlot.id, {
                            promoCard: {
                              ...currentSlot.promoCard!,
                              theme: e.target.value as any,
                            },
                          })
                        }
                        className="w-full rounded-xl border border-slate-700 bg-slate-800 px-3 py-2 text-xs text-white focus:border-indigo-500 focus:outline-none"
                      >
                        <option value="indigo">Indigo (Mock Tests & Pass)</option>
                        <option value="blue">Sky Blue (Telegram & Community)</option>
                        <option value="emerald">Emerald (Typing Test & Speed)</option>
                        <option value="amber">Amber (Daily Quiz & Deals)</option>
                        <option value="rose">Rose (Urgent / Live Challenges)</option>
                        <option value="dark">Dark Slate (Premium High-Contrast)</option>
                      </select>
                    </div>

                    <div>
                      <label className="text-xs font-bold text-slate-300 block mb-1">Card Icon</label>
                      <select
                        value={currentSlot.promoCard?.icon || "target"}
                        onChange={(e) =>
                          updateSlot(currentSlot.id, {
                            promoCard: {
                              ...currentSlot.promoCard!,
                              icon: e.target.value as any,
                            },
                          })
                        }
                        className="w-full rounded-xl border border-slate-700 bg-slate-800 px-3 py-2 text-xs text-white focus:border-indigo-500 focus:outline-none"
                      >
                        <option value="target">🎯 Target (Mock Tests)</option>
                        <option value="telegram">📢 Telegram / Send</option>
                        <option value="keyboard">⌨️ Keyboard (Typing Test)</option>
                        <option value="trophy">🏆 Trophy (Quiz Winner)</option>
                        <option value="book">📖 Book (Study Notes)</option>
                        <option value="flame">🔥 Flame (Trending)</option>
                        <option value="sparkles">✨ Sparkles (General)</option>
                      </select>
                    </div>
                  </div>
                </div>
              )}

              {/* ── Sub-Editor 2: AFFILIATE PRODUCT ── */}
              {currentSlot.type === "affiliate" && (
                <div className="space-y-4 pt-3 border-t border-slate-800">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="text-xs font-bold text-slate-300 block mb-1">Book / Product Title</label>
                      <input
                        type="text"
                        value={currentSlot.affiliateBanner?.title || ""}
                        onChange={(e) =>
                          updateSlot(currentSlot.id, {
                            affiliateBanner: {
                              ...currentSlot.affiliateBanner!,
                              title: e.target.value,
                            },
                          })
                        }
                        placeholder="e.g. Pinnacle SSC Maths 6800+ PYQ"
                        className="w-full rounded-xl border border-slate-700 bg-slate-800 px-3 py-2 text-xs text-white focus:border-indigo-500 focus:outline-none"
                      />
                    </div>

                    <div>
                      <label className="text-xs font-bold text-slate-300 block mb-1">Discount / Badge</label>
                      <input
                        type="text"
                        value={currentSlot.affiliateBanner?.badge || ""}
                        onChange={(e) =>
                          updateSlot(currentSlot.id, {
                            affiliateBanner: {
                              ...currentSlot.affiliateBanner!,
                              badge: e.target.value,
                            },
                          })
                        }
                        placeholder="e.g. Amazon Best Seller or Flat 35% Off"
                        className="w-full rounded-xl border border-slate-700 bg-slate-800 px-3 py-2 text-xs text-white focus:border-indigo-500 focus:outline-none"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="text-xs font-bold text-slate-300 block mb-1">Subtitle / Highlights</label>
                    <input
                      type="text"
                      value={currentSlot.affiliateBanner?.subtitle || ""}
                      onChange={(e) =>
                        updateSlot(currentSlot.id, {
                          affiliateBanner: {
                            ...currentSlot.affiliateBanner!,
                            subtitle: e.target.value,
                          },
                        })
                      }
                      placeholder="e.g. Complete English & Hindi Chapter-wise Solved Papers"
                      className="w-full rounded-xl border border-slate-700 bg-slate-800 px-3 py-2 text-xs text-white focus:border-indigo-500 focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="text-xs font-bold text-slate-300 block mb-1">Product Image URL</label>
                    <input
                      type="text"
                      value={currentSlot.affiliateBanner?.imageUrl || ""}
                      onChange={(e) =>
                        updateSlot(currentSlot.id, {
                          affiliateBanner: {
                            ...currentSlot.affiliateBanner!,
                            imageUrl: e.target.value,
                          },
                        })
                      }
                      placeholder="https://images.unsplash.com/..."
                      className="w-full rounded-xl border border-slate-700 bg-slate-800 px-3 py-2 text-xs text-white focus:border-indigo-500 focus:outline-none"
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="text-xs font-bold text-slate-300 block mb-1">Affiliate Destination Link</label>
                      <input
                        type="text"
                        value={currentSlot.affiliateBanner?.targetUrl || ""}
                        onChange={(e) =>
                          updateSlot(currentSlot.id, {
                            affiliateBanner: {
                              ...currentSlot.affiliateBanner!,
                              targetUrl: e.target.value,
                            },
                          })
                        }
                        placeholder="https://www.amazon.in/dp/.../?tag=ssczone-21"
                        className="w-full rounded-xl border border-slate-700 bg-slate-800 px-3 py-2 text-xs text-white focus:border-indigo-500 focus:outline-none"
                      />
                    </div>

                    <div>
                      <label className="text-xs font-bold text-slate-300 block mb-1">Button Text</label>
                      <input
                        type="text"
                        value={currentSlot.affiliateBanner?.ctaText || ""}
                        onChange={(e) =>
                          updateSlot(currentSlot.id, {
                            affiliateBanner: {
                              ...currentSlot.affiliateBanner!,
                              ctaText: e.target.value,
                            },
                          })
                        }
                        placeholder="Buy on Amazon ➔"
                        className="w-full rounded-xl border border-slate-700 bg-slate-800 px-3 py-2 text-xs text-white focus:border-indigo-500 focus:outline-none"
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* ── Sub-Editor 3: GOOGLE ADSENSE ── */}
              {currentSlot.type === "adsense" && (
                <div className="space-y-4 pt-3 border-t border-slate-800">
                  <div>
                    <label className="text-xs font-bold text-slate-300 block mb-1">Google AdSense Ad Slot ID</label>
                    <input
                      type="text"
                      value={currentSlot.adsenseSlotId || ""}
                      onChange={(e) => updateSlot(currentSlot.id, { adsenseSlotId: e.target.value })}
                      placeholder="e.g. 1234567890"
                      className="w-full rounded-xl border border-slate-700 bg-slate-800 px-3 py-2 text-xs text-white focus:border-indigo-500 focus:outline-none"
                    />
                    <p className="text-[10px] text-slate-400 mt-1">
                      From your Google AdSense Dashboard &gt; Ads &gt; By ad unit &gt; Display ad &gt; Copy Slot ID.
                    </p>
                  </div>
                </div>
              )}

              {/* ── Sub-Editor 4: CUSTOM HTML / SCRIPT ── */}
              {currentSlot.type === "html" && (
                <div className="space-y-4 pt-3 border-t border-slate-800">
                  <div>
                    <label className="text-xs font-bold text-slate-300 block mb-1">Custom HTML / Script Code</label>
                    <textarea
                      rows={5}
                      value={currentSlot.customHtml || ""}
                      onChange={(e) => updateSlot(currentSlot.id, { customHtml: e.target.value })}
                      placeholder="<div>...</div>"
                      className="w-full font-mono rounded-xl border border-slate-700 bg-slate-800 px-3 py-2 text-xs text-emerald-400 focus:border-indigo-500 focus:outline-none"
                    />
                  </div>
                </div>
              )}
            </div>

            {/* ── LIVE INTERACTIVE PREVIEW CARD ── */}
            <div className="rounded-2xl border border-slate-800 bg-slate-900 p-5 space-y-3">
              <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                <div className="flex items-center gap-2">
                  <Eye className="h-4 w-4 text-emerald-400" />
                  <span className="text-xs font-black text-white">Live Visual Preview</span>
                  <span className="text-[10px] text-slate-400">(How candidates see it)</span>
                </div>

                <div className="flex items-center gap-1 bg-slate-800 p-1 rounded-lg">
                  <button
                    onClick={() => setActivePreviewDevice("desktop")}
                    className={`p-1.5 rounded-md text-xs transition-colors cursor-pointer ${
                      activePreviewDevice === "desktop" ? "bg-indigo-600 text-white" : "text-slate-400"
                    }`}
                    title="Desktop Preview"
                  >
                    <Monitor className="h-3.5 w-3.5" />
                  </button>
                  <button
                    onClick={() => setActivePreviewDevice("mobile")}
                    className={`p-1.5 rounded-md text-xs transition-colors cursor-pointer ${
                      activePreviewDevice === "mobile" ? "bg-indigo-600 text-white" : "text-slate-400"
                    }`}
                    title="Mobile Preview"
                  >
                    <Smartphone className="h-3.5 w-3.5" />
                  </button>
                </div>
              </div>

              <div
                className={`mx-auto bg-slate-950 p-4 rounded-xl border border-slate-800/80 transition-all ${
                  activePreviewDevice === "mobile" ? "max-w-[360px]" : "w-full"
                }`}
              >
                <AdBannerSlot slotKey={currentSlot.id} />
              </div>
            </div>
          </div>
        )}
      </div>

      {/* ── MODAL: ADD CUSTOM SLOT ── */}
      {showNewSlotModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-xs p-4">
          <div className="w-full max-w-md rounded-2xl border border-slate-700 bg-slate-900 p-6 space-y-4 shadow-xl">
            <h3 className="text-base font-black text-white">Add New Custom Ad Slot</h3>
            <p className="text-xs text-slate-400">
              Define a new slot key that you can place in any component or page using:
              <code className="block mt-1 font-mono text-[11px] text-emerald-400 bg-slate-800 p-1 rounded">
                &lt;AdBannerSlot slotKey="YOUR_SLOT_ID" /&gt;
              </code>
            </p>

            <div className="space-y-3">
              <div>
                <label className="text-xs font-bold text-slate-300 block mb-1">Slot Key (Identifier)</label>
                <input
                  type="text"
                  placeholder="e.g. syllabus_top or test_sidebar"
                  value={newSlotId}
                  onChange={(e) => setNewSlotId(e.target.value)}
                  className="w-full rounded-xl border border-slate-700 bg-slate-800 px-3 py-2 text-xs text-white focus:border-indigo-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-300 block mb-1">Display Name</label>
                <input
                  type="text"
                  placeholder="e.g. Syllabus Header Promo Banner"
                  value={newSlotName}
                  onChange={(e) => setNewSlotName(e.target.value)}
                  className="w-full rounded-xl border border-slate-700 bg-slate-800 px-3 py-2 text-xs text-white focus:border-indigo-500 focus:outline-none"
                />
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => setShowNewSlotModal(false)}
                className="px-4 py-2 rounded-xl text-xs font-bold text-slate-400 hover:text-white cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleCreateCustomSlot}
                className="px-5 py-2 rounded-xl text-xs font-black bg-indigo-600 hover:bg-indigo-700 text-white cursor-pointer"
              >
                Create Slot
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
