"use client";

import { useState } from "react";
import { supabase } from "@/lib/supabase";
import Link from "next/link";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [sent, setSent] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    const { error: err } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/update-password`,
    });
    if (err) return setError(err.message);
    setSent(true);
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50 px-4">
      <div className="w-full max-w-md rounded-xl bg-white p-8 shadow-lg">
        <div className="mb-6 text-center">
          <Link href="/" className="text-2xl font-bold text-primary">SSCZone</Link>
          <p className="mt-2 text-gray-600">Reset your password</p>
        </div>
        {sent ? (
          <div className="text-center">
            <p className="text-green-600">Check your email for the reset link.</p>
            <Link href="/login" className="mt-4 inline-block text-primary hover:underline">Back to login</Link>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="text-sm font-medium">Email</label>
              <input type="email" value={email} onChange={e => setEmail(e.target.value)} className="mt-1 w-full rounded-lg border px-4 py-2 focus:ring-2 focus:ring-primary" required />
            </div>
            {error && <p className="text-sm text-red-600">{error}</p>}
            <button type="submit" className="w-full rounded-lg bg-primary py-2 font-medium text-white hover:bg-primary-dark">Send Reset Link</button>
          </form>
        )}
        <p className="mt-4 text-center text-sm text-gray-600">
          <Link href="/login" className="text-primary hover:underline">Back to login</Link>
        </p>
      </div>
    </div>
  );
}
