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
  Code
} from "lucide-react";
import toast from "react-hot-toast";

interface AdSettings {
  enabledGlobally: boolean;
  publisherId: string;
  autoAdsEnabled: boolean;
  slots: {
    headerLeaderboard: { enabled: boolean; slotId: string };
    inDrillSolution: { enabled: boolean; slotId: string };
    set25Scorecard: { enabled: boolean; slotId: string };
    sidebarBanner: { enabled: boolean; slotId: string };
    mobileStickyFooter: { enabled: boolean; slotId: string };
  };
  customAdHtml: string;
}

const DEFAULT_SETTINGS: AdSettings = {
  enabledGlobally: false,
  publisherId: "ca-pub-XXXXXXXXXXXXXXXX",
  autoAdsEnabled: true,
  slots: {
    headerLeaderboard: { enabled: true, slotId: "1234567890" },
    inDrillSolution: { enabled: true, slotId: "2345678901" },
    set25Scorecard: { enabled: true, slotId: "3456789012" },
    sidebarBanner: { enabled: false, slotId: "4567890123" },
    mobileStickyFooter: { enabled: false, slotId: "5678901234" },
  },
  customAdHtml: ""
};

export default function AdminAdsPage() {
  const [settings, setSettings] = useState<AdSettings>(DEFAULT_SETTINGS);
  const [saving, setSaving] = useState(false);
  const [activePreviewDevice, setActivePreviewDevice] = useState<"desktop" | "mobile">("desktop");

  useEffect(() => {
    try {
      const saved = localStorage.getItem("ssczone_ad_settings");
      if (saved) {
        setSettings(JSON.parse(saved));
      }
    } catch (e) {
      console.error("Failed to load ad settings:", e);
    }
  }, []);

  function handleSave() {
    setSaving(true);
    try {
      localStorage.setItem("ssczone_ad_settings", JSON.stringify(settings));
      setTimeout(() => {
        setSaving(false);
        toast.success("Ad placement settings saved successfully! 🚀", {
          icon: "💰",
          style: { borderRadius: "12px", background: "#065f46", color: "#fff" }
        });
      }, 400);
    } catch (e) {
      setSaving(false);
      toast.error("Failed to save settings");
    }
  }

  return (
    <div className="space-y-6 max-w-6xl pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-gray-200 pb-5">
        <div>
          <h1 className="text-2xl font-black text-gray-900 flex items-center gap-2">
            <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-100 text-emerald-700">
              <DollarSign className="h-5 w-5" />
            </span>
            <span>Ads &amp; Monetization Manager</span>
          </h1>
          <p className="text-xs text-gray-500 mt-1">
            Configure Google AdSense publisher ID, ad slot placements, and customize banner positions across the website.
          </p>
        </div>

        <button
          onClick={handleSave}
          disabled={saving}
          className="flex items-center justify-center gap-2 rounded-xl bg-emerald-600 px-6 py-2.5 text-xs sm:text-sm font-black text-white shadow-md hover:bg-emerald-700 active:scale-98 transition-all disabled:opacity-50 cursor-pointer"
        >
          <Save className="h-4 w-4" />
          <span>{saving ? "Saving Changes..." : "Save Ad Placements"}</span>
        </button>
      </div>

      {/* Master Global Switch */}
      <div className={`rounded-2xl border p-5 sm:p-6 transition-all ${
        settings.enabledGlobally
          ? "border-emerald-300 bg-emerald-50/50 shadow-xs"
          : "border-gray-200 bg-white"
      }`}>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className={`h-3 w-3 rounded-full ${settings.enabledGlobally ? "bg-emerald-500 animate-ping" : "bg-gray-300"}`} />
              <h3 className="text-base font-black text-gray-900">
                Global Monetization &amp; Ads Master Switch
              </h3>
            </div>
            <p className="text-xs text-gray-600">
              Turn ON to activate all enabled ad slots across SSCZone. Turn OFF to instantly pause all ads website-wide.
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
                <span>ADS ACTIVE (LIVE)</span>
              </>
            ) : (
              <>
                <ToggleLeft className="h-5 w-5" />
                <span>ADS PAUSED (OFF)</span>
              </>
            )}
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Publisher ID & Slot Configurations (7 Columns) */}
        <div className="lg:col-span-7 space-y-5">
          {/* AdSense Publisher Configuration */}
          <div className="rounded-2xl border border-gray-200 bg-white p-5 sm:p-6 shadow-xs space-y-4">
            <h3 className="text-sm font-black text-gray-900 uppercase tracking-wider flex items-center gap-2">
              <Sparkles className="h-4 w-4 text-blue-600" />
              <span>Google AdSense Account Credentials</span>
            </h3>

            <div className="space-y-3">
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">
                  Publisher ID (Client ID)
                </label>
                <input
                  type="text"
                  value={settings.publisherId}
                  onChange={(e) => setSettings((prev) => ({ ...prev, publisherId: e.target.value }))}
                  placeholder="e.g. ca-pub-1234567890123456"
                  className="w-full rounded-xl border border-gray-200 bg-gray-50/50 p-2.5 text-xs font-semibold text-gray-900 focus:border-blue-500 focus:bg-white focus:outline-hidden"
                />
                <p className="text-[11px] text-gray-500 mt-1">
                  You can find this in your Google AdSense Dashboard &gt; Account &gt; Settings &gt; Publisher ID.
                </p>
              </div>

              <div className="flex items-center justify-between pt-2 border-t border-gray-100">
                <div>
                  <span className="block text-xs font-bold text-gray-800">Enable Google Auto-Ads</span>
                  <span className="text-[11px] text-gray-500">Allow Google AI to automatically place high-performing ads.</span>
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

          {/* Ad Placement Slots Configuration */}
          <div className="rounded-2xl border border-gray-200 bg-white p-5 sm:p-6 shadow-xs space-y-4">
            <h3 className="text-sm font-black text-gray-900 uppercase tracking-wider flex items-center gap-2">
              <Layers className="h-4 w-4 text-indigo-600" />
              <span>Individual Ad Slot Placements</span>
            </h3>

            <div className="space-y-4 divide-y divide-gray-100">
              {/* Slot 1: Header Leaderboard */}
              <div className="pt-3 first:pt-0 space-y-2">
                <div className="flex items-center justify-between">
                  <div>
                    <span className="text-xs font-black text-gray-900">1. Top Header Leaderboard Ad</span>
                    <p className="text-[11px] text-gray-500">Displayed at the top of the chapter practice area.</p>
                  </div>
                  <input
                    type="checkbox"
                    checked={settings.slots.headerLeaderboard.enabled}
                    onChange={(e) =>
                      setSettings((prev) => ({
                        ...prev,
                        slots: {
                          ...prev.slots,
                          headerLeaderboard: { ...prev.slots.headerLeaderboard, enabled: e.target.checked }
                        }
                      }))
                    }
                    className="h-4 w-4 rounded-md border-gray-300 text-blue-600 focus:ring-blue-500 cursor-pointer"
                  />
                </div>
                {settings.slots.headerLeaderboard.enabled && (
                  <input
                    type="text"
                    value={settings.slots.headerLeaderboard.slotId}
                    onChange={(e) =>
                      setSettings((prev) => ({
                        ...prev,
                        slots: {
                          ...prev.slots,
                          headerLeaderboard: { ...prev.slots.headerLeaderboard, slotId: e.target.value }
                        }
                      }))
                    }
                    placeholder="Ad Slot ID (e.g. 1234567890)"
                    className="w-full rounded-xl border border-gray-200 bg-gray-50 p-2 text-xs font-medium"
                  />
                )}
              </div>

              {/* Slot 2: In-Drill Solution Ad */}
              <div className="pt-3 space-y-2">
                <div className="flex items-center justify-between">
                  <div>
                    <span className="text-xs font-black text-gray-900">2. In-Drill Solution Ad (1-by-1 Mode)</span>
                    <p className="text-[11px] text-gray-500">Displayed right below the step-by-step solution box.</p>
                  </div>
                  <input
                    type="checkbox"
                    checked={settings.slots.inDrillSolution.enabled}
                    onChange={(e) =>
                      setSettings((prev) => ({
                        ...prev,
                        slots: {
                          ...prev.slots,
                          inDrillSolution: { ...prev.slots.inDrillSolution, enabled: e.target.checked }
                        }
                      }))
                    }
                    className="h-4 w-4 rounded-md border-gray-300 text-blue-600 focus:ring-blue-500 cursor-pointer"
                  />
                </div>
                {settings.slots.inDrillSolution.enabled && (
                  <input
                    type="text"
                    value={settings.slots.inDrillSolution.slotId}
                    onChange={(e) =>
                      setSettings((prev) => ({
                        ...prev,
                        slots: {
                          ...prev.slots,
                          inDrillSolution: { ...prev.slots.inDrillSolution, slotId: e.target.value }
                        }
                      }))
                    }
                    placeholder="Ad Slot ID"
                    className="w-full rounded-xl border border-gray-200 bg-gray-50 p-2 text-xs font-medium"
                  />
                )}
              </div>

              {/* Slot 3: 25-Question Set Scorecard Bottom Ad */}
              <div className="pt-3 space-y-2">
                <div className="flex items-center justify-between">
                  <div>
                    <span className="text-xs font-black text-gray-900">3. 25-Question Set Result Ad</span>
                    <p className="text-[11px] text-gray-500">Displayed after student submits 25-question test scorecard.</p>
                  </div>
                  <input
                    type="checkbox"
                    checked={settings.slots.set25Scorecard.enabled}
                    onChange={(e) =>
                      setSettings((prev) => ({
                        ...prev,
                        slots: {
                          ...prev.slots,
                          set25Scorecard: { ...prev.slots.set25Scorecard, enabled: e.target.checked }
                        }
                      }))
                    }
                    className="h-4 w-4 rounded-md border-gray-300 text-blue-600 focus:ring-blue-500 cursor-pointer"
                  />
                </div>
                {settings.slots.set25Scorecard.enabled && (
                  <input
                    type="text"
                    value={settings.slots.set25Scorecard.slotId}
                    onChange={(e) =>
                      setSettings((prev) => ({
                        ...prev,
                        slots: {
                          ...prev.slots,
                          set25Scorecard: { ...prev.slots.set25Scorecard, slotId: e.target.value }
                        }
                      }))
                    }
                    placeholder="Ad Slot ID"
                    className="w-full rounded-xl border border-gray-200 bg-gray-50 p-2 text-xs font-medium"
                  />
                )}
              </div>

              {/* Slot 4: Sidebar Syllabus Banner */}
              <div className="pt-3 space-y-2">
                <div className="flex items-center justify-between">
                  <div>
                    <span className="text-xs font-black text-gray-900">4. Sidebar Syllabus Sticky Ad</span>
                    <p className="text-[11px] text-gray-500">Displayed in left syllabus navigation column.</p>
                  </div>
                  <input
                    type="checkbox"
                    checked={settings.slots.sidebarBanner.enabled}
                    onChange={(e) =>
                      setSettings((prev) => ({
                        ...prev,
                        slots: {
                          ...prev.slots,
                          sidebarBanner: { ...prev.slots.sidebarBanner, enabled: e.target.checked }
                        }
                      }))
                    }
                    className="h-4 w-4 rounded-md border-gray-300 text-blue-600 focus:ring-blue-500 cursor-pointer"
                  />
                </div>
                {settings.slots.sidebarBanner.enabled && (
                  <input
                    type="text"
                    value={settings.slots.sidebarBanner.slotId}
                    onChange={(e) =>
                      setSettings((prev) => ({
                        ...prev,
                        slots: {
                          ...prev.slots,
                          sidebarBanner: { ...prev.slots.sidebarBanner, slotId: e.target.value }
                        }
                      }))
                    }
                    placeholder="Ad Slot ID"
                    className="w-full rounded-xl border border-gray-200 bg-gray-50 p-2 text-xs font-medium"
                  />
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Live Visual Ad Preview (5 Columns) */}
        <div className="lg:col-span-5 space-y-5">
          <div className="rounded-2xl border border-gray-200 bg-white p-5 sm:p-6 shadow-xs space-y-4 sticky top-20">
            <div className="flex items-center justify-between border-b border-gray-100 pb-3">
              <h3 className="text-sm font-black text-gray-900 flex items-center gap-1.5">
                <Eye className="h-4 w-4 text-blue-600" />
                <span>Live Ad Preview</span>
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

            {/* Preview Canvas */}
            <div className={`rounded-xl border border-dashed border-gray-300 bg-gray-50 p-4 mx-auto transition-all ${
              activePreviewDevice === "mobile" ? "max-w-xs" : "w-full"
            }`}>
              <div className="text-[10px] font-bold text-gray-400 uppercase tracking-widest text-center mb-2">
                Sample Placement Preview
              </div>

              {/* Sample Google Ad Card */}
              <div className="overflow-hidden rounded-xl border border-amber-300 bg-amber-50/60 p-3 shadow-2xs space-y-2">
                <div className="flex items-center justify-between text-[9px] font-bold text-amber-800 border-b border-amber-200 pb-1">
                  <span>Ad by Google</span>
                  <span className="flex items-center gap-0.5">AdChoices <Info className="h-2.5 w-2.5 text-blue-600" /></span>
                </div>

                <div className="bg-white p-3 rounded-lg border border-amber-200 space-y-2">
                  <div className="flex items-center gap-2">
                    <div className="h-8 w-8 rounded-lg bg-blue-600 text-white flex items-center justify-center font-black text-xs shrink-0">
                      AD
                    </div>
                    <div>
                      <div className="text-xs font-bold text-gray-900 leading-tight">
                        SSC CGL Tier 1 Mock Test Series 2026
                      </div>
                      <div className="text-[10px] text-gray-500">www.example.com/ssc-test</div>
                    </div>
                  </div>

                  <button className="w-full rounded-lg bg-amber-500 py-1.5 text-center text-[11px] font-extrabold text-gray-950 shadow-2xs">
                    Start Free Mock ➔
                  </button>
                </div>
              </div>
            </div>

            <div className="rounded-xl bg-blue-50/80 p-3.5 border border-blue-100 text-xs text-blue-900 space-y-1.5">
              <div className="font-extrabold flex items-center gap-1.5">
                <Info className="h-4 w-4 text-blue-700 shrink-0" />
                <span>AdSense Policy Tip:</span>
              </div>
              <p className="text-[11px] text-blue-800 leading-relaxed">
                Keep maximum 2 to 3 ad units per page for optimal student experience and maximum revenue without triggering Google AdSense layout violations.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
