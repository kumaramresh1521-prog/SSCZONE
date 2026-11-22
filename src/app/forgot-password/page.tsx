"use client";

import { useState } from "react";
import { supabase } from "@/lib/supabase";
import Link from "next/link";
import { Mail, ArrowRight, ArrowLeft, ShieldCheck, CheckCircle2 } from "lucide-react";
import BrandLogo from "@/components/BrandLogo";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [sent, setSent] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      // Determine the origin robustly
      const origin = typeof window !== "undefined" && window.location.origin ? window.location.origin : "";
      const siteUrl = origin && !origin.includes("localhost")
        ? origin
        : (process.env.NEXT_PUBLIC_APP_URL || "https://ssczone.com");

      const cleanUrl = siteUrl.replace(/\/$/, "");
      const redirectTo = `${cleanUrl}/update-password`;

      const { error: err } = await supabase.auth.resetPasswordForEmail(email.trim(), {
        redirectTo,
      });

      if (err) {
        setError(err.message || "Failed to send reset link. Please verify your email.");
        setLoading(false);
        return;
      }

      setSent(true);
      setLoading(false);
    } catch (err: any) {
      setError(err?.message || "An unexpected error occurred. Please try again.");
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-blue-950 to-indigo-950 flex flex-col justify-center py-12 sm:px-6 lg:px-8 relative overflow-hidden">
      {/* Background Decorative Blur Circles */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-blue-600/20 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-10 right-10 w-80 h-80 bg-indigo-600/15 rounded-full blur-3xl pointer-events-none" />

      <div className="sm:mx-auto sm:w-full sm:max-w-md relative z-10 text-center px-4">
        {/* Logo */}
        <div className="flex justify-center">
          <BrandLogo variant="white" size="xl" />
        </div>

        <h2 className="mt-6 text-2xl sm:text-3xl font-black text-white tracking-tight">
          Reset Your Password
        </h2>
        <p className="mt-1.5 text-xs sm:text-sm text-blue-200/80">
          Enter your registered email and we&apos;ll send you a secure link to create a new password
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md px-4 relative z-10">
        <div className="bg-white/10 backdrop-blur-xl border border-white/15 py-8 px-6 sm:px-10 shadow-2xl rounded-3xl">
          {sent ? (
            <div className="text-center py-2 space-y-5">
              <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-emerald-500/20 border border-emerald-500/40 text-emerald-400 shadow-inner">
                <CheckCircle2 className="h-8 w-8" />
              </div>

              <div>
                <h3 className="text-lg font-bold text-white">Reset Link Sent!</h3>
                <p className="mt-2 text-xs sm:text-sm text-blue-200/90 leading-relaxed">
                  We have dispatched a password recovery link to:
                </p>
                <div className="mt-2 inline-block px-3 py-1.5 rounded-lg bg-white/10 border border-white/15 text-xs font-mono font-bold text-amber-300">
                  {email}
                </div>
              </div>

              <div className="rounded-xl bg-blue-900/40 border border-blue-500/30 p-3.5 text-left text-xs text-blue-200/80 space-y-1.5">
                <p className="font-semibold text-blue-100 flex items-center gap-1.5">
                  <span>💡</span> Next Steps:
                </p>
                <ul className="list-disc list-inside space-y-1 text-[11px] text-blue-200/70">
                  <li>Open your email inbox and click the reset link.</li>
                  <li>Check your <strong>Spam/Junk</strong> folder if it doesn&apos;t arrive within 1 minute.</li>
                  <li>The reset link remains valid for 1 hour.</li>
                </ul>
              </div>

              <div className="pt-2 flex flex-col gap-2.5">
                <Link
                  href="/login"
                  className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-300 hover:to-amber-400 text-gray-950 font-black text-xs shadow-lg shadow-amber-500/25 transition-all"
                >
                  <ArrowLeft className="h-3.5 w-3.5" />
                  <span>Return to Login</span>
                </Link>

                <button
                  type="button"
                  onClick={() => {
                    setSent(false);
                  }}
                  className="w-full py-2.5 px-4 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-xs font-bold text-blue-200 transition-colors"
                >
                  Send to a different email
                </button>
              </div>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <label htmlFor="email" className="block text-xs font-bold text-blue-100 uppercase tracking-wider mb-2">
                  Registered Email Address
                </label>
                <div className="relative rounded-2xl shadow-xs">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-blue-300">
                    <Mail className="h-4 w-4" />
                  </div>
                  <input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="you@example.com"
                    required
                    autoComplete="email"
                    className="block w-full pl-10 pr-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-blue-200/50 text-sm font-medium focus:outline-hidden focus:ring-2 focus:ring-amber-400 focus:border-transparent transition-all"
                  />
                </div>
              </div>

              {error && (
                <div className="rounded-xl bg-rose-500/20 border border-rose-500/40 p-3 text-xs font-bold text-rose-200 animate-shake">
                  {error}
                </div>
              )}

              <button
                type="submit"
                disabled={loading}
                className="w-full flex items-center justify-center gap-2 py-3.5 px-4 rounded-xl bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-300 hover:to-amber-400 text-gray-950 font-black text-sm shadow-lg shadow-amber-500/25 hover:shadow-amber-500/40 hover:scale-[1.01] active:scale-[0.99] transition-all disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
              >
                {loading ? (
                  <div className="flex items-center gap-2">
                    <div className="h-4 w-4 border-2 border-gray-950 border-t-transparent rounded-full animate-spin" />
                    <span>Sending Reset Link...</span>
                  </div>
                ) : (
                  <>
                    <span>Send Reset Link</span>
                    <ArrowRight className="h-4 w-4" />
                  </>
                )}
              </button>
            </form>
          )}

          {/* Footer Back to Login Link */}
          {!sent && (
            <div className="mt-6 pt-5 border-t border-white/10 text-center">
              <p className="text-xs text-blue-200/80">
                Remember your password?{" "}
                <Link
                  href="/login"
                  className="font-extrabold text-amber-400 hover:text-amber-300 underline transition-colors"
                >
                  Back to Sign In
                </Link>
              </p>
            </div>
          )}
        </div>

        {/* Bottom Trust Badges */}
        <div className="mt-6 flex items-center justify-center gap-4 text-xs font-semibold text-blue-200/60">
          <span className="flex items-center gap-1">
            <ShieldCheck className="h-3.5 w-3.5 text-emerald-400" />
            <span>Secure 256-Bit SSL</span>
          </span>
          <span>•</span>
          <span>SSCZone Account Protection</span>
        </div>
      </div>
    </div>
  );
}
