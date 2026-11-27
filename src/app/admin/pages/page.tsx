"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import toast from "react-hot-toast";
import {
  FileText,
  Save,
  RotateCcw,
  ExternalLink,
  ShieldCheck,
  ShieldAlert,
  Mail,
  Info,
  CreditCard,
  Sparkles,
  CheckCircle2,
  Power,
  Eye,
} from "lucide-react";
import {
  DEFAULT_STATIC_PAGES_CONFIG,
  StaticPagesConfig,
} from "@/lib/static-pages-store";

export default function AdminStaticPagesPage() {
  const [config, setConfig] = useState<StaticPagesConfig>(DEFAULT_STATIC_PAGES_CONFIG);
  const [activeTab, setActiveTab] = useState<"about" | "contact" | "privacy" | "terms" | "refund" | "disclaimer">("about");
  const [loading, setLoading] = useState<boolean>(true);
  const [saving, setSaving] = useState<boolean>(false);
  const [togglingDisclaimer, setTogglingDisclaimer] = useState<boolean>(false);

  useEffect(() => {
    fetchConfig();
  }, []);

  async function fetchConfig() {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/static-pages");
      const data = await res.json();
      if (data.success && data.config) {
        setConfig(data.config);
      }
    } catch (err: any) {
      toast.error("Failed to load static pages settings: " + err.message);
    } finally {
      setLoading(false);
    }
  }

  async function handleSave() {
    setSaving(true);
    try {
      const res = await fetch("/api/admin/static-pages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(config),
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || "Failed to save");
      }
      toast.success("Static pages content saved to Supabase site_settings!");
    } catch (err: any) {
      toast.error(err.message || "Failed to save static pages");
    } finally {
      setSaving(false);
    }
  }

  async function handleToggleDisclaimer(newEnabled: boolean) {
    setTogglingDisclaimer(true);
    const updatedConfig: StaticPagesConfig = {
      ...config,
      topDisclaimer: {
        ...(config.topDisclaimer || DEFAULT_STATIC_PAGES_CONFIG.topDisclaimer),
        enabled: newEnabled,
      },
    };
    setConfig(updatedConfig);

    try {
      const res = await fetch("/api/admin/static-pages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updatedConfig),
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || "Failed to update toggle");
      }
      if (newEnabled) {
        toast.success("Disclaimer banner turned ON (Visible on website)!");
      } else {
        toast.success("Disclaimer banner turned OFF (Hidden from website)!");
      }
    } catch (err: any) {
      toast.error("Failed to update banner toggle: " + err.message);
    } finally {
      setTogglingDisclaimer(false);
    }
  }

  function handleReset() {
    if (confirm("Reset current tab to default template? Unsaved changes will be replaced.")) {
      if (activeTab === "disclaimer") {
        setConfig((prev) => ({
          ...prev,
          topDisclaimer: DEFAULT_STATIC_PAGES_CONFIG.topDisclaimer,
        }));
      } else {
        setConfig((prev) => ({
          ...prev,
          [activeTab]: DEFAULT_STATIC_PAGES_CONFIG[activeTab],
        }));
      }
      toast.success(`Reset ${activeTab} to default content.`);
    }
  }

  const tabs = [
    { id: "about", label: "About Us", href: "/about", icon: Info },
    { id: "contact", label: "Contact Us", href: "/contact", icon: Mail },
    { id: "privacy", label: "Privacy Policy", href: "/privacy", icon: ShieldCheck },
    { id: "terms", label: "Terms of Service", href: "/terms", icon: FileText },
    { id: "refund", label: "Refund Policy", href: "/refund", icon: CreditCard },
    { id: "disclaimer", label: "Top Disclaimer Banner", href: "/", icon: ShieldAlert },
  ] as const;

  return (
    <div className="space-y-6 max-w-6xl mx-auto pb-16">
      {/* Top Header Card */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white border border-slate-200 rounded-3xl p-6 shadow-sm">
        <div>
          <div className="inline-flex items-center gap-1.5 text-xs font-black uppercase tracking-wider bg-blue-50 text-blue-700 px-3 py-1 rounded-full border border-blue-200 mb-2">
            <Sparkles className="h-3.5 w-3.5 text-blue-600" />
            <span>Site Content CMS</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
            Static & Policy Pages Editor
          </h1>
          <p className="text-xs sm:text-sm text-slate-600 mt-1 max-w-2xl">
            Update About Us, Contact information, and legal policies instantly. All changes persist automatically in Supabase <code className="text-blue-700 font-mono">site_settings</code>.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={handleReset}
            className="px-4 py-2.5 rounded-xl border border-slate-200 bg-slate-50 hover:bg-slate-100 text-slate-700 font-bold text-xs flex items-center gap-1.5 transition-colors cursor-pointer"
            title="Reset current tab to default"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Reset Tab</span>
          </button>

          <button
            onClick={handleSave}
            disabled={saving || loading}
            className="px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-black text-xs flex items-center gap-2 shadow-md transition-all cursor-pointer disabled:opacity-50"
          >
            <Save className="w-4 h-4" />
            <span>{saving ? "Saving..." : "Save All Changes"}</span>
          </button>
        </div>
      </div>

      {/* Tabs Navigation */}
      <div className="flex items-center gap-2 border-b border-slate-200 overflow-x-auto pb-1 scrollbar-none">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-4 py-3 text-xs font-bold rounded-2xl transition-all cursor-pointer whitespace-nowrap ${
                isActive
                  ? "bg-slate-900 text-white shadow-sm"
                  : "bg-white text-slate-600 hover:bg-slate-100 hover:text-slate-900 border border-slate-200"
              }`}
            >
              <Icon className={`w-4 h-4 ${isActive ? "text-amber-400" : "text-slate-400"}`} />
              <span>{tab.label}</span>
            </button>
          );
        })}

        <div className="ml-auto pl-2 shrink-0">
          <Link
            href={tabs.find((t) => t.id === activeTab)?.href || "/"}
            target="_blank"
            className="inline-flex items-center gap-1.5 text-xs font-bold text-blue-600 hover:text-blue-800 bg-blue-50 hover:bg-blue-100 border border-blue-200 px-3 py-2 rounded-xl transition-colors"
          >
            <span>View Live Page</span>
            <ExternalLink className="w-3 h-3" />
          </Link>
        </div>
      </div>

      {/* Tab 1: About Us Form */}
      {activeTab === "about" && (
        <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm space-y-6">
          <h2 className="text-base font-black text-slate-900 flex items-center gap-2">
            <Info className="w-5 h-5 text-blue-600" />
            <span>About Us Page Content (/about)</span>
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Banner Pill Badge</label>
              <input
                type="text"
                value={config.about.badgeText}
                onChange={(e) =>
                  setConfig({ ...config, about: { ...config.about, badgeText: e.target.value } })
                }
                className="w-full p-2.5 rounded-xl border border-slate-300 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Main Heading</label>
              <input
                type="text"
                value={config.about.heading}
                onChange={(e) =>
                  setConfig({ ...config, about: { ...config.about, heading: e.target.value } })
                }
                className="w-full p-2.5 rounded-xl border border-slate-300 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div className="md:col-span-2">
              <label className="block text-xs font-bold text-slate-700 mb-1">Subheading / Introduction</label>
              <textarea
                rows={2}
                value={config.about.subheading}
                onChange={(e) =>
                  setConfig({ ...config, about: { ...config.about, subheading: e.target.value } })
                }
                className="w-full p-2.5 rounded-xl border border-slate-300 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Mission Section Title</label>
              <input
                type="text"
                value={config.about.missionTitle}
                onChange={(e) =>
                  setConfig({ ...config, about: { ...config.about, missionTitle: e.target.value } })
                }
                className="w-full p-2.5 rounded-xl border border-slate-300 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Why Trust Title</label>
              <input
                type="text"
                value={config.about.whyTrustTitle}
                onChange={(e) =>
                  setConfig({ ...config, about: { ...config.about, whyTrustTitle: e.target.value } })
                }
                className="w-full p-2.5 rounded-xl border border-slate-300 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div className="md:col-span-2">
              <label className="block text-xs font-bold text-slate-700 mb-1">Mission Paragraph 1</label>
              <textarea
                rows={3}
                value={config.about.missionParagraph1}
                onChange={(e) =>
                  setConfig({ ...config, about: { ...config.about, missionParagraph1: e.target.value } })
                }
                className="w-full p-2.5 rounded-xl border border-slate-300 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div className="md:col-span-2">
              <label className="block text-xs font-bold text-slate-700 mb-1">Mission Paragraph 2</label>
              <textarea
                rows={3}
                value={config.about.missionParagraph2}
                onChange={(e) =>
                  setConfig({ ...config, about: { ...config.about, missionParagraph2: e.target.value } })
                }
                className="w-full p-2.5 rounded-xl border border-slate-300 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          <div className="border-t border-slate-200 pt-5 space-y-4">
            <h3 className="text-xs font-black uppercase text-slate-400 tracking-wider">
              3 Key Highlights / Trust Pillars
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-2xl space-y-2">
                <input
                  type="text"
                  placeholder="Feature 1 Title"
                  value={config.about.feature1Title}
                  onChange={(e) =>
                    setConfig({ ...config, about: { ...config.about, feature1Title: e.target.value } })
                  }
                  className="w-full p-2 rounded-lg border border-slate-300 text-xs font-bold bg-white"
                />
                <textarea
                  rows={3}
                  placeholder="Feature 1 Description"
                  value={config.about.feature1Desc}
                  onChange={(e) =>
                    setConfig({ ...config, about: { ...config.about, feature1Desc: e.target.value } })
                  }
                  className="w-full p-2 rounded-lg border border-slate-300 text-xs bg-white"
                />
              </div>

              <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-2xl space-y-2">
                <input
                  type="text"
                  placeholder="Feature 2 Title"
                  value={config.about.feature2Title}
                  onChange={(e) =>
                    setConfig({ ...config, about: { ...config.about, feature2Title: e.target.value } })
                  }
                  className="w-full p-2 rounded-lg border border-slate-300 text-xs font-bold bg-white"
                />
                <textarea
                  rows={3}
                  placeholder="Feature 2 Description"
                  value={config.about.feature2Desc}
                  onChange={(e) =>
                    setConfig({ ...config, about: { ...config.about, feature2Desc: e.target.value } })
                  }
                  className="w-full p-2 rounded-lg border border-slate-300 text-xs bg-white"
                />
              </div>

              <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-2xl space-y-2">
                <input
                  type="text"
                  placeholder="Feature 3 Title"
                  value={config.about.feature3Title}
                  onChange={(e) =>
                    setConfig({ ...config, about: { ...config.about, feature3Title: e.target.value } })
                  }
                  className="w-full p-2 rounded-lg border border-slate-300 text-xs font-bold bg-white"
                />
                <textarea
                  rows={3}
                  placeholder="Feature 3 Description"
                  value={config.about.feature3Desc}
                  onChange={(e) =>
                    setConfig({ ...config, about: { ...config.about, feature3Desc: e.target.value } })
                  }
                  className="w-full p-2 rounded-lg border border-slate-300 text-xs bg-white"
                />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Tab 2: Contact Details Form */}
      {activeTab === "contact" && (
        <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm space-y-6">
          <h2 className="text-base font-black text-slate-900 flex items-center gap-2">
            <Mail className="w-5 h-5 text-blue-600" />
            <span>Contact Page & Communication Details (/contact)</span>
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Banner Pill Badge</label>
              <input
                type="text"
                value={config.contact.badgeText}
                onChange={(e) =>
                  setConfig({ ...config, contact: { ...config.contact, badgeText: e.target.value } })
                }
                className="w-full p-2.5 rounded-xl border border-slate-300 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Main Heading</label>
              <input
                type="text"
                value={config.contact.heading}
                onChange={(e) =>
                  setConfig({ ...config, contact: { ...config.contact, heading: e.target.value } })
                }
                className="w-full p-2.5 rounded-xl border border-slate-300 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div className="md:col-span-2">
              <label className="block text-xs font-bold text-slate-700 mb-1">Subheading</label>
              <input
                type="text"
                value={config.contact.subheading}
                onChange={(e) =>
                  setConfig({ ...config, contact: { ...config.contact, subheading: e.target.value } })
                }
                className="w-full p-2.5 rounded-xl border border-slate-300 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Support Email Address</label>
              <input
                type="email"
                value={config.contact.supportEmail}
                onChange={(e) =>
                  setConfig({ ...config, contact: { ...config.contact, supportEmail: e.target.value } })
                }
                className="w-full p-2.5 rounded-xl border border-slate-300 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Helpline Phone Number</label>
              <input
                type="text"
                value={config.contact.phone}
                onChange={(e) =>
                  setConfig({ ...config, contact: { ...config.contact, phone: e.target.value } })
                }
                className="w-full p-2.5 rounded-xl border border-slate-300 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Telegram Channel URL</label>
              <input
                type="text"
                value={config.contact.telegramUrl}
                onChange={(e) =>
                  setConfig({ ...config, contact: { ...config.contact, telegramUrl: e.target.value } })
                }
                className="w-full p-2.5 rounded-xl border border-slate-300 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Telegram Handle / Channel Name</label>
              <input
                type="text"
                value={config.contact.telegramHandle}
                onChange={(e) =>
                  setConfig({ ...config, contact: { ...config.contact, telegramHandle: e.target.value } })
                }
                className="w-full p-2.5 rounded-xl border border-slate-300 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Support Working Hours</label>
              <input
                type="text"
                value={config.contact.workingHours}
                onChange={(e) =>
                  setConfig({ ...config, contact: { ...config.contact, workingHours: e.target.value } })
                }
                className="w-full p-2.5 rounded-xl border border-slate-300 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Expected Response Time</label>
              <input
                type="text"
                value={config.contact.responseTime}
                onChange={(e) =>
                  setConfig({ ...config, contact: { ...config.contact, responseTime: e.target.value } })
                }
                className="w-full p-2.5 rounded-xl border border-slate-300 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div className="md:col-span-2">
              <label className="block text-xs font-bold text-slate-700 mb-1">Contact Office Address</label>
              <input
                type="text"
                value={config.contact.officeAddress}
                onChange={(e) =>
                  setConfig({ ...config, contact: { ...config.contact, officeAddress: e.target.value } })
                }
                className="w-full p-2.5 rounded-xl border border-slate-300 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>
        </div>
      )}

      {/* Tab 3: Privacy Policy */}
      {activeTab === "privacy" && (
        <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm space-y-6">
          <h2 className="text-base font-black text-slate-900 flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-emerald-600" />
            <span>Privacy Policy Content (/privacy)</span>
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Page Heading</label>
              <input
                type="text"
                value={config.privacy.heading}
                onChange={(e) =>
                  setConfig({ ...config, privacy: { ...config.privacy, heading: e.target.value } })
                }
                className="w-full p-2.5 rounded-xl border border-slate-300 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Last Updated Date Tag</label>
              <input
                type="text"
                value={config.privacy.lastUpdated}
                onChange={(e) =>
                  setConfig({ ...config, privacy: { ...config.privacy, lastUpdated: e.target.value } })
                }
                className="w-full p-2.5 rounded-xl border border-slate-300 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div className="md:col-span-2">
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Policy Body (HTML or Formatted Sections)
              </label>
              <textarea
                rows={14}
                value={config.privacy.contentHtml}
                onChange={(e) =>
                  setConfig({ ...config, privacy: { ...config.privacy, contentHtml: e.target.value } })
                }
                className="w-full p-3 font-mono text-xs leading-relaxed rounded-xl border border-slate-300 bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>
        </div>
      )}

      {/* Tab 4: Terms & Conditions */}
      {activeTab === "terms" && (
        <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm space-y-6">
          <h2 className="text-base font-black text-slate-900 flex items-center gap-2">
            <FileText className="w-5 h-5 text-blue-600" />
            <span>Terms of Service Content (/terms)</span>
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Page Heading</label>
              <input
                type="text"
                value={config.terms.heading}
                onChange={(e) =>
                  setConfig({ ...config, terms: { ...config.terms, heading: e.target.value } })
                }
                className="w-full p-2.5 rounded-xl border border-slate-300 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Last Updated Date Tag</label>
              <input
                type="text"
                value={config.terms.lastUpdated}
                onChange={(e) =>
                  setConfig({ ...config, terms: { ...config.terms, lastUpdated: e.target.value } })
                }
                className="w-full p-2.5 rounded-xl border border-slate-300 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div className="md:col-span-2">
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Terms Body (HTML or Formatted Sections)
              </label>
              <textarea
                rows={14}
                value={config.terms.contentHtml}
                onChange={(e) =>
                  setConfig({ ...config, terms: { ...config.terms, contentHtml: e.target.value } })
                }
                className="w-full p-3 font-mono text-xs leading-relaxed rounded-xl border border-slate-300 bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>
        </div>
      )}

      {/* Tab 5: Refund Policy */}
      {activeTab === "refund" && (
        <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm space-y-6">
          <h2 className="text-base font-black text-slate-900 flex items-center gap-2">
            <CreditCard className="w-5 h-5 text-amber-600" />
            <span>Refund & Cancellation Policy (/refund)</span>
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Page Heading</label>
              <input
                type="text"
                value={config.refund.heading}
                onChange={(e) =>
                  setConfig({ ...config, refund: { ...config.refund, heading: e.target.value } })
                }
                className="w-full p-2.5 rounded-xl border border-slate-300 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Last Updated Date Tag</label>
              <input
                type="text"
                value={config.refund.lastUpdated}
                onChange={(e) =>
                  setConfig({ ...config, refund: { ...config.refund, lastUpdated: e.target.value } })
                }
                className="w-full p-2.5 rounded-xl border border-slate-300 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div className="md:col-span-2">
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Refund Policy Body (HTML or Formatted Sections)
              </label>
              <textarea
                rows={14}
                value={config.refund.contentHtml}
                onChange={(e) =>
                  setConfig({ ...config, refund: { ...config.refund, contentHtml: e.target.value } })
                }
                className="w-full p-3 font-mono text-xs leading-relaxed rounded-xl border border-slate-300 bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>
        </div>
      )}

      {/* Tab 6: Top Disclaimer Banner */}
      {activeTab === "disclaimer" && (
        <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-4">
            <div>
              <h2 className="text-base font-black text-slate-900 flex items-center gap-2">
                <ShieldAlert className="w-5 h-5 text-amber-500" />
                <span>Top Government Non-Affiliation Disclaimer Banner</span>
              </h2>
              <p className="text-xs text-slate-500 mt-1">
                Configure the top-of-page notice informing visitors about independent educational portal status.
              </p>
            </div>
          </div>

          {/* Toggle ON / OFF Control Card */}
          {(() => {
            const disclaimer = config.topDisclaimer || DEFAULT_STATIC_PAGES_CONFIG.topDisclaimer;
            const isEnabled = disclaimer.enabled !== false;

            return (
              <div className="space-y-6">
                <div className={`p-4 rounded-2xl border transition-all ${
                  isEnabled ? "bg-emerald-50/60 border-emerald-200" : "bg-slate-50 border-slate-200"
                }`}>
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-black uppercase tracking-wider ${
                          isEnabled
                            ? "bg-emerald-100 text-emerald-800 border border-emerald-300"
                            : "bg-slate-200 text-slate-700 border border-slate-300"
                        }`}>
                          <span className={`w-2 h-2 rounded-full ${isEnabled ? "bg-emerald-500 animate-pulse" : "bg-slate-400"}`} />
                          {isEnabled ? "Banner Active & Visible" : "Banner Disabled / Hidden"}
                        </span>
                        <span className="text-xs text-slate-500 font-medium">
                          {isEnabled ? "Displayed at the top of all pages" : "Completely hidden across website"}
                        </span>
                      </div>
                      <p className="text-xs text-slate-600">
                        Toggle this switch to instantly show or hide the top disclaimer banner across all visitor pages.
                      </p>
                    </div>

                    <button
                      type="button"
                      disabled={togglingDisclaimer}
                      onClick={() => handleToggleDisclaimer(!isEnabled)}
                      className={`px-4 py-2.5 rounded-xl font-bold text-xs flex items-center gap-2 transition-all cursor-pointer shadow-xs disabled:opacity-50 ${
                        isEnabled
                          ? "bg-white hover:bg-rose-50 text-rose-700 border border-rose-300"
                          : "bg-emerald-600 hover:bg-emerald-700 text-white shadow-emerald-600/20"
                      }`}
                    >
                      <Power className="w-3.5 h-3.5" />
                      <span>
                        {togglingDisclaimer
                          ? "Updating..."
                          : isEnabled
                          ? "Turn Banner OFF (Hide from Site)"
                          : "Turn Banner ON (Show on Site)"}
                      </span>
                    </button>
                  </div>
                </div>

                {/* Form Fields */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Pill Badge Label
                    </label>
                    <input
                      type="text"
                      value={disclaimer.badgeText || ""}
                      onChange={(e) =>
                        setConfig({
                          ...config,
                          topDisclaimer: {
                            ...disclaimer,
                            badgeText: e.target.value,
                          },
                        })
                      }
                      placeholder="Disclaimer"
                      className="w-full p-2.5 rounded-xl border border-slate-300 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                    <p className="text-[11px] text-slate-500 mt-1">Short badge label, e.g. "Disclaimer"</p>
                  </div>

                  <div className="md:col-span-2">
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Disclaimer Text (English Notice)
                    </label>
                    <textarea
                      rows={3}
                      value={disclaimer.text || ""}
                      onChange={(e) =>
                        setConfig({
                          ...config,
                          topDisclaimer: {
                            ...disclaimer,
                            text: e.target.value,
                          },
                        })
                      }
                      placeholder="This website & app is an independent educational portal..."
                      className="w-full p-2.5 rounded-xl border border-slate-300 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-blue-500 leading-relaxed"
                    />
                    <p className="text-[11px] text-slate-500 mt-1">
                      Clear non-affiliation statement (kept clean in English without Hindi text).
                    </p>
                  </div>
                </div>

                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-1 border-t border-slate-100">
                  <span className="text-[11px] text-slate-500">
                    Badge and text changes will take effect across all visitor pages upon clicking Save.
                  </span>
                  <button
                    type="button"
                    onClick={handleSave}
                    disabled={saving}
                    className="self-end sm:self-auto px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs flex items-center gap-1.5 shadow-sm transition-all cursor-pointer disabled:opacity-50"
                  >
                    <Save className="w-3.5 h-3.5" />
                    <span>{saving ? "Saving Changes..." : "Save Disclaimer Text"}</span>
                  </button>
                </div>

                {/* Live Preview Card */}
                <div className="space-y-2 pt-2">
                  <div className="flex items-center gap-1.5 text-xs font-bold text-slate-700">
                    <Eye className="w-4 h-4 text-blue-600" />
                    <span>Real-time Live Preview</span>
                  </div>

                  {isEnabled ? (
                    <div className="rounded-2xl border border-slate-300 overflow-hidden shadow-xs bg-slate-50 p-2">
                      <div className="text-[10px] font-mono text-slate-400 uppercase tracking-widest px-2 py-1">
                        Top of screen preview:
                      </div>
                      <div className="bg-white text-slate-600 border border-slate-200/90 py-2 px-3 sm:px-6 rounded-xl shadow-2xs">
                        <div className="max-w-7xl mx-auto flex items-center justify-center gap-2 text-center text-xs leading-normal font-medium">
                          <ShieldAlert className="w-4 h-4 text-amber-500 shrink-0" />
                          <span className="font-bold text-[10px] sm:text-[11px] uppercase tracking-wider bg-slate-100 text-slate-700 px-2 py-0.5 rounded-full border border-slate-200 shrink-0">
                            {disclaimer.badgeText || "Disclaimer"}
                          </span>
                          <span className="line-clamp-2 text-slate-600 text-xs">
                            {disclaimer.text}
                          </span>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="rounded-2xl border border-dashed border-slate-300 bg-slate-50 p-6 text-center text-xs text-slate-500 italic">
                      Disclaimer banner is currently <b className="text-rose-600 font-semibold">OFF / Disabled</b>. It will not be rendered on the website header.
                    </div>
                  )}
                </div>
              </div>
            );
          })()}
        </div>
      )}
    </div>
  );
}
