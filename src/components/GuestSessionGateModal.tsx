"use client";

import React, { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Sparkles,
  X,
  LogIn,
  UserPlus,
} from "lucide-react";
import { supabase } from "@/lib/supabase";
import type { SessionGateConfig } from "@/lib/session-gate-store";

// Helper storage keys
const GUEST_START_KEY = "ssczone_guest_first_seen";
const GUEST_DISMISSED_KEY = "ssczone_gate_dismissed_until";

// Global variable to export status for test pages
let globalIsGateExceeded = false;
let globalTriggerModal: ((reason?: string) => void) | null = null;

export function isGuestLimitExceeded(): boolean {
  if (typeof window === "undefined") return false;
  return globalIsGateExceeded;
}

export function promptGuestLoginGate(reason?: string): boolean {
  if (globalIsGateExceeded && globalTriggerModal) {
    globalTriggerModal(reason);
    return true; // blocked
  }
  return false;
}

// Module level memory cache for session gate config
let memoryGateConfigCache: SessionGateConfig | null = null;
let memoryClientIpCache: string = "";

export default function GuestSessionGateModal() {
  const pathname = usePathname();

  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [config, setConfig] = useState<SessionGateConfig | null>(memoryGateConfigCache);
  const [isOpen, setIsOpen] = useState(false);
  const [customReason, setCustomReason] = useState<string | null>(null);

  // Check login state
  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setIsLoggedIn(Boolean(session?.user));
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setIsLoggedIn(Boolean(session?.user));
      if (session?.user) {
        setIsOpen(false);
        globalIsGateExceeded = false;
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  // Fetch gatekeeper configuration (cached in memory)
  useEffect(() => {
    if (memoryGateConfigCache) return;
    async function loadConfig() {
      try {
        const res = await fetch("/api/session-gate/config");
        if (res.ok) {
          const data = await res.json();
          if (data.config) {
            memoryGateConfigCache = data.config;
            setConfig(data.config);
            if (data.clientIp) {
              memoryClientIpCache = data.clientIp;
            }
          }
        }
      } catch (e) {
        console.error("Failed to fetch session gate config:", e);
      }
    }
    loadConfig();
  }, []);

  // Setup Global Trigger
  useEffect(() => {
    globalTriggerModal = (reason?: string) => {
      if (reason) setCustomReason(reason);
      setIsOpen(true);
    };
    return () => {
      globalTriggerModal = null;
    };
  }, []);

  // Close & Snooze modal
  const handleClose = useCallback(() => {
    setIsOpen(false);
    setCustomReason(null);
    try {
      // Snooze auto-popup for 15 minutes so the user is not disrupted while studying
      sessionStorage.setItem(GUEST_DISMISSED_KEY, String(Date.now() + 15 * 60 * 1000));
    } catch {}
  }, []);

  // Escape key handler
  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") handleClose();
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, handleClose]);

  // Guest Timer & Elapsed Tracking
  const evaluateGuestSession = useCallback(() => {
    if (isLoggedIn || !config || !config.is_enabled) {
      globalIsGateExceeded = false;
      return;
    }

    // Exempt admin, login, and signup pages
    if (pathname?.startsWith("/admin") || pathname === "/login" || pathname === "/signup") {
      return;
    }

    const now = Date.now();
    let firstSeen = localStorage.getItem(GUEST_START_KEY);

    if (!firstSeen) {
      localStorage.setItem(GUEST_START_KEY, String(now));
      firstSeen = String(now);
    }

    const firstSeenMs = parseInt(firstSeen, 10) || now;
    const diffMins = Math.floor((now - firstSeenMs) / (60 * 1000));
    const limit = config.session_limit_minutes || 15;

    if (diffMins >= limit) {
      globalIsGateExceeded = true;

      // DO NOT aggressively interrupt students on reading/content pages!
      // Reading pages include: notes, blog, books, toolkit, syllabus, exams, about, faq, legal pages.
      const isReadingPage = 
        pathname?.startsWith("/notes") ||
        pathname?.startsWith("/blog") ||
        pathname?.startsWith("/books") ||
        pathname?.startsWith("/toolkit") ||
        pathname?.startsWith("/about") ||
        pathname?.startsWith("/faq") ||
        pathname?.startsWith("/terms") ||
        pathname?.startsWith("/privacy") ||
        pathname?.startsWith("/refund") ||
        pathname?.startsWith("/contact") ||
        pathname?.startsWith("/pricing") ||
        pathname?.startsWith("/exams");

      // Check if user dismissed popup during this session
      const dismissedUntil = typeof window !== "undefined" ? sessionStorage.getItem(GUEST_DISMISSED_KEY) : null;
      const isSnoozed = dismissedUntil && now < Number(dismissedUntil);

      // Only auto-trigger popup if enabled, not snoozed, and NOT on a reading page
      if (config.show_modal_popup && !isOpen && !isReadingPage && !isSnoozed) {
        setIsOpen(true);
      }
    } else {
      globalIsGateExceeded = false;
    }
  }, [isLoggedIn, config, pathname, isOpen]);

  useEffect(() => {
    evaluateGuestSession();
    const interval = setInterval(evaluateGuestSession, 15000); // Check every 15 seconds
    return () => clearInterval(interval);
  }, [evaluateGuestSession]);

  // If user is already logged in, do not render modal
  if (isLoggedIn || !config || !config.is_enabled) {
    return null;
  }

  // If modal is not open, render nothing
  if (!isOpen) {
    return null;
  }

  const redirectTarget = pathname || "/dashboard";

  return (
    <div 
      className="fixed inset-0 z-50 bg-slate-950/65 backdrop-blur-xs flex items-center justify-center p-4 sm:p-6 animate-in fade-in duration-150"
      onClick={handleClose}
      role="dialog"
      aria-modal="true"
    >
      <div 
        className="relative w-full max-w-md bg-white rounded-3xl border border-slate-200/90 shadow-2xl p-6 sm:p-7 overflow-hidden text-slate-800"
        onClick={(e) => e.stopPropagation()}
      >
        
        {/* Header Strip with Clean Close Button */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-blue-50 text-blue-600 border border-blue-100 shadow-2xs">
            <Sparkles className="w-5 h-5" />
          </div>

          <button
            type="button"
            onClick={handleClose}
            className="p-2 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer"
            aria-label="Close dialog"
            title="Close (Esc)"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Heading & Explanation */}
        <div className="space-y-1.5 mb-5">
          <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight leading-snug">
            {customReason ? "Sign in to Save Progress" : (config.modal_title || "Save Your Test Progress & Scorecards")}
          </h2>
          <p className="text-xs sm:text-sm text-slate-600 leading-relaxed font-normal">
            {customReason || config.modal_message || "Sign in or create a free account to track your test performance, review question solutions, and save bookmarks."}
          </p>
        </div>

        {/* Minimal Feature Badges */}
        <div className="grid grid-cols-3 gap-2 py-1 mb-5 text-center">
          <div className="rounded-xl bg-slate-50 border border-slate-100 p-2.5">
            <span className="text-[11px] font-bold text-slate-800 block">Solutions</span>
            <span className="text-[10px] text-slate-400">Step-by-step</span>
          </div>
          <div className="rounded-xl bg-slate-50 border border-slate-100 p-2.5">
            <span className="text-[11px] font-bold text-slate-800 block">Scorecards</span>
            <span className="text-[10px] text-slate-400">Speed & accuracy</span>
          </div>
          <div className="rounded-xl bg-slate-50 border border-slate-100 p-2.5">
            <span className="text-[11px] font-bold text-slate-800 block">Bookmarks</span>
            <span className="text-[10px] text-slate-400">Saved to profile</span>
          </div>
        </div>

        {/* Primary Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-2.5">
          <Link
            href={`/login?next=${encodeURIComponent(redirectTarget)}`}
            className="flex-1 py-3 px-4 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs sm:text-sm shadow-sm hover:shadow transition-all flex items-center justify-center gap-2 text-center cursor-pointer"
          >
            <LogIn className="w-4 h-4" />
            <span>Sign In</span>
          </Link>

          <Link
            href={`/signup?next=${encodeURIComponent(redirectTarget)}`}
            className="flex-1 py-3 px-4 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-800 font-bold text-xs sm:text-sm transition-all flex items-center justify-center gap-2 text-center shadow-2xs cursor-pointer"
          >
            <UserPlus className="w-4 h-4 text-blue-600" />
            <span>Create Free Account</span>
          </Link>
        </div>

        {/* Dismiss Text Link */}
        <div className="pt-3.5 text-center">
          <button
            type="button"
            onClick={handleClose}
            className="text-xs font-semibold text-slate-400 hover:text-slate-600 transition-colors cursor-pointer"
          >
            Continue as Guest for now
          </button>
        </div>

      </div>
    </div>
  );
}
