"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  LayoutTemplate,
  Save,
  Plus,
  Trash2,
  Edit2,
  CheckCircle2,
  Sparkles,
  ExternalLink,
  Send,
  Youtube,
  MessageCircle,
  Twitter,
  Instagram,
  Mail,
  RefreshCw,
  X,
  Layers,
  ArrowRight
} from "lucide-react";
import toast from "react-hot-toast";
import { FooterConfig, FooterColumn, FooterLink, FooterSocialLink, DEFAULT_FOOTER_CONFIG } from "@/lib/footer-types";

export default function AdminFooterPage() {
  const [config, setConfig] = useState<FooterConfig>(DEFAULT_FOOTER_CONFIG);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [activeTab, setActiveTab] = useState<"columns" | "social" | "brand" | "legal">("columns");

  // Load footer config
  async function loadFooter() {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/footer");
      const data = await res.json();
      if (data.success && data.config) {
        setConfig(data.config);
      }
    } catch (e: any) {
      toast.error("Failed to load footer config: " + e.message);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadFooter();
  }, []);

  // Save footer config
  async function handleSave() {
    setSaving(true);
    try {
      const res = await fetch("/api/admin/footer", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(config),
      });
      const data = await res.json();
      if (data.success) {
        toast.success("Footer configuration published & synced to Supabase! 🎉", {
          icon: "🚀",
          style: { borderRadius: "12px", background: "#065f46", color: "#fff" },
        });
        setConfig(data.config);
      } else {
        toast.error(data.error || "Failed to save footer config");
      }
    } catch (e: any) {
      toast.error("Error saving: " + e.message);
    } finally {
      setSaving(false);
    }
  }

  // --- COLUMN HELPERS ---
  function addColumn() {
    const newId = `col-${Date.now()}`;
    setConfig((prev) => ({
      ...prev,
      columns: [
        ...prev.columns,
        {
          id: newId,
          title: "New Column",
          links: [{ label: "New Link", href: "/" }],
        },
      ],
    }));
  }

  function removeColumn(colIndex: number) {
    if (!confirm("Are you sure you want to delete this footer column?")) return;
    setConfig((prev) => ({
      ...prev,
      columns: prev.columns.filter((_, i) => i !== colIndex),
    }));
  }

  function updateColumnTitle(colIndex: number, title: string) {
    setConfig((prev) => {
      const copy = [...prev.columns];
      copy[colIndex] = { ...copy[colIndex], title };
      return { ...prev, columns: copy };
    });
  }

  // --- LINK HELPERS ---
  function addLinkToColumn(colIndex: number) {
    setConfig((prev) => {
      const copy = [...prev.columns];
      copy[colIndex] = {
        ...copy[colIndex],
        links: [...copy[colIndex].links, { label: "New Link", href: "/" }],
      };
      return { ...prev, columns: copy };
    });
  }

  function updateLink(colIndex: number, linkIndex: number, field: keyof FooterLink, value: any) {
    setConfig((prev) => {
      const copy = [...prev.columns];
      const linksCopy = [...copy[colIndex].links];
      linksCopy[linkIndex] = { ...linksCopy[linkIndex], [field]: value };
      copy[colIndex] = { ...copy[colIndex], links: linksCopy };
      return { ...prev, columns: copy };
    });
  }

  function removeLink(colIndex: number, linkIndex: number) {
    setConfig((prev) => {
      const copy = [...prev.columns];
      copy[colIndex] = {
        ...copy[colIndex],
        links: copy[colIndex].links.filter((_, i) => i !== linkIndex),
      };
      return { ...prev, columns: copy };
    });
  }

  // --- SOCIAL LINK HELPERS ---
  function updateSocialLink(platform: string, field: keyof FooterSocialLink, value: any) {
    setConfig((prev) => {
      const updated = prev.socialLinks.map((s) =>
        s.platform === platform ? { ...s, [field]: value } : s
      );
      return { ...prev, socialLinks: updated };
    });
  }

  // --- LEGAL LINK HELPERS ---
  function updateLegalLink(index: number, field: "label" | "href", value: string) {
    setConfig((prev) => {
      const copy = [...prev.legalLinks];
      copy[index] = { ...copy[index], [field]: value };
      return { ...prev, legalLinks: copy };
    });
  }

  function addLegalLink() {
    setConfig((prev) => ({
      ...prev,
      legalLinks: [...prev.legalLinks, { label: "New Legal Page", href: "/" }],
    }));
  }

  function removeLegalLink(index: number) {
    setConfig((prev) => ({
      ...prev,
      legalLinks: prev.legalLinks.filter((_, i) => i !== index),
    }));
  }

  return (
    <div className="space-y-6 pb-20">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-5">
        <div>
          <div className="flex items-center gap-2 text-xs font-bold text-blue-400 uppercase tracking-wider mb-1">
            <Sparkles className="w-4 h-4" />
            <span>Site-Wide Footer CMS & Supabase Synced</span>
          </div>
          <h1 className="text-2xl font-black text-white flex items-center gap-2.5">
            <LayoutTemplate className="w-7 h-7 text-blue-500" />
            <span>Footer & Social Channels Manager</span>
          </h1>
          <p className="text-xs text-slate-400 mt-1 max-w-xl">
            Control the site-wide footer links, columns, social media channels, disclaimer text, and legal policies shown across all pages.
          </p>
        </div>

        <div className="flex items-center gap-2.5 shrink-0">
          <Link
            href="/"
            target="_blank"
            className="px-3.5 py-2 rounded-xl border border-slate-700 bg-slate-800/80 hover:bg-slate-700 text-xs font-bold text-slate-200 transition-all flex items-center gap-1.5"
          >
            <span>View Home</span>
            <ExternalLink className="w-3 h-3 text-slate-400" />
          </Link>

          <button
            onClick={handleSave}
            disabled={saving}
            className="px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-black shadow-lg shadow-blue-900/40 transition-all flex items-center gap-2 cursor-pointer"
          >
            {saving ? (
              <span>Saving...</span>
            ) : (
              <>
                <Save className="w-4 h-4" />
                <span>Save & Publish Live</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-800 pb-2 overflow-x-auto text-xs font-bold">
        <button
          onClick={() => setActiveTab("columns")}
          className={`px-4 py-2 rounded-xl transition-all cursor-pointer whitespace-nowrap ${
            activeTab === "columns"
              ? "bg-blue-600 text-white shadow-xs"
              : "text-slate-400 hover:text-white hover:bg-slate-800"
          }`}
        >
          📂 Navigation Columns ({config.columns?.length || 0})
        </button>
        <button
          onClick={() => setActiveTab("social")}
          className={`px-4 py-2 rounded-xl transition-all cursor-pointer whitespace-nowrap ${
            activeTab === "social"
              ? "bg-blue-600 text-white shadow-xs"
              : "text-slate-400 hover:text-white hover:bg-slate-800"
          }`}
        >
          💬 Social Channels ({config.socialLinks?.filter((s) => s.is_active).length || 0} Active)
        </button>
        <button
          onClick={() => setActiveTab("brand")}
          className={`px-4 py-2 rounded-xl transition-all cursor-pointer whitespace-nowrap ${
            activeTab === "brand"
              ? "bg-blue-600 text-white shadow-xs"
              : "text-slate-400 hover:text-white hover:bg-slate-800"
          }`}
        >
          🏢 Brand & About Text
        </button>
        <button
          onClick={() => setActiveTab("legal")}
          className={`px-4 py-2 rounded-xl transition-all cursor-pointer whitespace-nowrap ${
            activeTab === "legal"
              ? "bg-blue-600 text-white shadow-xs"
              : "text-slate-400 hover:text-white hover:bg-slate-800"
          }`}
        >
          ⚖️ Copyright & Legal Links
        </button>
      </div>

      {loading ? (
        <div className="p-16 text-center text-slate-400 space-y-3">
          <div className="w-8 h-8 border-3 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-xs font-bold">Loading Footer Configuration...</p>
        </div>
      ) : (
        <div>
          {/* ════════════════════════════════════════════════════════════
              TAB 1: NAVIGATION COLUMNS & LINKS
             ════════════════════════════════════════════════════════════ */}
          {activeTab === "columns" && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-bold text-white">Footer Navigation Columns</h3>
                  <p className="text-xs text-slate-400 mt-0.5">
                    Organize links into categories such as Practice, Target Exams, and Resources.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={addColumn}
                  className="px-3.5 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-bold text-blue-400 flex items-center gap-1.5 cursor-pointer border border-slate-700"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Add New Column</span>
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                {config.columns.map((col, colIndex) => (
                  <div
                    key={col.id || colIndex}
                    className="bg-slate-800/80 border border-slate-700 rounded-2xl p-4 flex flex-col justify-between"
                  >
                    <div>
                      {/* Column Title Bar */}
                      <div className="flex items-center justify-between gap-2 pb-3 border-b border-slate-700 mb-3">
                        <input
                          type="text"
                          value={col.title}
                          onChange={(e) => updateColumnTitle(colIndex, e.target.value)}
                          placeholder="Column Title"
                          className="bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-1 text-xs font-bold text-white focus:border-blue-500 flex-1"
                        />
                        <button
                          type="button"
                          onClick={() => removeColumn(colIndex)}
                          className="p-1.5 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-slate-700"
                          title="Delete Column"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>

                      {/* Links List inside Column */}
                      <div className="space-y-2">
                        {col.links.map((link, linkIndex) => (
                          <div
                            key={linkIndex}
                            className="bg-slate-900/90 p-2 rounded-xl border border-slate-700/80 space-y-1.5"
                          >
                            <div className="flex items-center gap-1.5">
                              <input
                                type="text"
                                value={link.label}
                                onChange={(e) => updateLink(colIndex, linkIndex, "label", e.target.value)}
                                placeholder="Link Label"
                                className="flex-1 bg-slate-800 border border-slate-700 rounded-lg px-2 py-1 text-xs text-white"
                              />
                              <button
                                type="button"
                                onClick={() => removeLink(colIndex, linkIndex)}
                                className="p-1 text-slate-400 hover:text-rose-400"
                              >
                                <X className="w-3 h-3" />
                              </button>
                            </div>

                            <div className="flex items-center gap-1.5">
                              <input
                                type="text"
                                value={link.href}
                                onChange={(e) => updateLink(colIndex, linkIndex, "href", e.target.value)}
                                placeholder="/path or https://..."
                                className="flex-1 bg-slate-800 border border-slate-700 rounded-lg px-2 py-1 text-[11px] font-mono text-slate-300"
                              />
                              <input
                                type="text"
                                value={link.badge || ""}
                                onChange={(e) => updateLink(colIndex, linkIndex, "badge", e.target.value)}
                                placeholder="Badge (e.g. 2026)"
                                className="w-24 bg-slate-800 border border-slate-700 rounded-lg px-2 py-1 text-[10px] text-slate-300 text-center"
                              />
                            </div>

                            <div className="flex items-center justify-between text-[10px] text-slate-400 pt-1">
                              <label className="flex items-center gap-1 cursor-pointer">
                                <input
                                  type="checkbox"
                                  checked={link.is_highlight || false}
                                  onChange={(e) => updateLink(colIndex, linkIndex, "is_highlight", e.target.checked)}
                                  className="rounded text-blue-600"
                                />
                                <span>Highlight Link</span>
                              </label>

                              <label className="flex items-center gap-1 cursor-pointer">
                                <input
                                  type="checkbox"
                                  checked={link.is_external || false}
                                  onChange={(e) => updateLink(colIndex, linkIndex, "is_external", e.target.checked)}
                                  className="rounded text-blue-600"
                                />
                                <span>External (Open in New Tab)</span>
                              </label>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Add Link Button */}
                    <button
                      type="button"
                      onClick={() => addLinkToColumn(colIndex)}
                      className="mt-3 py-1.5 px-3 rounded-xl bg-slate-900 hover:bg-slate-700/80 text-xs font-bold text-blue-400 border border-slate-700/60 flex items-center justify-center gap-1 w-full cursor-pointer"
                    >
                      <Plus className="w-3 h-3" />
                      <span>Add Link</span>
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ════════════════════════════════════════════════════════════
              TAB 2: SOCIAL CHANNELS & COMMUNITY LINKS
             ════════════════════════════════════════════════════════════ */}
          {activeTab === "social" && (
            <div className="bg-slate-800/80 border border-slate-700 rounded-2xl p-5 space-y-4 max-w-2xl">
              <div>
                <h3 className="text-sm font-bold text-white">Social Media &amp; Community Channels</h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  Update links to your Telegram group, YouTube lectures, WhatsApp support, and social handles.
                </p>
              </div>

              <div className="space-y-3 pt-2">
                {config.socialLinks.map((s) => (
                  <div
                    key={s.platform}
                    className="bg-slate-900 p-3 rounded-xl border border-slate-700 space-y-2"
                  >
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex items-center gap-2">
                        {s.platform === "telegram" && <Send className="w-4 h-4 text-sky-400" />}
                        {s.platform === "youtube" && <Youtube className="w-4 h-4 text-rose-500" />}
                        {s.platform === "whatsapp" && <MessageCircle className="w-4 h-4 text-emerald-400" />}
                        {s.platform === "twitter" && <Twitter className="w-4 h-4 text-blue-400" />}
                        {s.platform === "instagram" && <Instagram className="w-4 h-4 text-pink-400" />}
                        <span className="text-xs font-bold text-white capitalize">{s.platform}</span>
                      </div>

                      <label className="flex items-center gap-1.5 text-xs font-bold text-slate-300 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={s.is_active}
                          onChange={(e) => updateSocialLink(s.platform, "is_active", e.target.checked)}
                          className="rounded text-blue-600"
                        />
                        <span>{s.is_active ? "Enabled" : "Disabled"}</span>
                      </label>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      <input
                        type="text"
                        value={s.label}
                        onChange={(e) => updateSocialLink(s.platform, "label", e.target.value)}
                        placeholder="Button Label"
                        className="bg-slate-800 border border-slate-700 rounded-lg px-2.5 py-1.5 text-xs text-white"
                      />
                      <input
                        type="text"
                        value={s.url}
                        onChange={(e) => updateSocialLink(s.platform, "url", e.target.value)}
                        placeholder="https://..."
                        className="bg-slate-800 border border-slate-700 rounded-lg px-2.5 py-1.5 text-xs text-white font-mono"
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ════════════════════════════════════════════════════════════
              TAB 3: BRAND DESCRIPTION & ABOUT
             ════════════════════════════════════════════════════════════ */}
          {activeTab === "brand" && (
            <div className="bg-slate-800/80 border border-slate-700 rounded-2xl p-5 space-y-4 max-w-2xl">
              <div>
                <h3 className="text-sm font-bold text-white">Brand Information & Footer Disclaimer</h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  Update the summary text shown below the SSCZone logo in the footer.
                </p>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1">
                  Primary Brand Description
                </label>
                <textarea
                  rows={3}
                  value={config.brandDescription}
                  onChange={(e) => setConfig({ ...config, brandDescription: e.target.value })}
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl p-3 text-xs text-white focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1">
                  Secondary Sub-Text / Disclaimer
                </label>
                <textarea
                  rows={2}
                  value={config.brandSubText}
                  onChange={(e) => setConfig({ ...config, brandSubText: e.target.value })}
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl p-3 text-xs text-white focus:border-blue-500"
                />
              </div>
            </div>
          )}

          {/* ════════════════════════════════════════════════════════════
              TAB 4: LEGAL LINKS & COPYRIGHT
             ════════════════════════════════════════════════════════════ */}
          {activeTab === "legal" && (
            <div className="bg-slate-800/80 border border-slate-700 rounded-2xl p-5 space-y-4 max-w-2xl">
              <div>
                <h3 className="text-sm font-bold text-white">Copyright & Bottom Policy Links</h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  Manage Privacy Policy, Terms of Service, and Refund policy links shown at the very bottom bar.
                </p>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1">
                  Copyright Notice Text
                </label>
                <input
                  type="text"
                  value={config.copyrightText}
                  onChange={(e) => setConfig({ ...config, copyrightText: e.target.value })}
                  placeholder="e.g. SSCZone. All rights reserved."
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:border-blue-500"
                />
              </div>

              <div className="pt-3 border-t border-slate-700 space-y-3">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-slate-300">Policy Links</label>
                  <button
                    type="button"
                    onClick={addLegalLink}
                    className="text-xs font-bold text-blue-400 hover:text-blue-300 flex items-center gap-1 cursor-pointer"
                  >
                    <Plus className="w-3 h-3" />
                    <span>Add Policy Link</span>
                  </button>
                </div>

                {config.legalLinks.map((legal, idx) => (
                  <div key={idx} className="flex items-center gap-2 bg-slate-900 p-2 rounded-xl border border-slate-700">
                    <input
                      type="text"
                      value={legal.label}
                      onChange={(e) => updateLegalLink(idx, "label", e.target.value)}
                      placeholder="e.g. Privacy Policy"
                      className="flex-1 bg-slate-800 border border-slate-700 rounded-lg px-2.5 py-1 text-xs text-white"
                    />
                    <input
                      type="text"
                      value={legal.href}
                      onChange={(e) => updateLegalLink(idx, "href", e.target.value)}
                      placeholder="/privacy"
                      className="w-40 bg-slate-800 border border-slate-700 rounded-lg px-2.5 py-1 text-xs text-white font-mono"
                    />
                    <button
                      type="button"
                      onClick={() => removeLegalLink(idx)}
                      className="p-1 text-slate-400 hover:text-rose-400"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
