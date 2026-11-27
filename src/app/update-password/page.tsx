"use client";

import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Lock, Eye, EyeOff, ArrowRight, ShieldCheck, CheckCircle2, AlertCircle } from "lucide-react";
import toast from "react-hot-toast";
import BrandLogo from "@/components/BrandLogo";

export default function UpdatePasswordPage() {
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);
  const [hasValidSession, setHasValidSession] = useState<boolean | null>(null);
  const router = useRouter();

  useEffect(() => {
    let isMounted = true;
    let timerId: ReturnType<typeof setTimeout> | null = null;

    async function initRecovery() {
      if (typeof window === "undefined") return;

      const hash = window.location.hash;
      const search = window.location.search;
      const searchParams = new URLSearchParams(search);
      const hashParams = new URLSearchParams(hash.startsWith("#") ? hash.substring(1) : "");

      // 1. Check for error parameters (e.g. expired link)
      const errorDesc = hashParams.get("error_description") || searchParams.get("error_description");
      const errorCode = hashParams.get("error_code") || searchParams.get("error_code");

      if (errorDesc || errorCode) {
        const cleanMessage = errorDesc
          ? decodeURIComponent(errorDesc).replace(/\+/g, " ")
          : "The password reset link is invalid or has expired. Please request a new link.";
        if (isMounted) {
          setError(cleanMessage);
          setHasValidSession(false);
        }
        return;
      }

      // 2. PKCE code exchange: If code is present in URL query
      const code = searchParams.get("code");
      if (code) {
        try {
          const { data, error: exchangeErr } = await supabase.auth.exchangeCodeForSession(code);
          if (!exchangeErr && data?.session?.user) {
            if (isMounted) setHasValidSession(true);
            return;
          }
          if (exchangeErr && isMounted) {
            setError(
              exchangeErr.message ||
                "Invalid or expired password recovery link. Please request a new one."
            );
            setHasValidSession(false);
            return;
          }
        } catch (ex: any) {
          if (isMounted) {
            setError(ex?.message || "Failed to verify recovery link.");
            setHasValidSession(false);
          }
          return;
        }
      }

      // 3. Token hash OTP verification (direct recovery link / custom templates)
      const tokenHash = searchParams.get("token_hash");
      const otpType = searchParams.get("type") || "recovery";
      if (tokenHash) {
        try {
          const { data, error: verifyErr } = await supabase.auth.verifyOtp({
            token_hash: tokenHash,
            type: otpType as any,
          });
          if (!verifyErr && data?.session?.user) {
            if (isMounted) setHasValidSession(true);
            return;
          }
          if (verifyErr && isMounted) {
            setError(
              verifyErr.message ||
                "Invalid or expired password recovery link. Please request a new one."
            );
            setHasValidSession(false);
            return;
          }
        } catch (ex: any) {
          if (isMounted) {
            setError(ex?.message || "Failed to verify recovery token.");
            setHasValidSession(false);
          }
          return;
        }
      }

      // 4. Implicit flow hash tokens fallback (#access_token=...&refresh_token=...)
      const accessToken = hashParams.get("access_token");
      const refreshToken = hashParams.get("refresh_token");
      if (accessToken && refreshToken) {
        try {
          const { data, error: sessionErr } = await supabase.auth.setSession({
            access_token: accessToken,
            refresh_token: refreshToken,
          });
          if (!sessionErr && data?.session?.user) {
            if (isMounted) setHasValidSession(true);
            return;
          }
        } catch {}
      }

      // 5. Check for existing active session
      const {
        data: { session },
      } = await supabase.auth.getSession();
      if (session?.user) {
        if (isMounted) setHasValidSession(true);
        return;
      }

      // 6. Wait briefly for Supabase onAuthStateChange
      timerId = setTimeout(async () => {
        const {
          data: { session: retrySession },
        } = await supabase.auth.getSession();
        if (isMounted) {
          if (retrySession?.user) {
            setHasValidSession(true);
          } else {
            setHasValidSession(false);
            setError(
              "No active reset session found. The reset link may have expired or was already used."
            );
          }
        }
      }, 2000);
    }

    // Auth State Change listener
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === "PASSWORD_RECOVERY" || event === "SIGNED_IN" || session?.user) {
        if (isMounted) setHasValidSession(true);
      }
    });

    initRecovery();

    return () => {
      isMounted = false;
      if (timerId) clearTimeout(timerId);
      subscription.unsubscribe();
    };
  }, []);

  async function handleUpdate(e: React.FormEvent) {
    e.preventDefault();
    setError("");

    if (password.length < 6) {
      setError("Password must be at least 6 characters long.");
      return;
    }

    if (password !== confirmPassword) {
      setError("Passwords do not match. Please re-enter.");
      return;
    }

    setLoading(true);

    try {
      const { error: err } = await supabase.auth.updateUser({ password });
      if (err) {
        setError(err.message || "Failed to update password. Please try again.");
        setLoading(false);
        return;
      }

      setDone(true);
      setLoading(false);
      toast.success("Password updated successfully!", { icon: "🔒" });

      setTimeout(() => {
        router.push("/login");
      }, 2500);
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
          Create New Password
        </h2>
        <p className="mt-1.5 text-xs sm:text-sm text-blue-200/80">
          Enter your new password below to regain full access to SSCZone
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md px-4 relative z-10">
        <div className="bg-white/10 backdrop-blur-xl border border-white/15 py-8 px-6 sm:px-10 shadow-2xl rounded-3xl">
          {done ? (
            <div className="text-center py-3 space-y-4">
              <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-emerald-500/20 border border-emerald-500/40 text-emerald-400 shadow-inner">
                <CheckCircle2 className="h-8 w-8" />
              </div>
              <h3 className="text-xl font-bold text-white">Password Updated!</h3>
              <p className="text-xs sm:text-sm text-blue-200/90 leading-relaxed">
                Your password has been changed successfully. You can now log in with your new credentials.
              </p>
              <div className="pt-2">
                <Link
                  href="/login"
                  className="w-full inline-flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-300 hover:to-amber-400 text-gray-950 font-black text-xs shadow-lg shadow-amber-500/25 transition-all"
                >
                  <span>Go to Login</span>
                  <ArrowRight className="h-3.5 w-3.5" />
                </Link>
              </div>
            </div>
          ) : hasValidSession === null ? (
            <div className="text-center py-8 space-y-4">
              <div className="mx-auto h-10 w-10 border-3 border-amber-400 border-t-transparent rounded-full animate-spin" />
              <p className="text-xs sm:text-sm font-semibold text-blue-200">
                Verifying your password recovery link...
              </p>
            </div>
          ) : hasValidSession === false ? (
            <div className="text-center py-3 space-y-4">
              <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-rose-500/20 border border-rose-500/40 text-rose-400 shadow-inner">
                <AlertCircle className="h-8 w-8" />
              </div>
              <h3 className="text-lg font-bold text-white">Link Expired or Invalid</h3>
              <p className="text-xs sm:text-sm text-rose-200/90 leading-relaxed">
                {error || "Your password recovery session is missing or expired. Please request a fresh reset link."}
              </p>
              <div className="pt-2 flex flex-col gap-2">
                <Link
                  href="/forgot-password"
                  className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-300 hover:to-amber-400 text-gray-950 font-black text-xs shadow-lg shadow-amber-500/25 transition-all"
                >
                  <span>Request New Reset Link</span>
                  <ArrowRight className="h-3.5 w-3.5" />
                </Link>
                <Link
                  href="/login"
                  className="w-full py-2.5 px-4 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-xs font-bold text-blue-200 text-center transition-colors"
                >
                  Return to Sign In
                </Link>
              </div>
            </div>
          ) : (
            <form onSubmit={handleUpdate} className="space-y-5">
              {/* New Password */}
              <div>
                <label htmlFor="new-password" className="block text-xs font-bold text-blue-100 uppercase tracking-wider mb-2">
                  New Password
                </label>
                <div className="relative rounded-2xl shadow-xs">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-blue-300">
                    <Lock className="h-4 w-4" />
                  </div>
                  <input
                    id="new-password"
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="At least 6 characters"
                    required
                    minLength={6}
                    autoComplete="new-password"
                    className="block w-full pl-10 pr-11 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-blue-200/50 text-sm font-medium focus:outline-hidden focus:ring-2 focus:ring-amber-400 focus:border-transparent transition-all"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-blue-300 hover:text-white transition-colors cursor-pointer"
                    title={showPassword ? "Hide password" : "Show password"}
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>

              {/* Confirm Password */}
              <div>
                <label htmlFor="confirm-password" className="block text-xs font-bold text-blue-100 uppercase tracking-wider mb-2">
                  Confirm New Password
                </label>
                <div className="relative rounded-2xl shadow-xs">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-blue-300">
                    <Lock className="h-4 w-4" />
                  </div>
                  <input
                    id="confirm-password"
                    type={showConfirmPassword ? "text" : "password"}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Repeat your password"
                    required
                    minLength={6}
                    autoComplete="new-password"
                    className="block w-full pl-10 pr-11 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-blue-200/50 text-sm font-medium focus:outline-hidden focus:ring-2 focus:ring-amber-400 focus:border-transparent transition-all"
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-blue-300 hover:text-white transition-colors cursor-pointer"
                    title={showConfirmPassword ? "Hide password" : "Show password"}
                  >
                    {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
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
                    <span>Updating Password...</span>
                  </div>
                ) : (
                  <>
                    <span>Update Password</span>
                    <ArrowRight className="h-4 w-4" />
                  </>
                )}
              </button>
            </form>
          )}

          <div className="mt-6 pt-5 border-t border-white/10 text-center">
            <Link
              href="/login"
              className="text-xs font-bold text-blue-200/70 hover:text-white transition-colors"
            >
              Back to Sign In
            </Link>
          </div>
        </div>

        {/* Bottom Trust Badges */}
        <div className="mt-6 flex items-center justify-center gap-4 text-xs font-semibold text-blue-200/60">
          <span className="flex items-center gap-1">
            <ShieldCheck className="h-3.5 w-3.5 text-emerald-400" />
            <span>Secure End-to-End Encryption</span>
          </span>
          <span>•</span>
          <span>SSCZone Verified</span>
        </div>
      </div>
    </div>
  );
}
