"use client";

import { useEffect, useState } from "react";
import {
  Bell,
  ToggleLeft,
  ToggleRight,
  Save,
  CheckCircle2,
  Sparkles,
  Smartphone,
  Monitor,
  ExternalLink,
  Info,
  Clock,
  Layers,
  AlertTriangle,
  RefreshCw,
  X,
  FileText,
  Flame,
  Award
} from "lucide-react";
import toast from "react-hot-toast";
import { AnnouncementConfig, DEFAULT_ANNOUNCEMENT_CONFIG } from "@/lib/announcements-types";

const PRESETS = [
  {
    name: "Tier-1 Answer Key",
    badge: "🚨 EXAM UPDATE",
    title: "SSC Tier-1 Answer Key & Score Analysis Live!",
    message: "Check latest SSC Tier-1 shift questions and response keys. Calculate your raw marks & rank predictor right now.",
    btnText: "Check Answer Key →",
    btnUrl: "/papers?exam=cgl",
    imageUrl: "https://images.unsplash.com/photo-1584697964190-71c4c81b95ff?w=800&auto=format&fit=crop&q=80",
  },
  {
    name: "Result Declared",
    badge: "🎯 RESULT OUT",
    title: "SSC CGL Tier-1 Results & Cutoff Analysis!",
    message: "Category-wise expected merit lists and qualifying cutoffs for Tier-2 examination are now available. Check details below.",
    btnText: "View Cutoffs & Merit List →",
    btnUrl: "/blog",
    imageUrl: "https://images.unsplash.com/photo-1523240795612-9a054b0db644?w=800&auto=format&fit=crop&q=80",
  },
  {
    name: "Admit Card Released",
    badge: "🎫 ADMIT CARD LIVE",
    title: "Tier-1 Examination Admit Card & City Slip Live",
    message: "Regional SSC portals (NR, CR, WR, ER) have activated the admit card download link. Check your exam center and shift timing.",
    btnText: "Download Admit Card →",
    btnUrl: "/blog",
    imageUrl: "https://images.unsplash.com/photo-1434030216411-0b793f4b4173?w=800&auto=format&fit=crop&q=80",
  },
  {
    name: "Daily Mega Quiz",
    badge: "⚡ LIVE CHALLENGE",
    title: "Today's SSC CGL Live All-India Free Mock Test",
    message: "Compete against 15,000+ serious aspirants with real examination interface, sectional timer, and bilingual solutions.",
    btnText: "Start Free Test Now ➔",
    btnUrl: "/daily-quiz",
    imageUrl: "https://images.unsplash.com/photo-1457369804613-52c61a468e7d?w=800&auto=format&fit=crop&q=80",
  },
];

