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
  ShoppingBag
} from "lucide-react";
import toast from "react-hot-toast";
import { SiteAdsConfig, AdSlotConfig, DEFAULT_ADS_CONFIG } from "@/lib/ads-types";

export default function AdminAdsPage() {
  const [settings, setSettings] = useState<SiteAdsConfig>(DEFAULT_ADS_CONFIG);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [activePreviewDevice, setActivePreviewDevice] = useState<"desktop" | "mobile">("desktop");
  const [activeSlotKey, setActiveSlotKey] = useState<string>("headerLeaderboard");

  // Load from API
  useEffect(() => {
    fetch("/api/admin/ads")
      .then((res) => res.json())
      .then((data) => {
        if (data.success && data.config) {
          setSettings(data.config);
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
        toast.success("Ad & Affiliate settings saved & synced! 🚀", {
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

  function updateAffiliate(slotKey: string, updates: any) {
    const curSlot = settings.slots[slotKey];
    const curAff = curSlot.affiliateBanner || {
      id: `aff_${slotKey}`,
      title: "",
      subtitle: "",
      badge: "",
      imageUrl: "",
      targetUrl: "",
      ctaText: "Check Deal ➔",
      relSponsored: true,
    };

    updateSlot(slotKey, {
      affiliateBanner: {
        ...curAff,
        ...updates,
      },
    });
  }

  const currentSlot = settings.slots[activeSlotKey] || Object.values(settings.slots)[0];

  return (
    <div className="space-y-6 max-w-6xl pb-16">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-5">
        <div>
          <h1 className="text-2xl font-black text-white flex items-center gap-2">
            <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-600/20 text-emerald-400 border border-emerald-500/30">
              <DollarSign className="h-5 w-5" />
            </span>
            <span>Ad Banners &amp; Affiliate Engine</span>
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Control Google AdSense slot IDs, Book discounts, and Testbook/affiliate banners without code changes. Synced with Supabase.
          </p>
        </div>

        <button
          onClick={handleSave}
          disabled={saving}
          className="flex items-center justify-center gap-2 rounded-xl bg-emerald-600 px-6 py-2.5 text-xs sm:text-sm font-black text-white shadow-md hover:bg-emerald-700 active:scale-98 transition-all disabled:opacity-50 cursor-pointer"
        >
          {saving ? <RefreshCw className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
          <span>{saving ? "Saving Changes..." : "Save Ad & Affiliate Settings"}</span>
        </button>
      </div>

      {/* Master Global Switch */}
      <div
        className={`rounded-2xl border p-5 sm:p-6 transition-all ${
          settings.enabledGlobally
            ? "border-emerald-300 bg-emerald-50/70 shadow-xs"
            : "border-gray-200 bg-white"
        }`}
      >
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span
                className={`h-3 w-3 rounded-full ${
                  settings.enabledGlobally ? "bg-emerald-500 animate-ping" : "bg-gray-300"
                }`}
              />
              <h3 className="text-base font-black text-gray-900">
                Global Monetization &amp; Ads Master Switch
              </h3>
            </div>
            <p className="text-xs text-gray-600">
              Turn ON to activate all enabled ad slots &amp; affiliate banners across SSCZone. Turn OFF to instantly pause all monetization website-wide.
            </p>
          </div>

          <button
            onClick={() => setSettings((prev) => ({ ...prev, enabledGlobally: !prev.enabledGlobally }))}
            className={`flex items-center gap-2 rounded-xl px-5 py-2.5 text-xs font-black shadow-xs transition-all cursor-pointer ${
              settings.enabledGlobally
                ? "bg-emerald-600 text-white hover:bg-emerald-700"
                : "bg-gray-200 text-gray-700 hover:bg-gray-300"
            }`}
          >
            {settings.enabledGlobally ? (
              <>
                <ToggleRight className="h-5 w-5" />
                <span>ADS &amp; AFFILIATES ACTIVE (LIVE)</span>
              </>
            ) : (
              <>
                <ToggleLeft className="h-5 w-5" />
                <span>ALL MONETIZATION PAUSED (OFF)</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left: Slot Tabs & Settings (7 Cols) */}
        <div className="lg:col-span-7 space-y-5">
          {/* AdSense Credentials Card */}
          <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-xs space-y-3">
            <h3 className="text-xs font-black text-gray-900 uppercase tracking-wider flex items-center gap-2">
              <Sparkles className="h-4 w-4 text-blue-600" />
              <span>Google AdSense Configuration</span>
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
              <div>
                <label className="block text-[11px] font-bold text-gray-700 mb-1">
                  Publisher Client ID
                </label>
                <input
                  type="text"
                  value={settings.publisherId}
                  onChange={(e) => setSettings((prev) => ({ ...prev, publisherId: e.target.value }))}
                  placeholder="ca-pub-XXXXXXXXXXXXXXXX"
                  className="w-full rounded-xl border border-gray-200 bg-gray-50/50 p-2 text-xs font-semibold text-gray-900 focus:border-blue-500 focus:bg-white focus:outline-hidden"
                />
              </div>

              <div className="flex items-center justify-between sm:justify-center gap-3 pt-5 sm:pt-4">
                <div>
                  <span className="block text-xs font-bold text-gray-800">Auto Ads</span>
                  <span className="text-[10px] text-gray-500">Google AI automated ads</span>
                </div>
                <input
                  type="checkbox"
                  checked={settings.autoAdsEnabled}
                  onChange={(e) => setSettings((prev) => ({ ...prev, autoAdsEnabled: e.target.checked }))}
                  className="h-4 w-4 rounded-md border-gray-300 text-blue-600 focus:ring-blue-500 cursor-pointer"
                />
              </div>
            </div>
          </div>

          {/* Slot Tabs */}
          <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
            {Object.entries(settings.slots).map(([key, slot]) => (
              <button
                key={key}
                onClick={() => setActiveSlotKey(key)}
                className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all cursor-pointer ${
                  activeSlotKey === key
                    ? "bg-slate-900 text-white shadow-xs"
                    : "bg-white border border-gray-200 text-gray-700 hover:bg-gray-50"
                }`}
              >
                <span className={`h-2 w-2 rounded-full ${slot.enabled ? "bg-emerald-500" : "bg-gray-300"}`} />
                <span>{slot.name}</span>
              </button>
            ))}
          </div>

          {/* Current Slot Editor */}
          {currentSlot && (
            <div className="rounded-2xl border border-gray-200 bg-white p-5 sm:p-6 shadow-xs space-y-5">
              <div className="flex items-center justify-between border-b border-gray-100 pb-3">
                <div>
                  <h3 className="text-sm font-black text-gray-900 flex items-center gap-2">
                    <Layers className="h-4 w-4 text-indigo-600" />
                    <span>Slot: {currentSlot.name}</span>
                  </h3>
                  <p className="text-[11px] text-gray-500 mt-0.5">{currentSlot.description}</p>
                </div>

                <div className="flex items-center gap-2">
                  <span className="text-[11px] font-bold text-gray-600">
                    {currentSlot.enabled ? "Active" : "Disabled"}
                  </span>
                  <input
                    type="checkbox"
                    checked={currentSlot.enabled}
                    onChange={(e) => updateSlot(activeSlotKey, { enabled: e.target.checked })}
                    className="h-4 w-4 rounded-md border-gray-300 text-emerald-600 focus:ring-emerald-500 cursor-pointer"
                  />
                </div>
              </div>

              {/* Slot Mode Selection */}
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-2">
                  Placement Type
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {[
                    { type: "affiliate", label: "Affiliate Banner", desc: "Book / Test Pass banner" },
                    { type: "adsense", label: "Google AdSense", desc: "Ad unit slot ID" },
                    { type: "html", label: "Custom HTML", desc: "Embed custom code" },
                  ].map((opt) => (
                    <button
                      key={opt.type}
                      type="button"
                      onClick={() => updateSlot(activeSlotKey, { type: opt.type as any })}
                      className={`p-3 rounded-xl border text-left transition-all cursor-pointer ${
                        currentSlot.type === opt.type
                          ? "border-blue-600 bg-blue-50/60 ring-2 ring-blue-500/20"
                          : "border-gray-200 hover:bg-gray-50"
                      }`}
                    >
                      <div className="text-xs font-black text-gray-900">{opt.label}</div>
                      <div className="text-[10px] text-gray-500">{opt.desc}</div>
                    </button>
                  ))}
                </div>
              </div>

              {/* If Affiliate Banner */}
              {currentSlot.type === "affiliate" && (
                <div className="space-y-3.5 pt-2 border-t border-gray-100">
                  <div className="flex items-center gap-1.5 text-xs font-black text-amber-900">
                    <ShoppingBag className="h-4 w-4 text-amber-600" />
                    <span>Affiliate Banner Configuration</span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[11px] font-bold text-gray-700 mb-1">
                        Campaign Title
                      </label>
                      <input
                        type="text"
                        value={currentSlot.affiliateBanner?.title || ""}
                        onChange={(e) => updateAffiliate(activeSlotKey, { title: e.target.value })}
                        placeholder="e.g. Testbook Pass Pro or Book Title"
                        className="w-full rounded-xl border border-gray-200 bg-gray-50 p-2.5 text-xs font-medium focus:bg-white focus:outline-hidden"
                      />
                    </div>

                    <div>
                      <label className="block text-[11px] font-bold text-gray-700 mb-1">
                        Offer Badge (Tag)
                      </label>
                      <input
                        type="text"
                        value={currentSlot.affiliateBanner?.badge || ""}
                        onChange={(e) => updateAffiliate(activeSlotKey, { badge: e.target.value })}
                        placeholder="e.g. Flat 50% Off / Topper Pick"
                        className="w-full rounded-xl border border-gray-200 bg-gray-50 p-2.5 text-xs font-medium focus:bg-white focus:outline-hidden"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-gray-700 mb-1">
                      Subtitle / Feature Hook
                    </label>
                    <input
                      type="text"
                      value={currentSlot.affiliateBanner?.subtitle || ""}
                      onChange={(e) => updateAffiliate(activeSlotKey, { subtitle: e.target.value })}
                      placeholder="e.g. 700+ Full-Length Mock Tests & Live Sectional Rank"
                      className="w-full rounded-xl border border-gray-200 bg-gray-50 p-2.5 text-xs font-medium focus:bg-white focus:outline-hidden"
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[11px] font-bold text-gray-700 mb-1">
                        Banner Image URL
                      </label>
                      <input
                        type="url"
                        value={currentSlot.affiliateBanner?.imageUrl || ""}
                        onChange={(e) => updateAffiliate(activeSlotKey, { imageUrl: e.target.value })}
                        placeholder="https://... image URL"
                        className="w-full rounded-xl border border-gray-200 bg-gray-50 p-2.5 text-xs font-medium focus:bg-white focus:outline-hidden"
                      />
                    </div>

                    <div>
                      <label className="block text-[11px] font-bold text-gray-700 mb-1">
                        Affiliate Destination URL
                      </label>
                      <input
                        type="url"
                        value={currentSlot.affiliateBanner?.targetUrl || ""}
                        onChange={(e) => updateAffiliate(activeSlotKey, { targetUrl: e.target.value })}
                        placeholder="https://affiliate-link.com?tag=..."
                        className="w-full rounded-xl border border-gray-200 bg-gray-50 p-2.5 text-xs font-medium focus:bg-white focus:outline-hidden"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[11px] font-bold text-gray-700 mb-1">
                        Button CTA Text
                      </label>
                      <input
                        type="text"
                        value={currentSlot.affiliateBanner?.ctaText || ""}
                        onChange={(e) => updateAffiliate(activeSlotKey, { ctaText: e.target.value })}
                        placeholder="Enroll at Discount ➔"
                        className="w-full rounded-xl border border-gray-200 bg-gray-50 p-2.5 text-xs font-medium focus:bg-white focus:outline-hidden"
                      />
                    </div>

                    <div className="flex items-center gap-2 pt-5">
                      <input
                        type="checkbox"
                        checked={currentSlot.affiliateBanner?.relSponsored !== false}
                        onChange={(e) => updateAffiliate(activeSlotKey, { relSponsored: e.target.checked })}
                        className="h-4 w-4 rounded-md border-gray-300 text-blue-600 focus:ring-blue-500 cursor-pointer"
                      />
                      <span className="text-[11px] font-medium text-gray-700">
                        Add <code className="bg-gray-100 px-1 py-0.5 rounded text-blue-600">rel="sponsored"</code> for Google SEO safety
                      </span>
                    </div>
                  </div>
                </div>
              )}

              {/* If Google AdSense */}
              {currentSlot.type === "adsense" && (
                <div className="space-y-3 pt-2 border-t border-gray-100">
                  <label className="block text-xs font-bold text-gray-700 mb-1">
                    Google AdSense Ad Slot ID
                  </label>
                  <input
                    type="text"
                    value={currentSlot.adsenseSlotId || ""}
                    onChange={(e) => updateSlot(activeSlotKey, { adsenseSlotId: e.target.value })}
                    placeholder="e.g. 1234567890"
                    className="w-full rounded-xl border border-gray-200 bg-gray-50 p-2.5 text-xs font-medium focus:bg-white focus:outline-hidden"
                  />
                  <p className="text-[11px] text-gray-500">
                    Found in AdSense Dashboard &gt; Ads &gt; By ad unit &gt; Slot ID.
                  </p>
                </div>
              )}

              {/* If Custom HTML */}
              {currentSlot.type === "html" && (
                <div className="space-y-3 pt-2 border-t border-gray-100">
                  <label className="block text-xs font-bold text-gray-700 mb-1">
                    Custom Embed / HTML Code
                  </label>
                  <textarea
                    rows={4}
                    value={currentSlot.customHtml || ""}
                    onChange={(e) => updateSlot(activeSlotKey, { customHtml: e.target.value })}
                    placeholder="<a href='...'><img src='...' /></a>"
                    className="w-full rounded-xl border border-gray-200 bg-gray-50 p-2.5 text-xs font-mono focus:bg-white focus:outline-hidden"
                  />
                </div>
              )}
            </div>
          )}
        </div>

        {/* Right: Live Visual Ad Preview (5 Cols) */}
        <div className="lg:col-span-5 space-y-5">
          <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-xs space-y-4 sticky top-20">
            <div className="flex items-center justify-between border-b border-gray-100 pb-3">
              <h3 className="text-sm font-black text-gray-900 flex items-center gap-1.5">
                <Eye className="h-4 w-4 text-blue-600" />
                <span>Live Slot Preview</span>
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

            {/* Preview Box */}
            <div
              className={`rounded-xl border border-dashed border-gray-300 bg-gray-50 p-3 mx-auto transition-all ${
                activePreviewDevice === "mobile" ? "max-w-xs" : "w-full"
              }`}
            >
              <div className="text-[10px] font-bold text-gray-400 uppercase tracking-widest text-center mb-2">
                Preview: {currentSlot?.name}
              </div>

              {!settings.enabledGlobally ? (
                <div className="rounded-xl border border-gray-300 bg-gray-100 p-6 text-center text-xs text-gray-500">
                  Global Ads Switch is OFF. Nothing will be shown.
                </div>
              ) : !currentSlot?.enabled ? (
                <div className="rounded-xl border border-gray-300 bg-gray-100 p-6 text-center text-xs text-gray-500">
                  This slot is currently DISABLED.
                </div>
              ) : currentSlot.type === "affiliate" && currentSlot.affiliateBanner ? (
                <div className="w-full overflow-hidden rounded-xl border border-amber-200 bg-gradient-to-r from-amber-50 via-orange-50/50 to-amber-100/60 p-3 shadow-2xs space-y-2">
                  <div className="flex items-center gap-2.5">
                    {currentSlot.affiliateBanner.imageUrl && (
                      <div className="h-12 w-12 rounded-lg border border-amber-200 bg-white overflow-hidden shrink-0">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={currentSlot.affiliateBanner.imageUrl}
                          alt=""
                          className="h-full w-full object-cover"
                        />
                      </div>
                    )}
                    <div className="flex-1 min-w-0">
                      {currentSlot.affiliateBanner.badge && (
                        <span className="inline-block rounded-sm bg-amber-500/20 px-1.5 py-0.2 text-[9px] font-black uppercase tracking-wider text-amber-800 border border-amber-300/60 mb-0.5">
                          {currentSlot.affiliateBanner.badge}
                        </span>
                      )}
                      <div className="text-xs font-bold text-gray-900 truncate">
                        {currentSlot.affiliateBanner.title || "Offer Title"}
                      </div>
                      <div className="text-[10px] text-gray-600 line-clamp-1">
                        {currentSlot.affiliateBanner.subtitle || "Offer Subtitle"}
                      </div>
                    </div>
                  </div>

                  <button className="w-full rounded-lg bg-gradient-to-r from-amber-500 to-orange-500 py-1.5 text-center text-[11px] font-extrabold text-slate-950 shadow-2xs">
                    {currentSlot.affiliateBanner.ctaText || "Check Offer ➔"}
                  </button>
                </div>
              ) : currentSlot.type === "adsense" ? (
                <div className="overflow-hidden rounded-xl border border-blue-200 bg-blue-50/50 p-4 text-center space-y-1">
                  <div className="text-[9px] font-bold text-blue-800 uppercase">Google AdSense Slot</div>
                  <div className="text-xs font-bold text-blue-950">Slot ID: {currentSlot.adsenseSlotId || "None"}</div>
                  <div className="text-[10px] text-blue-600">Publisher: {settings.publisherId}</div>
                </div>
              ) : (
                <div className="overflow-hidden rounded-xl border border-gray-200 bg-white p-3 text-xs font-mono text-gray-600">
                  {currentSlot.customHtml || "No custom HTML provided"}
                </div>
              )}
            </div>

            <div className="rounded-xl bg-emerald-50/80 p-3.5 border border-emerald-200 text-xs text-emerald-900 space-y-1.5">
              <div className="font-extrabold flex items-center gap-1.5">
                <CheckCircle2 className="h-4 w-4 text-emerald-700 shrink-0" />
                <span>Zero-Code Affiliate Control:</span>
              </div>
              <p className="text-[11px] text-emerald-800 leading-relaxed">
                Add your Amazon affiliate links or Testbook commission links directly. If you want to switch to Google AdSense later, just toggle the radio option!
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
