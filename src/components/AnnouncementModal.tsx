"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { X, Flame, ArrowRight, ExternalLink } from "lucide-react";
import { AnnouncementConfig } from "@/lib/announcements-types";

export default function AnnouncementModal() {
  const [config, setConfig] = useState<AnnouncementConfig | null>(null);
  const [isOpen, setIsOpen] = useState(false);
  const router = useRouter();

  useEffect(() => {
    let isMounted = true;
    let timer: NodeJS.Timeout | null = null;

    fetch("/api/announcement")
      .then((res) => res.json())
      .then((data) => {
        if (!isMounted || !data.success || !data.config) return;
        const cfg: AnnouncementConfig = data.config;
        if (!cfg.enabled) return;

        // Check if user already dismissed this specific version in this browser session
        const storageKey = `ssczone_announcement_seen_${cfg.version || "default"}`;
        const alreadySeen = typeof window !== "undefined" && sessionStorage.getItem(storageKey);

        if (!alreadySeen) {
          setConfig(cfg);
          const delayMs = Math.max(500, (cfg.showDelaySec || 1.5) * 1000);
          timer = setTimeout(() => {
            if (isMounted) {
              setIsOpen(true);
            }
          }, delayMs);
        }
      })
      .catch(() => {
        // Silently catch fetch failure
      });

    return () => {
      isMounted = false;
      if (timer) clearTimeout(timer);
    };
  }, []);

  function handleDismiss() {
    if (config?.version && typeof window !== "undefined") {
      sessionStorage.setItem(`ssczone_announcement_seen_${config.version}`, "true");
    }
    setIsOpen(false);
  }

  function handleActionClick(url?: string, isExternal?: boolean) {
    handleDismiss();
    if (!url) return;
    if (isExternal) {
      window.open(url, "_blank", "noopener,noreferrer");
    } else {
      router.push(url);
    }
  }

  // Close on Escape
  useEffect(() => {
    function onKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape" && isOpen) {
        handleDismiss();
      }
    }
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [isOpen]);

  if (!isOpen || !config) return null;

  return (
    <div
      className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm animate-in fade-in duration-200"
      role="dialog"
      aria-modal="true"
      aria-labelledby="announcement-title"
    >
      {/* Backdrop click area */}
      <div className="absolute inset-0" onClick={handleDismiss} />

      {/* Modal Card */}
      <div className="relative w-full max-w-md overflow-hidden rounded-3xl bg-white shadow-2xl border border-slate-200/80 z-10 animate-in zoom-in-95 duration-200">
        
        {/* Close Button Top Right */}
        <button
          onClick={handleDismiss}
          className="absolute top-3 right-3 z-20 flex h-8 w-8 items-center justify-center rounded-full bg-slate-900/60 text-white backdrop-blur-md hover:bg-slate-900/80 transition-all cursor-pointer"
          aria-label="Close notification"
        >
          <X className="h-4 w-4" />
        </button>

        {/* Optional Cover Banner */}
        {config.imageUrl && (
          <div className="relative h-36 sm:h-40 w-full overflow-hidden bg-slate-100">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={config.imageUrl}
              alt=""
              className="h-full w-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
          </div>
        )}

        {/* Content Body */}
        <div className="p-5 sm:p-6 space-y-3.5">
          {/* Badge */}
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-1.5 rounded-lg bg-red-500/10 px-2.5 py-1 text-[11px] font-black uppercase tracking-wider text-red-600 border border-red-500/20">
              <Flame className="h-3 w-3 text-red-600 fill-red-600" />
              <span>{config.badge || "EXAM ALERT"}</span>
            </span>
          </div>

          {/* Title */}
          <h2
            id="announcement-title"
            className="text-lg sm:text-xl font-black text-slate-900 leading-snug tracking-tight"
          >
            {config.title}
          </h2>

          {/* Description */}
          <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
            {config.message}
          </p>

          {/* Actions */}
          <div className="pt-2 flex flex-col gap-2">
            <button
              type="button"
              onClick={() =>
                handleActionClick(config.primaryButton.url, config.primaryButton.isExternal)
              }
              className="flex items-center justify-center gap-2 w-full rounded-2xl bg-gradient-to-r from-blue-600 via-indigo-600 to-blue-700 py-3 px-5 text-xs sm:text-sm font-black text-white shadow-lg shadow-blue-500/25 hover:from-blue-700 hover:to-indigo-700 active:scale-98 transition-all cursor-pointer"
            >
              <span>{config.primaryButton.text || "Check Now"}</span>
              <ArrowRight className="h-4 w-4" />
            </button>

            {config.secondaryButton?.text && (
              <button
                type="button"
                onClick={handleDismiss}
                className="w-full text-center py-1.5 text-xs font-semibold text-slate-500 hover:text-slate-800 transition-colors cursor-pointer"
              >
                {config.secondaryButton.text}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
