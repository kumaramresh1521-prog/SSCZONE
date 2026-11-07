"use client";

import React, { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  Clock,
  Lock,
  Sparkles,
  ArrowRight,
  ShieldAlert,
  CheckCircle2,
  Bookmark,
  Trophy,
  X,
  LogIn,
  UserPlus,
} from "lucide-react";
import { supabase } from "@/lib/supabase";
import type { SessionGateConfig } from "@/lib/session-gate-store";

// Helper storage keys
const GUEST_START_KEY = "ssczone_guest_first_seen";
const GUEST_IP_KEY = "ssczone_guest_ip";
const GATE_CONFIG_CACHE_KEY = "ssczone_session_gate_cache";

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

export default function GuestSessionGateModal() {
  const pathname = usePathname();
  const router = useRouter();

  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [config, setConfig] = useState<SessionGateConfig | null>(null);
  const [clientIp, setClientIp] = useState<string>("");
  const [isOpen, setIsOpen] = useState(false);
  const [elapsedMinutes, setElapsedMinutes] = useState(0);
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

  // Fetch gatekeeper configuration
  useEffect(() => {
    async function loadConfig() {
      try {
        const res = await fetch("/api/session-gate/config");
        if (res.ok) {
          const data = await res.json();
          if (data.config) {
            setConfig(data.config);
            if (data.clientIp) setClientIp(data.clientIp);
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
    setElapsedMinutes(diffMins);

    const limit = config.session_limit_minutes || 15;

    if (diffMins >= limit) {
      globalIsGateExceeded = true;
      if (config.show_modal_popup && !isOpen) {
        setIsOpen(true);
      }
    } else {
      globalIsGateExceeded = false;
    }
  }, [isLoggedIn, config, pathname, isOpen]);

  useEffect(() => {
    evaluateGuestSession();
    const interval = setInterval(evaluateGuestSession, 10000); // Check every 10 seconds
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

  const limitMinutes = config.session_limit_minutes || 15;
  const redirectTarget = pathname || "/dashboard";

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-md flex items-center justify-center p-4 sm:p-6 animate-in fade-in duration-200">
      <div className="relative w-full max-w-lg bg-white rounded-3xl border border-slate-200/90 shadow-2xl p-6 sm:p-8 overflow-hidden text-slate-800">
        
        {/* Subtle decorative glow */}
        <div className="absolute -top-24 -right-24 w-48 h-48 bg-blue-500/10 rounded-full blur-3xl pointer-events-none"></div>
        <div className="absolute -bottom-24 -left-24 w-48 h-48 bg-amber-500/10 rounded-full blur-3xl pointer-events-none"></div>

        {/* Header Ribbon */}
        <div className="flex items-center justify-between mb-5">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-50 border border-amber-200 text-amber-800 text-xs font-bold">
            <Clock className="w-3.5 h-3.5 text-amber-600 animate-pulse" />
            <span>{limitMinutes}-Minute Free Guest Session Complete</span>
          </div>

          {!config.block_test_attempts && (
            <button
              type="button"
              onClick={() => setIsOpen(false)}
              className="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
              title="Close for now"
            >
              <X className="w-5 h-5" />
            </button>
          )}
        </div>

        {/* Modal Title */}
        <div className="mb-4">
          <h2 className="text-xl sm:text-2xl font-black text-slate-950 tracking-tight leading-snug">
            {config.modal_title || `⏰ Guest Session Limit Reached (${limitMinutes} Mins)`}
          </h2>
          <p className="text-xs sm:text-sm text-slate-600 mt-2 leading-relaxed">
            {customReason || config.modal_message}
          </p>
        </div>

        {/* Benefits Checklist */}
        <div className="bg-slate-50 rounded-2xl p-4 border border-slate-200/80 mb-6 space-y-2.5">
          <p className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
            Why Aspirants Sign Up for Free:
          </p>
          <div className="space-y-2 text-xs font-semibold text-slate-700">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>Save your test attempts, speed statistics & detailed scorecards</span>
            </div>
            <div className="flex items-center gap-2">
              <Bookmark className="w-4 h-4 text-amber-500 shrink-0" />
              <span>Collect tricky questions & formulas for rapid last-minute revision</span>
            </div>
            <div className="flex items-center gap-2">
              <Trophy className="w-4 h-4 text-blue-600 shrink-0" />
              <span>Unlimited access to Speed Test Drills & Daily Free Quizzes</span>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-3">
          <Link
            href={`/login?next=${encodeURIComponent(redirectTarget)}`}
            className="flex-1 py-3 px-4 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs sm:text-sm shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-2 text-center"
          >
            <LogIn className="w-4 h-4" />
            <span>Login to Account</span>
          </Link>

          <Link
            href={`/signup?next=${encodeURIComponent(redirectTarget)}`}
            className="flex-1 py-3 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs sm:text-sm shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-2 text-center"
          >
            <UserPlus className="w-4 h-4" />
            <span>Create Free Account</span>
          </Link>
        </div>

        <p className="text-[11px] text-center text-slate-400 mt-3 font-medium">
          Free account takes less than 15 seconds. No credit card required.
        </p>
      </div>
    </div>
  );
}
