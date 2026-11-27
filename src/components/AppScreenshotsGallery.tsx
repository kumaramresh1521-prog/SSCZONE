"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import {
  Download,
  ChevronLeft,
  ChevronRight,
  CheckCircle2,
  Smartphone,
  ShieldCheck,
  Sparkles,
  Maximize2,
  X,
  ArrowRight,
  Cloud,
  Zap,
} from "lucide-react";
import {
  APP_SCREENSHOT_SLIDES,
  AppScreenshotSlide,
} from "@/lib/mobile-app-showcase-data";
import type { MobileAppReleaseInfo } from "@/lib/mobile-app-release";

function ScreenshotFrame({
  slide,
  compact = false,
  onZoom,
}: {
  slide: AppScreenshotSlide;
  compact?: boolean;
  onZoom?: (slide: AppScreenshotSlide) => void;
}) {
  return (
    <div
      onClick={() => onZoom?.(slide)}
      role={onZoom ? "button" : undefined}
      tabIndex={onZoom ? 0 : undefined}
      onKeyDown={(e) => {
        if (onZoom && (e.key === "Enter" || e.key === " ")) {
          e.preventDefault();
          onZoom(slide);
        }
      }}
      className={`group relative overflow-hidden rounded-2xl shadow-2xl transition-all duration-300 ${
        onZoom ? "cursor-zoom-in" : ""
      } ${
        slide.isRawScreen
          ? "bg-gradient-to-b from-slate-900 via-indigo-950 to-slate-900 p-2.5 sm:p-3 border border-indigo-400/30"
          : "bg-slate-950 border border-white/15"
      }`}
    >
      {slide.isRawScreen && (
        <div className="mb-2 text-center px-2 pt-0.5">
          <span className="inline-block rounded-full bg-indigo-500/25 border border-indigo-400/40 px-2.5 py-0.5 text-[10px] font-extrabold uppercase tracking-wider text-indigo-200">
            Live App Screen
          </span>
        </div>
      )}

      <div
        className={`relative overflow-hidden ${
          slide.isRawScreen
            ? "rounded-[20px] border-[4px] border-slate-800 bg-slate-950 shadow-inner"
            : "rounded-xl"
        } ${compact ? "aspect-[9/16]" : "aspect-[9/16]"}`}
      >
        <img
          src={slide.src}
          alt={`${slide.headline} — SSCZone Android App Screenshot`}
          loading="lazy"
          className={`w-full h-full object-cover object-top transition-transform duration-300 ${
            onZoom ? "group-hover:scale-[1.02]" : ""
          }`}
        />

        {onZoom && (
          <div className="absolute bottom-2.5 right-2.5 opacity-0 group-hover:opacity-100 transition-opacity rounded-full bg-slate-950/80 text-white p-1.5 backdrop-blur-xs border border-white/20">
            <Maximize2 className="h-3.5 w-3.5" />
          </div>
        )}
      </div>
    </div>
  );
}

