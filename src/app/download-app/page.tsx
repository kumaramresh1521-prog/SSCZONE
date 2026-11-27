import type { Metadata } from "next";
import Link from "next/link";
import {
  Download,
  Smartphone,
  ShieldCheck,
  BookOpen,
  FileSpreadsheet,
  Zap,
  Target,
  BarChart3,
  Cloud,
  HelpCircle,
  ArrowRight,
  Layers,
  Sparkles,
} from "lucide-react";
import { getMobileAppReleaseInfo } from "@/lib/mobile-app-release";
import AppScreenshotsGallery from "@/components/AppScreenshotsGallery";
import ShareCopyButton from "./ShareCopyButton";

export const revalidate = 300;

export const metadata: Metadata = {
  title: "Download SSCZone Android App (APK) | SSC CGL, CHSL & PYQ Practice",
  description:
    "Download the official SSCZone Android App APK. Practice 125+ SSC PYQ shift papers, 20,480+ chapter MCQs, speed tests, daily free quizzes, and cloud-synced syllabus tracker.",
  keywords: [
    "SSCZone APK",
    "SSCZone Android App Download",
    "SSC CGL Preparation App",
    "SSC PYQ Mock Test App",
    "SSC Syllabus Tracker App",
  ],
};

export default async function DownloadAppPage() {
  const release = await getMobileAppReleaseInfo();
  const downloadHref = release.apkDownloadUrl || "/api/download-apk";
  const downloadFilename = `SSCZone-v${release.version}.apk`;

  const appCapabilities = [
    {
      title: "125+ Shift PYQ Papers",
      desc: "Real Tier-1 & Tier-2 shift mocks with CBT timer and detailed study mode.",
      icon: FileSpreadsheet,
      accent: "bg-emerald-50 text-emerald-700 border-emerald-200",
    },
    {
      title: "20,480+ Question Bank MCQs",
      desc: "Chapter-by-chapter practice in Quantitative Aptitude, Reasoning, English & GK.",
      icon: BookOpen,
      accent: "bg-amber-50 text-amber-700 border-amber-200",
    },
    {
      title: "3-Pillar Syllabus Tracker",
      desc: "Track Theory, 50+ PYQs, and weekly Revisions per chapter — cloud synced with Web.",
      icon: Target,
      accent: "bg-indigo-50 text-indigo-700 border-indigo-200",
    },
    {
      title: "Custom Speed Drills",
      desc: "Solve 10, 15, or 25 randomized PYQs under exam clock across any section.",
      icon: Zap,
      accent: "bg-blue-50 text-blue-700 border-blue-200",
    },
    {
      title: "Exam Readiness & Pace Radar",
      desc: "Track accuracy %, average seconds/question, strong vs weak areas & 7-test trends.",
      icon: BarChart3,
      accent: "bg-purple-50 text-purple-700 border-purple-200",
    },
    {
      title: "21+ Notes PDFs & Daily Quiz",
      desc: "Read formula PDFs in-app and solve daily timed quizzes with streak XP rewards.",
      icon: Layers,
      accent: "bg-rose-50 text-rose-700 border-rose-200",
    },
  ];

  const installSteps = [
    {
      step: "01",
      title: "Download SSCZone APK",
      desc: `Tap the "Download APK (v${release.version})" button above. The verified ${release.sizeLabel} package downloads cleanly from our high-speed CDN.`,
    },
    {
      step: "02",
      title: "Allow Browser Install (One-Time)",
      desc: 'Open the downloaded file from your browser Downloads or notification bar. If Android prompts, tap Settings → enable "Allow from this source".',
    },
    {
      step: "03",
      title: "Install & Sync Your Progress",
      desc: "Tap Install, open SSCZone, and sign in with your website account. All your bookmarks, test attempts, and syllabus progress sync automatically.",
    },
  ];

  const appFaqs = [
    {
      q: "Is the SSCZone APK safe to install on Android?",
      a: `Yes. This is the official signed release build (${release.packageName}) directly built by SSCZone with zero third-party adware. You can verify the package version (v${release.version}) and SHA-256 checksum listed below.`,
    },
    {
      q: "Why does Android show 'Install unknown apps' permission?",
      a: "Because the APK is distributed directly from ssczone.com for fast updates before Play Store rollout. Allowing your browser once lets Android install signed SSCZone releases smoothly.",
    },
    {
      q: "Will my website test history and bookmarks show inside the app?",
      a: "Yes! Both the website and the Android app share the same cloud account. Simply sign in with the same email/Google account and your bookmarks and attempts stay synced.",
    },
    {
      q: "How do future app updates work?",
      a: "Whenever a new version launches, the SSCZone app checks automatically and prompts you inside the app to download and install the update in one tap.",
    },
  ];

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 font-sans antialiased pb-20">
      {/* ========================================================= */}
      {/* 1. HERO BANNER: DIRECT APK DOWNLOAD + VERIFIED SPECS      */}
      {/* ========================================================= */}
      <section className="relative overflow-hidden bg-gradient-to-br from-slate-950 via-indigo-950 to-blue-950 text-white pt-10 pb-14 px-4 border-b border-slate-800">
        <div className="pointer-events-none absolute -top-24 right-0 w-96 h-96 rounded-full bg-blue-500/20 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-24 left-0 w-80 h-80 rounded-full bg-emerald-500/15 blur-3xl" />

        <div className="max-w-5xl mx-auto relative z-10 space-y-8">
          {/* Breadcrumb */}
          <div className="flex items-center gap-2 text-xs text-blue-200/75 font-medium">
            <Link href="/" className="hover:text-white transition-colors">
              Home
            </Link>
            <span>/</span>
            <span className="text-white font-semibold">Download Android App</span>
          </div>

          <div className="flex flex-col md:flex-row md:items-center justify-between gap-8">
            {/* App Identity & Headlines */}
            <div className="space-y-4 max-w-2xl">
              <div className="flex items-center gap-4">
                <img
                  src="/icon-192.png"
                  alt="SSCZone App Icon"
                  className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl border-2 border-white/20 shadow-xl bg-blue-900 shrink-0"
                />
                <div className="space-y-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="inline-flex items-center gap-1 rounded-full bg-emerald-500/20 border border-emerald-400/40 px-2.5 py-0.5 text-[11px] font-black text-emerald-300">
                      <ShieldCheck className="h-3.5 w-3.5 text-emerald-400" />
                      Official Verified APK
                    </span>
                    <span className="rounded-full bg-amber-400 text-slate-950 px-2.5 py-0.5 text-[10px] font-black uppercase">
                      v{release.version} Latest
                    </span>
                  </div>
                  <h1 className="text-2xl sm:text-4xl font-black tracking-tight text-white">
                    SSCZone Android App
                  </h1>
                  <p className="text-xs sm:text-sm text-blue-200 font-medium">
                    Everything for SSC CGL, CHSL, CPO &amp; MTS. In One App.
                  </p>
                </div>
              </div>

              <p className="text-sm text-slate-200 leading-relaxed">
                Practice 125+ real previous year shift papers, track every syllabus chapter with 3-pillar mastery, run custom speed drills, and check live exam readiness directly on your Android phone.
              </p>

              {/* Primary CTA Buttons */}
              <div className="flex flex-col sm:flex-row sm:items-center gap-3 pt-1">
                <a
                  href={downloadHref}
                  download={downloadFilename}
                  className="inline-flex items-center justify-center gap-2.5 rounded-2xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 px-7 py-4 text-sm sm:text-base font-black shadow-xl shadow-emerald-500/25 transition-all hover:-translate-y-0.5 cursor-pointer"
                >
                  <Download className="h-5 w-5 stroke-[2.5]" />
                  <span>
                    Download APK ({release.sizeLabel})
                  </span>
                </a>

                <a
                  href="/api/download-apk"
                  download={downloadFilename}
                  className="inline-flex items-center justify-center gap-2 rounded-2xl border border-white/25 bg-white/10 hover:bg-white/20 px-5 py-4 text-xs sm:text-sm font-bold text-white transition-all"
                >
                  <span>Direct Mirror Link</span>
                  <ArrowRight className="h-4 w-4" />
                </a>

                <ShareCopyButton url="https://ssczone.com/download-app" />
              </div>

              {/* Release Specs Strip */}
              <div className="flex flex-wrap items-center gap-x-5 gap-y-2 text-xs text-blue-200/90 pt-1">
                <span className="inline-flex items-center gap-1.5">
                  <Smartphone className="h-3.5 w-3.5 text-amber-300" />
                  {release.minAndroid}
                </span>
                <span className="inline-flex items-center gap-1.5">
                  <Cloud className="h-3.5 w-3.5 text-blue-300" />
                  Cloud Account Sync
                </span>
                <span className="inline-flex items-center gap-1.5">
                  <Sparkles className="h-3.5 w-3.5 text-emerald-400" />
                  100% Free Practice
                </span>
              </div>
            </div>

            {/* Right Verification Card */}
            <div className="rounded-2xl border border-white/15 bg-white/8 backdrop-blur-md p-5 space-y-3 w-full md:w-80 shrink-0">
              <div className="flex items-center justify-between border-b border-white/10 pb-2.5">
                <span className="text-xs font-black uppercase tracking-wider text-blue-200">
                  Release Specifications
                </span>
                <span className="text-[11px] font-bold text-emerald-300">
                  Signed Build
                </span>
              </div>

              <div className="space-y-2 text-xs">
                <div className="flex items-center justify-between">
                  <span className="text-slate-300">Version</span>
                  <span className="font-bold text-white">v{release.version} (Build {release.versionCode})</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-300">File Size</span>
                  <span className="font-bold text-white">{release.sizeLabel}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-300">Package ID</span>
                  <span className="font-mono text-[11px] text-blue-200">{release.packageName}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-300">Compatibility</span>
                  <span className="font-bold text-white">{release.minAndroid}</span>
                </div>
              </div>

              {release.releaseNotes && (
                <div className="pt-2 border-t border-white/10">
                  <div className="text-[10px] font-black uppercase tracking-wider text-amber-300 mb-1">
                    What&apos;s New in v{release.version}
                  </div>
                  <p className="text-[11px] text-slate-200 leading-relaxed">
                    {release.releaseNotes}
                  </p>
                </div>
              )}

              {release.sha256 && (
                <div className="pt-2 border-t border-white/10">
                  <div className="text-[10px] font-bold text-slate-400">SHA-256 Checksum</div>
                  <p className="font-mono text-[10px] text-slate-300 break-all mt-0.5">
                    {release.sha256}
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* ========================================================= */}
      {/* 2. APP SCREENSHOTS GALLERY (ALL 6 SCREENS INTERACTIVE)    */}
      {/* ========================================================= */}
      <section className="max-w-6xl mx-auto px-4 pt-12 space-y-6">
        <div className="text-center max-w-2xl mx-auto space-y-2">
          <div className="inline-flex items-center gap-1.5 rounded-full bg-blue-50 border border-blue-200 px-3 py-1 text-[11px] font-black uppercase tracking-wider text-blue-700">
            <Smartphone className="h-3.5 w-3.5 text-blue-600" />
            <span>Inside The App • 6 Screens</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
            Built Clean &amp; Fast for Serious SSC Aspirants
          </h2>
          <p className="text-xs sm:text-sm text-slate-600">
            Tap any screenshot below to zoom in and explore how SSCZone organizes your entire CGL/CHSL preparation on Android.
          </p>
        </div>

        <AppScreenshotsGallery release={release} variant="full" />
      </section>

      {/* ========================================================= */}
      {/* 3. CORE APP CAPABILITIES GRID                             */}
      {/* ========================================================= */}
      <section className="max-w-6xl mx-auto px-4 pt-14 space-y-8">
        <div className="text-center max-w-2xl mx-auto space-y-1.5">
          <h2 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
            Everything Inside SSCZone Android
          </h2>
          <p className="text-xs sm:text-sm text-slate-500">
            Zero clutter, clean typography, KaTeX math formulas &amp; fast offline-friendly performance.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {appCapabilities.map((cap, idx) => {
            const Icon = cap.icon;
            return (
              <div
                key={idx}
                className="rounded-2xl border border-slate-200/90 bg-white p-5 shadow-xs space-y-3 hover:border-blue-300 transition-all"
              >
                <div
                  className={`w-10 h-10 rounded-xl border flex items-center justify-center ${cap.accent}`}
                >
                  <Icon className="h-5 w-5" />
                </div>
                <h3 className="text-base font-extrabold text-slate-900">
                  {cap.title}
                </h3>
                <p className="text-xs text-slate-600 leading-relaxed">
                  {cap.desc}
                </p>
              </div>
            );
          })}
        </div>
      </section>

      {/* ========================================================= */}
      {/* 4. 3-STEP INSTALLATION GUIDE                              */}
      {/* ========================================================= */}
      <section className="max-w-5xl mx-auto px-4 pt-14 space-y-6">
        <div className="rounded-3xl border border-slate-200/90 bg-white p-6 sm:p-8 shadow-xs space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-4">
            <div>
              <h2 className="text-xl sm:text-2xl font-black text-slate-900">
                How to Install SSCZone APK in 30 Seconds
              </h2>
              <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
                Quick guide for smooth direct installation on any Android smartphone.
              </p>
            </div>
            <a
              href={downloadHref}
              download={downloadFilename}
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-blue-600 hover:bg-blue-700 px-5 py-2.5 text-xs font-black text-white shadow-xs transition-all shrink-0"
            >
              <Download className="h-4 w-4" />
              <span>Download APK Now</span>
            </a>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {installSteps.map((s) => (
              <div
                key={s.step}
                className="rounded-2xl border border-slate-200 bg-slate-50/70 p-5 space-y-2.5"
              >
                <span className="inline-flex h-8 w-8 items-center justify-center rounded-xl bg-blue-600 text-xs font-black text-white">
                  {s.step}
                </span>
                <h3 className="text-sm font-black text-slate-900">{s.title}</h3>
                <p className="text-xs text-slate-600 leading-relaxed">
                  {s.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ========================================================= */}
      {/* 5. APP DOWNLOAD FAQ                                       */}
      {/* ========================================================= */}
      <section className="max-w-4xl mx-auto px-4 pt-14 space-y-5">
        <div className="text-center space-y-1">
          <h2 className="text-xl sm:text-2xl font-black text-slate-900 flex items-center justify-center gap-2">
            <HelpCircle className="h-5 w-5 text-blue-600" />
            <span>App Download &amp; Sync FAQs</span>
          </h2>
        </div>

        <div className="space-y-3">
          {appFaqs.map((faq, idx) => (
            <div
              key={idx}
              className="rounded-2xl border border-slate-200 bg-white p-5 space-y-1.5 shadow-2xs"
            >
              <h3 className="text-sm font-bold text-slate-900">{faq.q}</h3>
              <p className="text-xs text-slate-600 leading-relaxed">{faq.a}</p>
            </div>
          ))}
        </div>

        {/* Bottom Final Download Bar */}
        <div className="pt-4">
          <div className="rounded-3xl bg-slate-900 p-6 sm:p-8 text-white flex flex-col sm:flex-row items-center justify-between gap-4 shadow-lg">
            <div className="text-center sm:text-left space-y-1">
              <h3 className="text-lg sm:text-xl font-black">
                Ready to Study Smarter on Your Phone?
              </h3>
              <p className="text-xs text-slate-300">
                Download SSCZone v{release.version} APK ({release.sizeLabel}) • Free for all SSC aspirants.
              </p>
            </div>
            <a
              href={downloadHref}
              download={downloadFilename}
              className="inline-flex items-center gap-2 rounded-2xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 px-6 py-3.5 text-sm font-black shadow-md transition-all shrink-0"
            >
              <Download className="h-4 w-4 stroke-[2.5]" />
              <span>Download SSCZone APK</span>
            </a>
          </div>
        </div>
      </section>
    </div>
  );
}