export default function AdminAnnouncementPage() {
  const [config, setConfig] = useState<AnnouncementConfig>(DEFAULT_ANNOUNCEMENT_CONFIG);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [activePreviewDevice, setActivePreviewDevice] = useState<"desktop" | "mobile">("desktop");

  useEffect(() => {
    fetch("/api/admin/announcement")
      .then((res) => res.json())
      .then((data) => {
        if (data.success && data.config) {
          setConfig(data.config);
        }
      })
      .catch((e) => {
        console.warn("Failed to load announcement config:", e);
      })
      .finally(() => {
        setLoading(false);
      });
  }, []);

  async function handleSave() {
    setSaving(true);
    try {
      // Generate a new version tag so dismissed users see the updated announcement
      const updatedConfig = {
        ...config,
        version: `ann_${Date.now()}`,
      };

      const res = await fetch("/api/admin/announcement", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updatedConfig),
      });
      const data = await res.json();
      if (data.success) {
        setConfig(data.config);
        toast.success("Announcement modal published & broadcasted! 📢", {
          icon: "🚀",
          style: { borderRadius: "12px", background: "#065f46", color: "#fff" },
        });
      } else {
        throw new Error(data.error || "Failed to save announcement");
      }
    } catch (e: any) {
      toast.error(e?.message || "Failed to save announcement");
    } finally {
      setSaving(false);
    }
  }

  function applyPreset(p: typeof PRESETS[0]) {
    setConfig((prev) => ({
      ...prev,
      badge: p.badge,
      title: p.title,
      message: p.message,
      imageUrl: p.imageUrl,
      primaryButton: {
        ...prev.primaryButton,
        text: p.btnText,
        url: p.btnUrl,
      },
    }));
    toast.success(`Preset "${p.name}" applied!`, { icon: "✨" });
  }

  return (
    <div className="space-y-6 max-w-6xl pb-16">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-5">
        <div>
          <h1 className="text-2xl font-black text-white flex items-center gap-2">
            <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-amber-500/20 text-amber-400 border border-amber-500/30">
              <Bell className="h-5 w-5" />
            </span>
            <span>Announcement Popup Modal</span>
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Display an immediate high-priority modal alert to website visitors whenever Answer Keys, Results, or urgent exam notices are released.
          </p>
        </div>

        <button
          onClick={handleSave}
          disabled={saving}
          className="flex items-center justify-center gap-2 rounded-xl bg-amber-500 hover:bg-amber-600 px-6 py-2.5 text-xs sm:text-sm font-black text-slate-950 shadow-md active:scale-98 transition-all disabled:opacity-50 cursor-pointer"
        >
          {saving ? <RefreshCw className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
          <span>{saving ? "Publishing Alert..." : "Publish Announcement"}</span>
        </button>
      </div>

      {/* Master Switch */}
      <div
        className={`rounded-2xl border p-5 sm:p-6 transition-all ${
          config.enabled
            ? "border-amber-300 bg-amber-50/70 shadow-xs"
            : "border-gray-200 bg-white"
        }`}
      >
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span
                className={`h-3 w-3 rounded-full ${
                  config.enabled ? "bg-amber-500 animate-ping" : "bg-gray-300"
                }`}
              />
              <h3 className="text-base font-black text-gray-900">
                Announcement Modal Visibility Switch
              </h3>
            </div>
            <p className="text-xs text-gray-600">
              When ON, visitors will see this modal popup once per session (with smooth delay). When OFF, no modal will be displayed.
            </p>
          </div>

          <button
            onClick={() => setConfig((prev) => ({ ...prev, enabled: !prev.enabled }))}
            className={`flex items-center gap-2 rounded-xl px-5 py-2.5 text-xs font-black shadow-xs transition-all cursor-pointer ${
              config.enabled
                ? "bg-amber-500 text-slate-950 hover:bg-amber-600 font-extrabold"
                : "bg-gray-200 text-gray-700 hover:bg-gray-300"
            }`}
          >
            {config.enabled ? (
              <>
                <ToggleRight className="h-5 w-5" />
                <span>POPUP ACTIVE (BROADCASTING)</span>
              </>
            ) : (
              <>
                <ToggleLeft className="h-5 w-5" />
                <span>POPUP PAUSED (HIDDEN)</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Quick Presets */}
      <div className="space-y-2">
        <div className="text-xs font-black text-gray-400 uppercase tracking-wider flex items-center gap-1.5">
          <Sparkles className="h-3.5 w-3.5 text-amber-500" />
          <span>Quick 1-Click Presets:</span>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
          {PRESETS.map((p) => (
            <button
              key={p.name}
              type="button"
              onClick={() => applyPreset(p)}
              className="p-3 rounded-xl border border-gray-200 bg-white hover:border-amber-400 hover:bg-amber-50/40 text-left transition-all cursor-pointer shadow-2xs group"
            >
              <div className="text-xs font-black text-gray-900 group-hover:text-amber-800">
                {p.name}
              </div>
              <div className="text-[10px] text-gray-500 truncate mt-0.5">{p.badge}</div>
            </button>
          ))}
        </div>
      </div>

      {/* Main Form + Live Preview */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Form (7 Cols) */}
        <div className="lg:col-span-7 space-y-5">
          <div className="rounded-2xl border border-gray-200 bg-white p-5 sm:p-6 shadow-xs space-y-4">
            <h3 className="text-sm font-black text-gray-900 uppercase tracking-wider flex items-center gap-2">
              <Layers className="h-4 w-4 text-blue-600" />
              <span>Modal Content &amp; Media</span>
            </h3>

            {/* Badge & Title */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="block text-[11px] font-bold text-gray-700 mb-1">
                  Alert Badge / Tag
                </label>
                <input
                  type="text"
                  value={config.badge}
                  onChange={(e) => setConfig((prev) => ({ ...prev, badge: e.target.value }))}
                  placeholder="e.g. 🚨 URGENT NOTIFICATION"
                  className="w-full rounded-xl border border-gray-200 bg-gray-50 p-2.5 text-xs font-semibold focus:bg-white focus:outline-hidden"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="block text-[11px] font-bold text-gray-700 mb-1">
                  Modal Headline (Title)
                </label>
                <input
                  type="text"
                  value={config.title}
                  onChange={(e) => setConfig((prev) => ({ ...prev, title: e.target.value }))}
                  placeholder="SSC CGL Tier-1 Score Update! Check Your Marks"
                  className="w-full rounded-xl border border-gray-200 bg-gray-50 p-2.5 text-xs font-bold text-gray-900 focus:bg-white focus:outline-hidden"
                />
              </div>
            </div>

            {/* Message */}
            <div>
              <label className="block text-[11px] font-bold text-gray-700 mb-1">
                Announcement Message Description
              </label>
              <textarea
                rows={3}
                value={config.message}
                onChange={(e) => setConfig((prev) => ({ ...prev, message: e.target.value }))}
                placeholder="Write the full detail here..."
                className="w-full rounded-xl border border-gray-200 bg-gray-50 p-2.5 text-xs font-medium focus:bg-white focus:outline-hidden leading-relaxed"
              />
            </div>

            {/* Image URL */}
            <div>
              <label className="block text-[11px] font-bold text-gray-700 mb-1">
                Cover Image URL (Optional)
              </label>
              <input
                type="url"
                value={config.imageUrl || ""}
                onChange={(e) => setConfig((prev) => ({ ...prev, imageUrl: e.target.value }))}
                placeholder="https://images.unsplash.com/..."
                className="w-full rounded-xl border border-gray-200 bg-gray-50 p-2.5 text-xs font-medium focus:bg-white focus:outline-hidden"
              />
            </div>

            {/* Buttons Setup */}
            <div className="pt-3 border-t border-gray-100 space-y-3">
              <h4 className="text-xs font-black text-gray-800 uppercase tracking-wider">
                Action Buttons
              </h4>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-bold text-gray-700 mb-1">
                    Primary Button Text
                  </label>
                  <input
                    type="text"
                    value={config.primaryButton.text}
                    onChange={(e) =>
                      setConfig((prev) => ({
                        ...prev,
                        primaryButton: { ...prev.primaryButton, text: e.target.value },
                      }))
                    }
                    placeholder="Check Score Now ➔"
                    className="w-full rounded-xl border border-gray-200 bg-gray-50 p-2.5 text-xs font-bold focus:bg-white focus:outline-hidden"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-gray-700 mb-1">
                    Primary Button Link URL
                  </label>
                  <input
                    type="text"
                    value={config.primaryButton.url || ""}
                    onChange={(e) =>
                      setConfig((prev) => ({
                        ...prev,
                        primaryButton: { ...prev.primaryButton, url: e.target.value },
                      }))
                    }
                    placeholder="/papers?exam=cgl or external URL"
                    className="w-full rounded-xl border border-gray-200 bg-gray-50 p-2.5 text-xs font-medium focus:bg-white focus:outline-hidden"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-bold text-gray-700 mb-1">
                    Secondary Button Text
                  </label>
                  <input
                    type="text"
                    value={config.secondaryButton?.text || ""}
                    onChange={(e) =>
                      setConfig((prev) => ({
                        ...prev,
                        secondaryButton: {
                          ...(prev.secondaryButton || { isDismiss: true }),
                          text: e.target.value,
                        },
                      }))
                    }
                    placeholder="Remind Me Later"
                    className="w-full rounded-xl border border-gray-200 bg-gray-50 p-2.5 text-xs font-medium focus:bg-white focus:outline-hidden"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-gray-700 mb-1">
                    Popup Delay (Seconds)
                  </label>
                  <input
                    type="number"
                    step="0.5"
                    min="0"
                    max="10"
                    value={config.showDelaySec}
                    onChange={(e) =>
                      setConfig((prev) => ({
                        ...prev,
                        showDelaySec: parseFloat(e.target.value) || 1,
                      }))
                    }
                    className="w-full rounded-xl border border-gray-200 bg-gray-50 p-2.5 text-xs font-medium focus:bg-white focus:outline-hidden"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right: Live Interactive Modal Preview (5 Cols) */}
        <div className="lg:col-span-5 space-y-5">
          <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-xs space-y-4 sticky top-20">
            <div className="flex items-center justify-between border-b border-gray-100 pb-3">
              <h3 className="text-sm font-black text-gray-900 flex items-center gap-1.5">
                <Monitor className="h-4 w-4 text-amber-600" />
                <span>Live Popup Modal Preview</span>
              </h3>

              <div className="flex items-center gap-1 rounded-lg bg-gray-100 p-0.5 border border-gray-200">
                <button
                  onClick={() => setActivePreviewDevice("desktop")}
                  className={`p-1.5 rounded-md transition-all cursor-pointer ${
                    activePreviewDevice === "desktop" ? "bg-white text-blue-700 shadow-2xs" : "text-gray-500"
                  }`}
                  title="Desktop Preview"
                >
                  <Monitor className="h-3.5 w-3.5" />
                </button>
                <button
                  onClick={() => setActivePreviewDevice("mobile")}
                  className={`p-1.5 rounded-md transition-all cursor-pointer ${
                    activePreviewDevice === "mobile" ? "bg-white text-blue-700 shadow-2xs" : "text-gray-500"
                  }`}
                  title="Mobile Preview"
                >
                  <Smartphone className="h-3.5 w-3.5" />
                </button>
              </div>
            </div>

            {/* Simulated Website Backdrop with Overlay */}
            <div className="relative rounded-2xl bg-slate-900/80 p-4 sm:p-6 min-h-[380px] flex items-center justify-center overflow-hidden">
              {/* Blurred website background mock */}
              <div className="absolute inset-0 opacity-15 pointer-events-none p-4 space-y-3">
                <div className="h-5 w-32 bg-white rounded-md" />
                <div className="h-24 w-full bg-white rounded-xl" />
                <div className="h-12 w-full bg-white rounded-xl" />
              </div>

              {/* Modal Card */}
              <div
                className={`relative w-full rounded-2xl bg-white shadow-2xl border border-gray-200 overflow-hidden transition-all ${
                  activePreviewDevice === "mobile" ? "max-w-xs" : "max-w-md"
                }`}
              >
                {/* Image Banner */}
                {config.imageUrl && (
                  <div className="relative h-28 sm:h-32 w-full bg-slate-100 overflow-hidden">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={config.imageUrl}
                      alt=""
                      className="h-full w-full object-cover"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                    <div className="absolute top-2.5 right-2.5">
                      <span className="p-1 rounded-full bg-black/40 text-white/80 inline-flex">
                        <X className="h-3.5 w-3.5" />
                      </span>
                    </div>
                  </div>
                )}

                {/* Modal Body */}
                <div className="p-4 sm:p-5 space-y-3">
                  <div className="flex items-center gap-2">
                    <span className="inline-flex items-center gap-1 rounded-md bg-amber-100 px-2 py-0.5 text-[10px] font-black uppercase text-amber-900 border border-amber-300">
                      <Flame className="h-2.5 w-2.5 text-amber-600 fill-amber-600" />
                      <span>{config.badge || "ANNOUNCEMENT"}</span>
                    </span>
                  </div>

                  <h3 className="text-sm sm:text-base font-black text-gray-950 leading-snug">
                    {config.title || "Announcement Title"}
                  </h3>

                  <p className="text-xs text-gray-600 leading-relaxed">
                    {config.message || "Announcement message description goes here..."}
                  </p>

                  {/* Actions */}
                  <div className="pt-2 flex flex-col gap-2">
                    <button
                      type="button"
                      className="w-full rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 py-2.5 px-4 text-xs font-black text-white shadow-md hover:from-blue-700 hover:to-indigo-700 transition-all text-center"
                    >
                      {config.primaryButton.text || "Check Now ➔"}
                    </button>

                    {config.secondaryButton?.text && (
                      <button
                        type="button"
                        className="w-full text-center py-1 text-[11px] font-semibold text-gray-500 hover:text-gray-800"
                      >
                        {config.secondaryButton.text}
                      </button>
                    )}
                  </div>
                </div>
              </div>
            </div>

            <div className="rounded-xl bg-blue-50/80 p-3.5 border border-blue-100 text-xs text-blue-900 space-y-1">
              <div className="font-extrabold flex items-center gap-1.5">
                <Info className="h-4 w-4 text-blue-700 shrink-0" />
                <span>Smart Session Storage:</span>
              </div>
              <p className="text-[11px] text-blue-800 leading-relaxed">
                When a user closes this popup, it will remain hidden for the rest of their session so they aren't spammed. Once you update the announcement, everyone sees the new alert.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
