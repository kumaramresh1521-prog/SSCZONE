"use client";

import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function UpdatePasswordPage() {
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [done, setDone] = useState(false);
  const router = useRouter();

  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (!user) router.push("/login");
    });
  }, [router]);

  async function handleUpdate(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    const { error: err } = await supabase.auth.updateUser({ password });
    if (err) return setError(err.message);
    setDone(true);
    setTimeout(() => router.push("/login"), 2000);
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50 px-4">
      <div className="w-full max-w-md rounded-xl bg-white p-8 shadow-lg">
        <div className="mb-6 text-center">
          <Link href="/" className="text-2xl font-bold text-primary">SSCZone</Link>
          <p className="mt-2 text-gray-600">Set new password</p>
        </div>
        {done ? (
          <p className="text-center text-green-600">Password updated! Redirecting...</p>
        ) : (
          <form onSubmit={handleUpdate} className="space-y-4">
            <div>
              <label className="text-sm font-medium">New Password</label>
              <input type="password" value={password} onChange={e => setPassword(e.target.value)} className="mt-1 w-full rounded-lg border px-4 py-2" required minLength={6} />
            </div>
            {error && <p className="text-sm text-red-600">{error}</p>}
            <button type="submit" className="w-full rounded-lg bg-primary py-2 font-medium text-white">Update Password</button>
          </form>
        )}
      </div>
    </div>
  );
}
