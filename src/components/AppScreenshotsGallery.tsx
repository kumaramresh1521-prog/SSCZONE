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
  onZoom,
  className = "",
}: {
  slide: AppScreenshotSlide;
  onZoom?: (slide: AppScreenshotSlide) => void;
  className?: string;
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
      className={`group relative overflow-hidden rounded-2xl shadow-lg transition-all duration-300 ${
        onZoom ? "cursor-zoom-in" : ""
      } ${
        slide.isRawScreen
          ? "bg-gradient-to-b from-slate-900 via-indigo-950 to-slate-900 p-2 border border-indigo-400/30"
          : "bg-slate-950 border border-slate-200/80"
      } ${className}`}
    >
      {slide.isRawScreen && (
        <div className="mb-1.5 text-center px-1.5">
          <span className="inline-block rounded-full bg-indigo-500/25 border border-indigo-400/40 px-2 py-0.5 text-[9px] font-extrabold uppercase tracking-wider text-indigo-200">
            Live App Screen
          </span>
        </div>
      )}

      <div
        className={`relative overflow-hidden aspect-[9/16] ${
          slide.isRawScreen
            ? "rounded-[16px] border-[3px] border-slate-800 bg-slate-950 shadow-inner"
            : "rounded-xl"
        }`}
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
          <div className="absolute bottom-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity rounded-full bg-slate-950/80 text-white p-1.5 backdrop-blur-xs border border-white/20">
            <Maximize2 className="h-3 w-3" />
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

  const total = APP_SCREENSHOT_SLIDES.length;
  const activeSlide = APP_SCREENSHOT_SLIDES[activeIndex];
  const prevIndex = activeIndex === 0 ? total - 1 : activeIndex - 1;
  const nextIndex = (activeIndex + 1) % total;
  const prevSlide = APP_SCREENSHOT_SLIDES[prevIndex];
  const nextSlide = APP_SCREENSHOT_SLIDES[nextIndex];

  const downloadHref = release.apkDownloadUrl || "/api/download-apk";
  const downloadFilename = `SSCZone-v${release.version}.apk`;

  const goPrev = () => setActiveIndex(prevIndex);
  const goNext = () => setActiveIndex(nextIndex);

  useEffect(() => {
    if (!lightboxSlide) return;
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setLightboxSlide(null);
      if (e.key === "ArrowLeft") {
        setLightboxSlide((cur) => {
          if (!cur) return null;
          const idx = APP_SCREENSHOT_SLIDES.findIndex((s) => s.id === cur.id);
          const nextIdx = idx <= 0 ? total - 1 : idx - 1;
          return APP_SCREENSHOT_SLIDES[nextIdx];
        });
      }
      if (e.key === "ArrowRight") {
        setLightboxSlide((cur) => {
          if (!cur) return null;
          const idx = APP_SCREENSHOT_SLIDES.findIndex((s) => s.id === cur.id);
          const nextIdx = (idx + 1) % total;
          return APP_SCREENSHOT_SLIDES[nextIdx];
        });
      }
    };
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [lightboxSlide, total]);

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

          {/* 6-Card Responsive Visual Gallery Grid */}
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

  // Homepage variant: Crisp, light, site-integrated card + compact 3-screen fan showcase
  return (
    <>
      <div className="rounded-3xl border border-slate-200/90 bg-gradient-to-br from-white via-blue-50/35 to-indigo-50/60 p-5 sm:p-7 shadow-sm relative overflow-hidden">
        {/* Subtle decorative background accents matching site light theme */}
        <div className="pointer-events-none absolute -right-20 -top-20 h-64 w-64 rounded-full bg-blue-100/60 blur-3xl" />
        <div className="pointer-events-none absolute -left-20 -bottom-20 h-56 w-56 rounded-full bg-emerald-100/50 blur-3xl" />

        <div className="relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8 items-center">
          {/* Left Column (7 cols): Crisp App Pitch, Active Highlight, Clean Single-Line CTAs */}
          <div className="lg:col-span-7 space-y-4 text-left">
            <div className="flex flex-wrap items-center gap-2">
              <span className="inline-flex items-center gap-1.5 rounded-full bg-blue-50 border border-blue-200 px-3 py-1 text-[11px] font-black text-blue-800 uppercase tracking-wider">
                <Smartphone className="h-3.5 w-3.5 text-blue-600" />
                <span>SSCZone Android App • v{release.version}</span>
              </span>
              <span className="inline-flex items-center gap-1 rounded-full bg-emerald-100 border border-emerald-200 text-emerald-800 px-2.5 py-0.5 text-[10px] font-black uppercase tracking-wide">
                Free APK • {release.sizeLabel}
              </span>
            </div>

            <div className="space-y-1.5">
              <h2 className="text-xl sm:text-2xl lg:text-3xl font-black tracking-tight text-slate-900 leading-tight">
                Practice SSC Anywhere with the{" "}
                <span className="text-blue-600">Mobile App</span>
              </h2>
              <p className="text-xs sm:text-sm text-slate-600 leading-relaxed max-w-xl">
                125+ real shift PYQs, 20,480+ chapter MCQs, custom speed tests, daily quizzes &amp; cloud-synced syllabus tracker right on your phone.
              </p>
            </div>

            {/* Compact Dynamic Highlight Strip tied to Active Screenshot */}
            <div className="rounded-2xl border border-slate-200/90 bg-white/90 p-3.5 sm:p-4 shadow-2xs space-y-2">
              <div className="flex items-center justify-between gap-2">
                <span className="text-[11px] font-black uppercase tracking-wider text-blue-700 flex items-center gap-1.5">
                  <Zap className="h-3.5 w-3.5 fill-amber-400 text-amber-500" />
                  {activeSlide.badge}: {activeSlide.headline}
                </span>
                <span className="text-[10px] font-bold text-slate-400 shrink-0">
                  {activeIndex + 1} / {total}
                </span>
              </div>
              <ul className="grid grid-cols-1 gap-1">
                {activeSlide.highlights.map((item, idx) => (
                  <li
                    key={idx}
                    className="flex items-center gap-2 text-xs text-slate-700 font-medium"
                  >
                    <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600 shrink-0" />
                    <span className="line-clamp-1">{item}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Clean Non-Wrapping CTA Row */}
            <div className="flex flex-wrap items-center gap-2.5 pt-0.5">
              <a
                href={downloadHref}
                download={downloadFilename}
                className="inline-flex items-center justify-center gap-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white px-5 py-3 text-xs sm:text-sm font-black shadow-sm shadow-emerald-600/20 transition-all hover:-translate-y-0.5 whitespace-nowrap cursor-pointer"
              >
                <Download className="h-4 w-4 shrink-0" />
                <span>Download APK ({release.sizeLabel})</span>
              </a>

              <Link
                href="/download-app"
                className="inline-flex items-center justify-center gap-1.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 hover:border-blue-300 px-4 py-3 text-xs sm:text-sm font-bold text-slate-800 transition-all whitespace-nowrap shadow-2xs"
              >
                <span>App Features &amp; Install Guide</span>
                <ArrowRight className="h-3.5 w-3.5 text-blue-600" />
              </Link>
            </div>

            {/* Compact Trust Footer */}
            <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-[11px] font-medium text-slate-500">
              <span className="inline-flex items-center gap-1">
                <ShieldCheck className="h-3.5 w-3.5 text-emerald-600" />
                Safe Verified APK
              </span>
              <span className="inline-flex items-center gap-1">
                <Cloud className="h-3.5 w-3.5 text-blue-600" />
                Syncs with Web Account
              </span>
              <span className="inline-flex items-center gap-1">
                <Smartphone className="h-3.5 w-3.5 text-amber-500" />
                {release.minAndroid}
              </span>
            </div>
          </div>

          {/* Right Column (5 cols): Sleek Compact 3-Screen Fanned Showcase (~315px tall) */}
          <div className="lg:col-span-5 flex flex-col items-center space-y-3">
            <div className="relative flex items-center justify-center w-full py-1">
              {/* Background Left Screen (Previous) */}
              <div
                onClick={goPrev}
                title={`View ${prevSlide.tabLabel}`}
                className="hidden sm:block w-[132px] -mr-10 -rotate-6 scale-90 opacity-65 hover:opacity-95 transition-all cursor-pointer z-0"
              >
                <ScreenshotFrame slide={prevSlide} />
              </div>

              {/* Center Active Screen (Compact Phone Showcase) */}
              <div className="relative w-[172px] sm:w-[184px] z-20">
                <button
                  type="button"
                  onClick={goPrev}
                  aria-label="Previous screenshot"
                  className="sm:hidden absolute -left-4 top-1/2 -translate-y-1/2 z-30 flex h-8 w-8 items-center justify-center rounded-full bg-white/95 border border-slate-200 text-slate-800 shadow-md cursor-pointer"
                >
                  <ChevronLeft className="h-4 w-4" />
                </button>

                <ScreenshotFrame
                  slide={activeSlide}
                  onZoom={(s) => setLightboxSlide(s)}
                  className="ring-2 ring-blue-600/15 shadow-2xl"
                />

                <button
                  type="button"
                  onClick={goNext}
                  aria-label="Next screenshot"
                  className="sm:hidden absolute -right-4 top-1/2 -translate-y-1/2 z-30 flex h-8 w-8 items-center justify-center rounded-full bg-white/95 border border-slate-200 text-slate-800 shadow-md cursor-pointer"
                >
                  <ChevronRight className="h-4 w-4" />
                </button>
              </div>

              {/* Background Right Screen (Next) */}
              <div
                onClick={goNext}
                title={`View ${nextSlide.tabLabel}`}
                className="hidden sm:block w-[132px] -ml-10 rotate-6 scale-90 opacity-65 hover:opacity-95 transition-all cursor-pointer z-0"
              >
                <ScreenshotFrame slide={nextSlide} />
              </div>
            </div>

            {/* Compact Single-Row Controls & Screen Switcher */}
            <div className="flex items-center gap-1.5 flex-wrap justify-center">
              <button
                type="button"
                onClick={goPrev}
                aria-label="Previous screen"
                className="hidden sm:inline-flex h-7 w-7 items-center justify-center rounded-lg border border-slate-200 bg-white hover:bg-slate-100 text-slate-700 cursor-pointer"
              >
                <ChevronLeft className="h-3.5 w-3.5" />
              </button>

              {APP_SCREENSHOT_SLIDES.map((slide, idx) => {
                const isSelected = idx === activeIndex;
                return (
                  <button
                    key={slide.id}
                    type="button"
                    onClick={() => setActiveIndex(idx)}
                    className={`px-2 py-1 rounded-lg text-[10px] font-bold transition-all cursor-pointer border ${
                      isSelected
                        ? "bg-blue-600 text-white border-blue-600 shadow-xs"
                        : "bg-white text-slate-600 border-slate-200 hover:border-blue-300 hover:text-blue-700"
                    }`}
                  >
                    {slide.tabLabel}
                  </button>
                );
              })}

              <button
                type="button"
                onClick={goNext}
                aria-label="Next screen"
                className="hidden sm:inline-flex h-7 w-7 items-center justify-center rounded-lg border border-slate-200 bg-white hover:bg-slate-100 text-slate-700 cursor-pointer"
              >
                <ChevronRight className="h-3.5 w-3.5" />
              </button>
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