export default function AppScreenshotsGallery({
  release,
  variant = "homepage",
}: {
  release: MobileAppReleaseInfo;
  variant?: "homepage" | "full";
}) {
  const [activeIndex, setActiveIndex] = useState(0);
  const [lightboxSlide, setLightboxSlide] = useState<AppScreenshotSlide | null>(
    null
  );

  const activeSlide = APP_SCREENSHOT_SLIDES[activeIndex];
  const downloadHref = release.apkDownloadUrl || "/api/download-apk";
  const downloadFilename = `SSCZone-v${release.version}.apk`;

  const goPrev = () => {
    setActiveIndex((prev) =>
      prev === 0 ? APP_SCREENSHOT_SLIDES.length - 1 : prev - 1
    );
  };

  const goNext = () => {
    setActiveIndex((prev) => (prev + 1) % APP_SCREENSHOT_SLIDES.length);
  };

  useEffect(() => {
    if (!lightboxSlide) return;
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setLightboxSlide(null);
      if (e.key === "ArrowLeft") {
        setLightboxSlide((cur) => {
          if (!cur) return null;
          const idx = APP_SCREENSHOT_SLIDES.findIndex((s) => s.id === cur.id);
          const nextIdx = idx <= 0 ? APP_SCREENSHOT_SLIDES.length - 1 : idx - 1;
          return APP_SCREENSHOT_SLIDES[nextIdx];
        });
      }
      if (e.key === "ArrowRight") {
        setLightboxSlide((cur) => {
          if (!cur) return null;
          const idx = APP_SCREENSHOT_SLIDES.findIndex((s) => s.id === cur.id);
          const nextIdx = (idx + 1) % APP_SCREENSHOT_SLIDES.length;
          return APP_SCREENSHOT_SLIDES[nextIdx];
        });
      }
    };
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [lightboxSlide]);

  if (variant === "full") {
    return (
      <>
        <div className="space-y-6">
          {/* Interactive Screen Explorer */}
          <div className="flex flex-wrap items-center justify-center gap-2">
            {APP_SCREENSHOT_SLIDES.map((slide, idx) => {
              const isSelected = idx === activeIndex;
              return (
                <button
                  key={slide.id}
                  type="button"
                  onClick={() => setActiveIndex(idx)}
                  className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer border ${
                    isSelected
                      ? "bg-blue-600 text-white border-blue-600 shadow-sm"
                      : "bg-white text-slate-700 border-slate-200 hover:border-blue-300 hover:bg-blue-50/60"
                  }`}
                >
                  {idx + 1}. {slide.tabLabel}
                </button>
              );
            })}
          </div>

          {/* 6-Card Responsive Visual Gallery Grid (Horizontal swipe on mobile, 3/6 cols on desktop) */}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3.5 sm:gap-4">
            {APP_SCREENSHOT_SLIDES.map((slide, idx) => {
              const isSelected = idx === activeIndex;
              return (
                <div
                  key={slide.id}
                  onClick={() => setActiveIndex(idx)}
                  className={`flex flex-col space-y-2 rounded-2xl p-2 border transition-all cursor-pointer ${
                    isSelected
                      ? "border-blue-500 bg-blue-50/70 ring-2 ring-blue-500/20 shadow-md"
                      : "border-slate-200/90 bg-white hover:border-blue-300"
                  }`}
                >
                  <ScreenshotFrame
                    slide={slide}
                    compact
                    onZoom={(s) => setLightboxSlide(s)}
                  />
                  <div className="px-1 pb-1 text-center">
                    <p className="text-[11px] font-extrabold text-slate-900 truncate">
                      {slide.tabLabel}
                    </p>
                    <p className="text-[10px] text-slate-500 line-clamp-1">
                      {slide.badge}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Selected Screen Detail Banner */}
          <div className="rounded-2xl border border-slate-200 bg-white p-5 sm:p-6 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="space-y-2">
              <span className="inline-flex items-center gap-1.5 rounded-full bg-blue-50 border border-blue-200 px-2.5 py-0.5 text-[11px] font-black text-blue-700 uppercase">
                <Sparkles className="h-3 w-3 text-blue-600" />
                {activeSlide.badge}
              </span>
              <h3 className="text-lg sm:text-xl font-black text-slate-900">
                {activeSlide.headline}
              </h3>
              <p className="text-xs sm:text-sm text-slate-600 max-w-2xl">
                {activeSlide.subheadline}
              </p>
              <div className="flex flex-wrap gap-x-5 gap-y-1.5 pt-1">
                {activeSlide.highlights.map((h, i) => (
                  <span
                    key={i}
                    className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-700"
                  >
                    <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600 shrink-0" />
                    <span>{h}</span>
                  </span>
                ))}
              </div>
            </div>

            <div className="flex items-center gap-2 shrink-0">
              <button
                type="button"
                onClick={goPrev}
                aria-label="Previous app screenshot"
                className="p-2.5 rounded-xl border border-slate-200 bg-slate-50 hover:bg-slate-100 text-slate-700 cursor-pointer"
              >
                <ChevronLeft className="h-4 w-4" />
              </button>
              <button
                type="button"
                onClick={() => setLightboxSlide(activeSlide)}
                className="px-4 py-2.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-xs font-bold text-slate-800 cursor-pointer"
              >
                Zoom Preview
              </button>
              <button
                type="button"
                onClick={goNext}
                aria-label="Next app screenshot"
                className="p-2.5 rounded-xl border border-slate-200 bg-slate-50 hover:bg-slate-100 text-slate-700 cursor-pointer"
              >
                <ChevronRight className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>

        {/* Full-screen Zoom Lightbox */}
        {lightboxSlide && (
          <LightboxModal
            slide={lightboxSlide}
            onClose={() => setLightboxSlide(null)}
            onSelect={(s) => setLightboxSlide(s)}
          />
        )}
      </>
    );
  }

  // Homepage variant: High-impact 2-column dark showcase card
  return (
    <>
      <div className="rounded-3xl border border-blue-900/40 bg-gradient-to-br from-slate-900 via-indigo-950 to-blue-950 text-white p-6 sm:p-8 lg:p-10 shadow-2xl relative overflow-hidden">
        {/* Decorative ambient glow */}
        <div className="pointer-events-none absolute -right-24 -top-24 h-80 w-80 rounded-full bg-blue-500/20 blur-3xl" />
        <div className="pointer-events-none absolute -left-24 -bottom-24 h-72 w-72 rounded-full bg-indigo-500/20 blur-3xl" />

        <div className="relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-10 items-center">
          {/* Left Column: Pitch, Dynamic Feature Card, Download CTAs */}
          <div className="lg:col-span-7 space-y-5 text-left">
            <div className="flex flex-wrap items-center gap-2">
              <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-500/20 border border-emerald-400/40 px-3 py-1 text-[11px] font-black text-emerald-300 uppercase tracking-wider">
                <Smartphone className="h-3.5 w-3.5 text-emerald-400" />
                <span>Official Android App • v{release.version}</span>
              </span>
              <span className="inline-flex items-center gap-1 rounded-full bg-amber-400 text-slate-950 px-2.5 py-0.5 text-[10px] font-black uppercase tracking-wide">
                Free APK • {release.sizeLabel}
              </span>
            </div>

            <div className="space-y-2.5">
              <h2 className="text-2xl sm:text-3xl lg:text-4xl font-black tracking-tight text-white leading-tight">
                Practice SSC Anywhere with the{" "}
                <span className="text-amber-300">SSCZone Android App</span>
              </h2>
              <p className="text-xs sm:text-sm text-blue-100/85 leading-relaxed max-w-2xl">
                Take 125+ real shift PYQs, 20,480+ chapter MCQs, custom speed tests, daily quizzes, and cloud-synced syllabus tracking straight from your phone.
              </p>
            </div>

            {/* Dynamic Feature Card tied to Active Screenshot */}
            <div className="rounded-2xl border border-white/15 bg-white/8 backdrop-blur-xs p-4 space-y-2.5">
              <div className="flex items-center justify-between gap-2">
                <span className="text-[11px] font-black uppercase tracking-wider text-amber-300 flex items-center gap-1.5">
                  <Zap className="h-3.5 w-3.5 fill-amber-300 text-amber-300" />
                  {activeSlide.badge}
                </span>
                <span className="text-[11px] text-blue-200 font-semibold">
                  Screen {activeIndex + 1} of {APP_SCREENSHOT_SLIDES.length}
                </span>
              </div>
              <h3 className="text-sm sm:text-base font-extrabold text-white">
                {activeSlide.headline}
              </h3>
              <ul className="space-y-1.5 pt-0.5">
                {activeSlide.highlights.map((item, idx) => (
                  <li
                    key={idx}
                    className="flex items-start gap-2 text-xs text-blue-100/90"
                  >
                    <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400 shrink-0 mt-0.5" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Primary Download & Showcase Links */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 pt-1">
              <a
                href={downloadHref}
                download={downloadFilename}
                className="inline-flex items-center justify-center gap-2.5 rounded-2xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 px-6 py-3.5 text-sm font-black shadow-lg shadow-emerald-500/25 transition-all hover:-translate-y-0.5 cursor-pointer"
              >
                <Download className="h-4 w-4 stroke-[2.5]" />
                <span>
                  Download Android APK (v{release.version} • {release.sizeLabel})
                </span>
              </a>

              <Link
                href="/download-app"
                className="inline-flex items-center justify-center gap-2 rounded-2xl border border-white/25 bg-white/10 hover:bg-white/20 px-5 py-3.5 text-xs sm:text-sm font-bold text-white transition-all"
              >
                <span>App Features &amp; Install Guide</span>
                <ArrowRight className="h-4 w-4" />
              </Link>
            </div>

            {/* Trust Badges */}
            <div className="flex flex-wrap items-center gap-x-5 gap-y-2 text-[11px] text-blue-200/90 pt-1">
              <span className="inline-flex items-center gap-1.5">
                <ShieldCheck className="h-3.5 w-3.5 text-emerald-400" />
                Verified Direct APK
              </span>
              <span className="inline-flex items-center gap-1.5">
                <Cloud className="h-3.5 w-3.5 text-blue-300" />
                Auto-Syncs with Web Account
              </span>
              <span className="inline-flex items-center gap-1.5">
                <Smartphone className="h-3.5 w-3.5 text-amber-300" />
                {release.minAndroid}
              </span>
            </div>
          </div>

          {/* Right Column: Interactive Phone Screenshot Showcase */}
          <div className="lg:col-span-5 flex flex-col items-center space-y-4">
            <div className="relative w-full max-w-[260px] sm:max-w-[280px] mx-auto">
              {/* Prev / Next Floating Controls */}
              <button
                type="button"
                onClick={goPrev}
                aria-label="Previous screenshot"
                className="absolute -left-3 sm:-left-5 top-1/2 -translate-y-1/2 z-20 flex h-9 w-9 items-center justify-center rounded-full bg-slate-900/90 hover:bg-blue-600 border border-white/25 text-white shadow-lg transition-all cursor-pointer"
              >
                <ChevronLeft className="h-4 w-4" />
              </button>

              <ScreenshotFrame
                slide={activeSlide}
                onZoom={(s) => setLightboxSlide(s)}
              />

              <button
                type="button"
                onClick={goNext}
                aria-label="Next screenshot"
                className="absolute -right-3 sm:-right-5 top-1/2 -translate-y-1/2 z-20 flex h-9 w-9 items-center justify-center rounded-full bg-slate-900/90 hover:bg-blue-600 border border-white/25 text-white shadow-lg transition-all cursor-pointer"
              >
                <ChevronRight className="h-4 w-4" />
              </button>
            </div>

            {/* Thumbnail Screen Switcher Strip */}
            <div className="flex flex-wrap items-center justify-center gap-1.5 max-w-sm">
              {APP_SCREENSHOT_SLIDES.map((slide, idx) => {
                const isSelected = idx === activeIndex;
                return (
                  <button
                    key={slide.id}
                    type="button"
                    onClick={() => setActiveIndex(idx)}
                    className={`px-2.5 py-1 rounded-lg text-[11px] font-bold transition-all cursor-pointer border ${
                      isSelected
                        ? "bg-amber-400 text-slate-950 border-amber-300 shadow-xs"
                        : "bg-white/10 text-blue-100 border-white/15 hover:bg-white/20"
                    }`}
                  >
                    {slide.tabLabel}
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {lightboxSlide && (
        <LightboxModal
          slide={lightboxSlide}
          onClose={() => setLightboxSlide(null)}
          onSelect={(s) => setLightboxSlide(s)}
        />
      )}
    </>
  );
}

function LightboxModal({
  slide,
  onClose,
  onSelect,
}: {
  slide: AppScreenshotSlide;
  onClose: () => void;
  onSelect: (s: AppScreenshotSlide) => void;
}) {
  const curIdx = APP_SCREENSHOT_SLIDES.findIndex((s) => s.id === slide.id);

  return (
    <div
      className="fixed inset-0 z-50 bg-slate-950/85 backdrop-blur-md flex items-center justify-center p-4"
      onClick={onClose}
    >
      <div
        className="relative max-w-md w-full flex flex-col items-center space-y-3"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="w-full flex items-center justify-between text-white px-1">
          <div>
            <span className="text-[10px] font-black uppercase tracking-wider text-amber-300">
              {slide.badge}
            </span>
            <h4 className="text-sm font-black">{slide.headline}</h4>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close preview"
            className="h-9 w-9 rounded-full bg-white/15 hover:bg-white/25 flex items-center justify-center text-white cursor-pointer"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="w-full max-w-[330px] relative">
          <ScreenshotFrame slide={slide} />

          <button
            type="button"
            onClick={() => {
              const prevIdx =
                curIdx <= 0 ? APP_SCREENSHOT_SLIDES.length - 1 : curIdx - 1;
              onSelect(APP_SCREENSHOT_SLIDES[prevIdx]);
            }}
            aria-label="Previous screenshot"
            className="absolute -left-4 top-1/2 -translate-y-1/2 h-9 w-9 rounded-full bg-slate-900/90 border border-white/25 text-white flex items-center justify-center hover:bg-blue-600 cursor-pointer"
          >
            <ChevronLeft className="h-4 w-4" />
          </button>

          <button
            type="button"
            onClick={() => {
              const nextIdx = (curIdx + 1) % APP_SCREENSHOT_SLIDES.length;
              onSelect(APP_SCREENSHOT_SLIDES[nextIdx]);
            }}
            aria-label="Next screenshot"
            className="absolute -right-4 top-1/2 -translate-y-1/2 h-9 w-9 rounded-full bg-slate-900/90 border border-white/25 text-white flex items-center justify-center hover:bg-blue-600 cursor-pointer"
          >
            <ChevronRight className="h-4 w-4" />
          </button>
        </div>

        <p className="text-xs text-slate-300 text-center max-w-sm">
          {slide.subheadline}
        </p>
      </div>
    </div>
  );
}
