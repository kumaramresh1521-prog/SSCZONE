"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { useRouter } from "next/navigation";
import Link from "next/link";
import toast from "react-hot-toast";

export default function SettingsPage() {
  const [user, setUser] = useState<any>(null);
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  useEffect(() => {
    supabase.auth.getUser().then(async ({ data: { user } }) => {
      if (!user) return router.push("/login");
      setUser(user);
      const { data: profile } = await supabase.from("profiles").select("*").eq("id", user.id).single();
      if (profile) { setName(profile.full_name || ""); setPhone(profile.phone || ""); }
    });
  }, [router]);

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    const { error } = await supabase.from("profiles").update({ full_name: name, phone }).eq("id", user.id);
    if (error) { toast.error(error.message); setLoading(false); return; }
    toast.success("Profile updated!");
    setLoading(false);
  }

  return (
    <div className="min-h-screen bg-gray-50">
            <div className="mx-auto max-w-2xl px-4 py-12">
        <div className="mb-6 flex items-center justify-between">
          <h1 className="text-2xl font-bold">Settings</h1>
          <Link href="/dashboard" className="text-sm text-primary hover:underline">Back to Dashboard</Link>
        </div>
        <form onSubmit={handleSave} className="rounded-xl bg-white p-8 shadow-sm">
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium">Full Name</label>
              <input type="text" value={name} onChange={e => setName(e.target.value)} className="mt-1 w-full rounded-lg border px-4 py-2" />
            </div>
            <div>
              <label className="text-sm font-medium">Phone</label>
              <input type="tel" value={phone} onChange={e => setPhone(e.target.value)} className="mt-1 w-full rounded-lg border px-4 py-2" />
            </div>
            <div>
              <label className="text-sm font-medium">Email</label>
              <input type="email" value={user?.email || ""} disabled className="mt-1 w-full rounded-lg border bg-gray-100 px-4 py-2 text-gray-500" />
            </div>
            <button type="submit" disabled={loading} className="rounded-lg bg-primary px-6 py-2 text-white disabled:opacity-50">
              {loading ? "Saving..." : "Save Changes"}
            </button>
          </div>
        </form>

        <div className="mt-8 rounded-xl bg-white p-8 shadow-sm">
          <h2 className="text-lg font-semibold">Password</h2>
          <p className="mt-1 text-sm text-gray-500">
            <Link href="/update-password" className="text-primary hover:underline">Click here to change your password</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
